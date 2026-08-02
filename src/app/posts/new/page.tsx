"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    coverImage: "",
    published: false,
  });
  const [saving, setSaving] = useState(false);

  async function save(published: boolean) {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags, published }),
    });

    if (res.ok) {
      const post = await res.json();
      toast.success(published ? "Post published!" : "Draft saved");
      router.push(`/posts/${post.slug}`);
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save post");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Post</h1>
        <div className="flex gap-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Post title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full text-3xl font-bold border-0 border-b pb-3 focus:outline-none focus:border-black placeholder:text-gray-300"
        />

        <input
          type="text"
          placeholder="Cover image URL (optional)"
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        <input
          type="text"
          placeholder="Tags (comma separated: react, typescript, webdev)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        <Editor
          content={form.content}
          onChange={(html) => setForm({ ...form, content: html })}
        />
      </div>
    </div>
  );
}
