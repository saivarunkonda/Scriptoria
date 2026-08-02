import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, image } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(image !== undefined && { image }),
    },
    select: { id: true, name: true, email: true, bio: true, image: true, username: true },
  });

  return NextResponse.json(updated);
}
