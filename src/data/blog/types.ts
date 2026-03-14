export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: "strength" | "stability" | "cardio" | "nutrition" | "longevity";
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  keywords: string[];
  body: string;
  faqs: { question: string; answer: string }[];
}

export type BlogCategory = BlogPost["category"];

export const BLOG_CATEGORIES: {
  key: BlogCategory;
  label: string;
  color: string;
}[] = [
  { key: "strength", label: "Strength", color: "#E8501A" },
  { key: "stability", label: "Stability", color: "#1A7A6D" },
  { key: "cardio", label: "Cardio", color: "#2563EB" },
  { key: "nutrition", label: "Nutrition", color: "#7C3AED" },
  { key: "longevity", label: "Longevity", color: "#6B6B73" },
];
