"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { BlogPost } from "@/data/blog/types";
import { BLOG_CATEGORIES } from "@/data/blog/types";
import { formatDate, getRelatedPosts } from "@/lib/blog";
import { BlogCard } from "./blog-card";
import { ArrowLeft, ChevronDown } from "lucide-react";

function FAQItem({ faq, index }: { faq: { question: string; answer: string }; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-white/[0.06] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <h3 className="text-[15px] font-semibold text-white pr-4">
          {faq.question}
        </h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-[#9E9EA3]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#9E9EA3]">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQSection({ faqs }: { faqs: BlogPost["faqs"] }) {
  return (
    <div className="mt-12 border-t border-white/[0.06] pt-10">
      <h2 className="mb-4 font-[family-name:var(--font-dm-serif)] text-xl text-white">
        Frequently Asked Questions
      </h2>
      <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1E] divide-y divide-white/[0.06] px-6">
        {faqs.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}
      </div>
    </div>
  );
}

export function BlogPostLayout({ post }: { post: BlogPost }) {
  const cat = BLOG_CATEGORIES.find((c) => c.key === post.category);
  const related = getRelatedPosts(post.slug, post.category, 3);

  return (
    <div className="min-h-screen bg-[#0D0D0F] bg-noise relative">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-12 relative">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-[#9E9EA3] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-3">
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
          <h1 className="mb-4 font-[family-name:var(--font-dm-serif)] text-3xl leading-tight text-white md:text-[2.5rem]">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[#6B6B73]">
            <span>Credo Team</span>
            <span>&middot;</span>
            <time>{formatDate(post.publishedAt)}</time>
            {post.updatedAt !== post.publishedAt && (
              <>
                <span>&middot;</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>
        </motion.header>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-none text-[#E8E8EC] text-[16px] leading-[1.8] [&_h2]:font-[family-name:var(--font-dm-serif)] [&_h2]:text-white [&_h2]:font-normal [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-[family-name:var(--font-dm-serif)] [&_h3]:text-white [&_h3]:font-normal [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_a]:text-[#E8501A] [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-white [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E8501A] [&_blockquote]:pl-4 [&_blockquote]:text-[#C8C8CC] [&_blockquote]:italic [&_blockquote]:font-[family-name:var(--font-dm-serif)]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* FAQs */}
        {post.faqs.length > 0 && <FAQSection faqs={post.faqs} />}

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-white/[0.06] bg-[#1A1A1E] p-5">
          <p className="text-xs leading-relaxed text-[#6B6B73]">
            <strong className="text-[#9E9EA3]">Disclaimer:</strong> This
            content is for educational purposes only and is not medical advice.
            Consult a qualified healthcare provider before starting any exercise
            or nutrition program. Individual results vary.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 relative rounded-2xl bg-[#1A1A1E] p-8 text-center overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-[#E8501A] rounded-full opacity-[0.04] blur-[80px] pointer-events-none" />
          <div className="relative">
            <h3 className="mb-2 font-[family-name:var(--font-dm-serif)] text-lg text-white">
              Train for the body you want today, and need at 80.
            </h3>
            <p className="mb-5 text-sm text-[#9E9EA3]">
              Strength, stability, cardio, and nutrition. One app. One score.
            </p>
            <a
              href="#"
              className="inline-flex items-center rounded-full bg-[#E8501A] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[#d14716] transition-all hover:shadow-lg hover:shadow-[#E8501A]/20"
            >
              Get Started Free
            </a>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-6 font-[family-name:var(--font-dm-serif)] text-lg text-white">
              Related Articles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
