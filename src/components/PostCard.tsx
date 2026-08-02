import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: string | Date;
    author: {
      name: string | null;
      image: string | null;
      username: string | null;
    };
    tags: { tag: { name: string; slug: string } }[];
    _count: { likes: number; comments: number };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name ?? ""}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
              {post.author.name?.[0]}
            </div>
          )}
          <span className="text-sm text-gray-600">{post.author.name}</span>
        </div>

        {/* Title & excerpt */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 hover:text-gray-700 leading-snug mb-1">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
          )}
        </Link>

        {/* Footer */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>{formatDate(post.createdAt)}</span>
          {post.tags.slice(0, 3).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/?tag=${tag.slug}`}
              className="bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
          <span>♥ {post._count.likes}</span>
          <span>💬 {post._count.comments}</span>
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`} className="flex-shrink-0">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={128}
            height={88}
            className="rounded object-cover w-32 h-22"
          />
        </Link>
      )}
    </article>
  );
}
