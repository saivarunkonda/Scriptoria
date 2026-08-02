import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug, stripHtml, truncate } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true, username: true, bio: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.published && post.authorId !== session?.user?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content, tags, coverImage, published } = await req.json();
  const excerpt = content ? truncate(stripHtml(content), 200) : undefined;
  const newSlug = title ? createSlug(title) + "-" + Date.now().toString(36) : undefined;

  // Replace tags
  await prisma.postTag.deleteMany({ where: { postId: post.id } });

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      ...(title && { title }),
      ...(newSlug && { slug: newSlug }),
      ...(content && { content, excerpt }),
      ...(coverImage !== undefined && { coverImage }),
      ...(published !== undefined && { published }),
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

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: post.id } });
  return NextResponse.json({ success: true });
}
