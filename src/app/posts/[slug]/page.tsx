"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CommentSection from "@/components/CommentSection";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
  published: boolean;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
    bio: string | null;
  };
  tags: { tag: { name: string; slug: string } }[];
  _count: { likes: number; comments: number };
  likes?: { id: string }[];
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setPost(data);
        setLikeCount(data._count.likes);
        setLiked(!!data.likes?.length);
      });
  }, [slug]);

  async function toggleLike() {
    if (!session) { toast.error("Sign in to like posts"); return; }
    const res = await fetch(`/api/posts/${slug}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (res.ok) { toast.success("Post deleted"); router.push("/"); }
  }

  if (notFound) return <div className="text-center py-20 text-gray-400">Post not found.</div>;
  if (!post) return <div className="text-center py-20 text-gray-300">Loading...</div>;

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {!post.published && (
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-3">
            Draft
          </span>
        )}
        <h1 className="text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name ?? ""}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                {post.author.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{post.author.name}</p>
              <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex gap-2">
              <Link
                href={`/posts/${slug}/edit`}
                className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={deletePost}
                className="text-sm border px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-500 border-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/?tag=${tag.slug}`}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={400}
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-gray max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Like button */}
      <div className="flex items-center gap-4 py-6 border-t border-b mb-12">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            liked
              ? "bg-red-50 text-red-500 border border-red-200"
              : "border hover:bg-gray-50"
          }`}
        >
          ♥ {likeCount} {liked ? "Liked" : "Like"}
        </button>
      </div>

      {/* Author bio */}
      {post.author.bio && (
        <div className="bg-gray-50 rounded-xl p-6 mb-12 flex gap-4">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name ?? ""}
              width={48}
              height={48}
              className="rounded-full flex-shrink-0"
            />
          )}
          <div>
            <p className="font-semibold mb-1">{post.author.name}</p>
            <p className="text-sm text-gray-600">{post.author.bio}</p>
          </div>
        </div>
      )}

      <CommentSection slug={slug} />
    </article>
  );
}
