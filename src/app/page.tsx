"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { Suspense } from "react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface PostsResponse {
  posts: Parameters<typeof PostCard>[0]["post"][];
  total: number;
  totalPages: number;
  page: number;
}

function HomeFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get("tag") ?? "";

  const [posts, setPosts] = useState<PostsResponse | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (activeTag) params.set("tag", activeTag);
    const res = await fetch(`/api/posts?${params}`);
    setPosts(await res.json());
  }, [activeTag, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetch("/api/tags").then((r) => r.json()).then(setTags); }, []);

  function setTag(slug: string) {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("tag", slug); else params.delete("tag");
    router.push(`/?${params}`);
  }

  return (
    <div className="flex gap-8">
      {/* Main feed */}
      <div className="flex-1 min-w-0">
        {!posts ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : posts.posts.length === 0 ? (
          <p className="text-gray-400 text-sm">No posts found.</p>
        ) : (
          <>
            {posts.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
            {/* Pagination */}
            {posts.totalPages > 1 && (
              <div className="flex gap-2 justify-center mt-8">
                {[...Array(posts.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded text-sm ${
                      page === i + 1 ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-64 hidden lg:block flex-shrink-0">
        <div className="sticky top-20">
          <h3 className="font-semibold text-sm mb-3">Topics</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag("")}
              className={`text-sm px-3 py-1 rounded-full border ${
                !activeTag ? "bg-black text-white border-black" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.slug}
                onClick={() => setTag(tag.slug)}
                className={`text-sm px-3 py-1 rounded-full border ${
                  activeTag === tag.slug
                    ? "bg-black text-white border-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeFeed />
    </Suspense>
  );
}
