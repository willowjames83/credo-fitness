"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPost } from "@/data/blog/types";
import { BLOG_CATEGORIES } from "@/data/blog/types";
import { formatDate } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const cat = BLOG_CATEGORIES.find((c) => c.key === post.category);

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="relative h-full rounded-2xl border border-white/[0.06] bg-[#1A1A1E] p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 overflow-hidden"
      >
        {/* Hover glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: cat?.color ?? "#E8501A", opacity: undefined }}
        />
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: cat?.color ?? "#E8501A" }}
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                color: cat?.color ?? "#9E9EA3",
                backgroundColor: `${cat?.color ?? "#9E9EA3"}15`,
              }}
            >
              {cat?.label ?? post.category}
            </span>
            <span className="text-xs text-[#6B6B73]">
              {post.readTime} min read
            </span>
          </div>
          <h3 className="mb-2 text-[17px] font-semibold leading-snug text-white group-hover:text-[#E8501A] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-[#9E9EA3] line-clamp-2">
            {post.description}
          </p>
          <time className="text-xs text-[#6B6B73]">
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </motion.article>
    </Link>
  );
}
