"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState({ name: "", bio: "", image: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name ?? "",
        bio: (session.user as { bio?: string }).bio ?? "",
        image: session.user.image ?? "",
      });
    }
  }, [session]);

  if (!session) {
    redirect("/auth/signin");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await update();
      toast.success("Profile updated");
    } else {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

      <div className="flex items-center gap-4 mb-8">
        {form.image ? (
          <Image src={form.image} alt={form.name} width={64} height={64} className="rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium">
            {form.name?.[0]}
          </div>
        )}
        <div>
          <p className="font-semibold">{session.user?.name}</p>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Tell readers about yourself..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
