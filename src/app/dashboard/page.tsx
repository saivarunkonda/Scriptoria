"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Post {
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/posts?author=${(session.user as { username?: string }).username}&limit=50`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []));
  }, [session]);

  if (!session) redirect("/auth/signin");

  async function remove(slug: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Deleted");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Link
          href="/posts/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No posts yet.</p>
          <Link href="/posts/new" className="underline text-sm">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
                <p className="font-medium text-sm truncate">{post.title}</p>
                <p className="text-xs text-gray-400">
                  ♥ {post._count.likes} · 💬 {post._count.comments}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-xs border px-2.5 py-1.5 rounded hover:bg-gray-100"
                >
                  View
                </Link>
                <Link
                  href={`/posts/${post.slug}/edit`}
                  className="text-xs border px-2.5 py-1.5 rounded hover:bg-gray-100"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(post.slug)}
                  className="text-xs border px-2.5 py-1.5 rounded hover:bg-red-50 text-red-500 border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
