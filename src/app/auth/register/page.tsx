"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Account created! Signing you in...");
      await signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/" });
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-8 text-center">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["name", "email", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
            <input
              type={field === "email" ? "email" : field === "password" ? "password" : "text"}
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
              required
              minLength={field === "password" ? 8 : 1}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
