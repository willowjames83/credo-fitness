import type { BlogPost } from "./types";
import { strengthPosts } from "./strength-posts";
import { stabilityPosts } from "./stability-posts";
import { cardioPosts } from "./cardio-posts";
import { nutritionPosts } from "./nutrition-posts";
import { longevityPosts } from "./longevity-posts";

export const allPosts: BlogPost[] = [
  ...strengthPosts,
  ...stabilityPosts,
  ...cardioPosts,
  ...nutritionPosts,
  ...longevityPosts,
].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
