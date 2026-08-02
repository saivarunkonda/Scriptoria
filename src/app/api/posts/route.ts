import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug, stripHtml, truncate } from "@/lib/utils";

// GET /api/posts — list published posts with filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const author = searchParams.get("author");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const where = {
    published: true,
    ...(tag && { tags: { some: { tag: { slug: tag } } } }),
    ...(author && { author: { username: author } }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/posts — create a post
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, tags, coverImage, published } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const baseSlug = createSlug(title);
  const slug = baseSlug + "-" + Date.now().toString(36);
  const excerpt = truncate(stripHtml(content), 200);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      published: published ?? false,
      authorId: session.user.id,
      tags: tags?.length
        ? {
            create: await Promise.all(
              (tags as string[]).map(async (name: string) => {
                const tagSlug = createSlug(name);
                const tag = await prisma.tag.upsert({
                  where: { slug: tagSlug },
                  create: { name, slug: tagSlug },
                  update: {},
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    },
    include: {
      author: { select: { id: true, name: true, image: true, username: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
