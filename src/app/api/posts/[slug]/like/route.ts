import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId: post.id } });
    return NextResponse.json({ liked: false, count });
  } else {
    await prisma.like.create({ data: { userId: session.user.id, postId: post.id } });
    const count = await prisma.like.count({ where: { postId: post.id } });
    return NextResponse.json({ liked: true, count });
  }
}
