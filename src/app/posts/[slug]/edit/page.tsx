"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    coverImage: "",
    published: false,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then((post) => {
        setForm({
          title: post.title,
          content: post.content,
          tags: post.tags.map((t: { tag: { name: string } }) => t.tag.name).join(", "),
          coverImage: post.coverImage ?? "",
          published: post.published,
        });
        setLoaded(true);
      });
  }, [slug]);

  async function save(published: boolean) {
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const res = await fetch(`/api/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags, published }),
    });

    if (res.ok) {
      const post = await res.json();
      toast.success("Saved");
      router.push(`/posts/${post.slug}`);
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  if (!loaded) return <div className="text-center py-20 text-gray-300">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Post</h1>
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
          className="w-full text-3xl font-bold border-0 border-b pb-3 focus:outline-none focus:border-black"
        />
        <input
          type="text"
          placeholder="Cover image URL"
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
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
