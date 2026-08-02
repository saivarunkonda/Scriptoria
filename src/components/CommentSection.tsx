"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  replies?: CommentData[];
}

function Avatar({ author }: { author: Author }) {
  return author.image ? (
    <Image src={author.image} alt={author.name ?? ""} width={32} height={32} className="rounded-full" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
      {author.name?.[0]}
    </div>
  );
}

function CommentItem({
  comment,
  slug,
  onReply,
}: {
  comment: CommentData;
  slug: string;
  onReply: (comment: CommentData) => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar author={comment.author} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{comment.author.name}</span>
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-gray-700 text-sm">{comment.content}</p>
        <button
          onClick={() => onReply(comment)}
          className="text-xs text-gray-400 hover:text-gray-700 mt-1"
        >
          Reply
        </button>

        {comment.replies?.length ? (
          <div className="mt-3 space-y-3 pl-4 border-l border-gray-100">
            {comment.replies.map((r) => (
              <CommentItem key={r.id} comment={r} slug={slug} onReply={onReply} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CommentSection({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId: replyTo?.id }),
    });

    if (res.ok) {
      const newComment = await res.json();
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies ?? []), newComment] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, { ...newComment, replies: [] }]);
      }
      setText("");
      setReplyTo(null);
      toast.success("Comment posted");
    } else {
      toast.error("Failed to post comment");
    }
    setLoading(false);
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6">
        Comments ({comments.reduce((a, c) => a + 1 + (c.replies?.length ?? 0), 0)})
      </h2>

      {/* Comment form */}
      {session ? (
        <form onSubmit={submit} className="mb-8">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
              Replying to <strong>{replyTo.author.name}</strong>
              <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-2 bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-800 transition"
          >
            {loading ? "Posting..." : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-gray-500">
          <a href="/auth/signin" className="underline">Sign in</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} slug={slug} onReply={setReplyTo} />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        )}
      </div>
    </section>
  );
}
