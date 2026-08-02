"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          BlogSpace
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/posts/new"
                className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition"
              >
                Write
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                      {session.user?.name?.[0]}
                    </div>
                  )}
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-1"
                    onBlur={() => setMenuOpen(false)}
                  >
                    <Link
                      href={`/profile`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Posts
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-black">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
