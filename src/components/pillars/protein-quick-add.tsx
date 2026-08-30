"use client";

// Searchable quick-add grid over the local food database. Tapping a food opens
// the confirm sheet (grams shown) rather than logging silently.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  searchFoods,
  type FoodItem,
} from "@/services/data/food-database";

const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#F3EEFF";

/** Shown before the user searches: the highest-yield staples. */
const FEATURED_IDS = [
  "chicken-breast",
  "whey-protein",
  "greek-yogurt-nonfat",
  "egg-whole",
  "protein-shake-premade",
  "ground-beef-90-10",
  "salmon-fillet",
  "cottage-cheese-2",
  "protein-bar",
  "tuna-canned",
  "chicken-rice-bowl",
  "tofu-firm",
];

interface ProteinQuickAddProps {
  onSelect: (food: FoodItem) => void;
}

export function ProteinQuickAdd({ onSelect }: ProteinQuickAddProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed !== "") return searchFoods(trimmed);
    const all = searchFoods("");
    const featured = FEATURED_IDS.map((id) =>
      all.find((f) => f.id === id),
    ).filter((f): f is FoodItem => f != null);
    if (showAll) {
      const seen = new Set(featured.map((f) => f.id));
      return [...featured, ...all.filter((f) => !seen.has(f.id))];
    }
    return featured;
  }, [query, showAll]);

  const searching = query.trim() !== "";

  return (
    <div>
      <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E5E8] bg-white px-3 transition-colors focus-within:border-[#7C3AED]">
        <Search size={15} className="shrink-0 text-[#9E9EA3]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods"
          aria-label="Search foods"
          className="w-full bg-transparent py-2.5 text-[14px] text-[#1A1A1E] outline-none placeholder:text-[#C0C0C6]"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 text-[12px] font-medium text-[#9E9EA3] hover:text-[#1A1A1E]"
          >
            Clear
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="mt-3 text-[13px] text-[#9E9EA3]">
          No foods match “{query.trim()}”. Use manual entry below.
        </p>
      ) : (
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {results.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => onSelect(food)}
              className="flex flex-col items-start rounded-[12px] border border-[#E5E5E8] bg-white px-3 py-2.5 text-left transition-colors hover:bg-[#FBFAFF]"
            >
              <span className="line-clamp-2 text-[13px] font-medium leading-snug text-[#1A1A1E]">
                {food.name}
              </span>
              <span className="mt-1 flex items-baseline gap-1.5">
                <span
                  className="rounded-[6px] px-1.5 py-0.5 font-mono text-[12px] font-semibold"
                  style={{ background: PURPLE_LIGHT, color: PURPLE }}
                >
                  {Math.round(food.proteinG)}g
                </span>
                <span className="text-[11px] text-[#9E9EA3]">
                  {food.servingLabel}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {!searching && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2.5 text-[12px] font-semibold text-[#7C3AED]"
        >
          {showAll ? "Show fewer" : "Show all foods"}
        </button>
      )}
    </div>
  );
}
