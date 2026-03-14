"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { BLOG_CATEGORIES, type BlogCategory } from "@/data/blog/types";
import Link from "next/link";

const posts = getAllPosts();

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">(
    "all"
  );

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0D0D0F] bg-noise relative">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 relative">
        {/* Nav back */}
        <Link
          href="/"
          className="mb-8 inline-block text-xs font-bold tracking-[2.5px] uppercase text-[#E8501A]"
        >
          CREDO
        </Link>

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-3 font-[family-name:var(--font-dm-serif)] text-3xl text-white md:text-[2.75rem] leading-tight">
            The Credo Blog
          </h1>
          <p className="text-[#9E9EA3] text-lg max-w-xl">
            Science-backed training for people who want to be strong, active,
            and metabolically healthy at 80.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="mb-10 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-white text-[#0D0D0F] shadow-lg shadow-white/10"
                : "bg-white/[0.05] text-[#9E9EA3] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            All
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive
                    ? cat.color
                    : "rgba(255,255,255,0.05)",
                  color: isActive ? "#fff" : "#9E9EA3",
                  boxShadow: isActive
                    ? `0 4px 20px ${cat.color}30`
                    : "none",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-[#6B6B73]">No posts found.</p>
        )}
      </div>
    </div>
  );
}
