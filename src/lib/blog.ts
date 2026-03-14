import { allPosts } from "@/data/blog";
import type { BlogPost, BlogCategory } from "@/data/blog/types";

export function getAllPosts(): BlogPost[] {
  return allPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return allPosts.filter((p) => p.category === category);
}

export function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  limit = 3
): BlogPost[] {
  return allPosts
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, limit);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
