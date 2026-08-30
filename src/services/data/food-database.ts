// Credo quick-add food database for protein logging.
// Ported from the iOS app's FoodDatabase.swift, keeping the protein-forward
// entries most useful for hitting a daily protein target. Values are per the
// listed serving.

export type FoodCategory =
  | "meat"
  | "seafood"
  | "eggs"
  | "dairy"
  | "plant"
  | "supplement"
  | "meal"
  | "snack";

export interface FoodItem {
  id: string;
  name: string;
  proteinG: number;
  calories: number;
  servingLabel: string;
  category: FoodCategory;
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── Meat & poultry ───────────────────────────────────────────────────
  { id: "chicken-breast", name: "Chicken Breast", proteinG: 31, calories: 165, servingLabel: "4 oz", category: "meat" },
  { id: "chicken-thigh", name: "Chicken Thigh", proteinG: 26, calories: 209, servingLabel: "4 oz", category: "meat" },
  { id: "ground-turkey-93-7", name: "Ground Turkey 93/7", proteinG: 21, calories: 170, servingLabel: "4 oz", category: "meat" },
  { id: "ground-beef-90-10", name: "Ground Beef 90/10", proteinG: 22, calories: 200, servingLabel: "4 oz", category: "meat" },
  { id: "ground-beef-80-20", name: "Ground Beef 80/20", proteinG: 19, calories: 287, servingLabel: "4 oz", category: "meat" },
  { id: "sirloin-steak", name: "Sirloin Steak", proteinG: 26, calories: 207, servingLabel: "4 oz", category: "meat" },
  { id: "ribeye-steak", name: "Ribeye Steak", proteinG: 24, calories: 291, servingLabel: "4 oz", category: "meat" },
  { id: "pork-tenderloin", name: "Pork Tenderloin", proteinG: 26, calories: 143, servingLabel: "4 oz", category: "meat" },
  { id: "turkey-breast-deli", name: "Turkey Breast (deli)", proteinG: 12, calories: 60, servingLabel: "2 oz", category: "meat" },
  { id: "beef-jerky", name: "Beef Jerky", proteinG: 9, calories: 82, servingLabel: "1 oz", category: "snack" },

  // ── Seafood ──────────────────────────────────────────────────────────
  { id: "salmon-fillet", name: "Salmon Fillet", proteinG: 20, calories: 208, servingLabel: "4 oz", category: "seafood" },
  { id: "tuna-canned", name: "Tuna (canned in water)", proteinG: 28, calories: 120, servingLabel: "1 can (5 oz)", category: "seafood" },
  { id: "shrimp", name: "Shrimp", proteinG: 24, calories: 100, servingLabel: "4 oz", category: "seafood" },
  { id: "tilapia", name: "Tilapia", proteinG: 23, calories: 110, servingLabel: "4 oz", category: "seafood" },
  { id: "cod-fillet", name: "Cod Fillet", proteinG: 20, calories: 93, servingLabel: "4 oz", category: "seafood" },

  // ── Eggs ─────────────────────────────────────────────────────────────
  { id: "egg-whole", name: "Egg (whole)", proteinG: 6.3, calories: 72, servingLabel: "1 large", category: "eggs" },
  { id: "egg-whites", name: "Egg Whites", proteinG: 3.6, calories: 17, servingLabel: "1 large", category: "eggs" },
  { id: "eggs-on-toast", name: "Eggs on Toast", proteinG: 18, calories: 280, servingLabel: "2 eggs + 2 slices", category: "meal" },

  // ── Dairy ────────────────────────────────────────────────────────────
  { id: "greek-yogurt-nonfat", name: "Greek Yogurt (nonfat)", proteinG: 17, calories: 100, servingLabel: "3/4 cup (170g)", category: "dairy" },
  { id: "greek-yogurt-whole", name: "Greek Yogurt (whole)", proteinG: 14, calories: 150, servingLabel: "3/4 cup (170g)", category: "dairy" },
  { id: "cottage-cheese-2", name: "Cottage Cheese (2%)", proteinG: 12, calories: 90, servingLabel: "1/2 cup", category: "dairy" },
  { id: "whole-milk", name: "Whole Milk", proteinG: 8, calories: 149, servingLabel: "1 cup", category: "dairy" },
  { id: "skim-milk", name: "Skim Milk", proteinG: 8, calories: 83, servingLabel: "1 cup", category: "dairy" },
  { id: "cheddar-cheese", name: "Cheddar Cheese", proteinG: 7, calories: 113, servingLabel: "1 oz", category: "dairy" },
  { id: "mozzarella-part-skim", name: "Mozzarella (part-skim)", proteinG: 7, calories: 86, servingLabel: "1 oz", category: "dairy" },
  { id: "string-cheese", name: "String Cheese", proteinG: 7, calories: 80, servingLabel: "1 stick", category: "snack" },

  // ── Plant proteins ───────────────────────────────────────────────────
  { id: "tofu-firm", name: "Tofu (firm)", proteinG: 10, calories: 88, servingLabel: "1/2 cup", category: "plant" },
  { id: "tempeh", name: "Tempeh", proteinG: 20, calories: 192, servingLabel: "4 oz", category: "plant" },
  { id: "edamame", name: "Edamame (shelled)", proteinG: 17, calories: 188, servingLabel: "1 cup", category: "plant" },
  { id: "black-beans", name: "Black Beans (cooked)", proteinG: 15, calories: 227, servingLabel: "1 cup", category: "plant" },
  { id: "lentils", name: "Lentils (cooked)", proteinG: 18, calories: 230, servingLabel: "1 cup", category: "plant" },
  { id: "peanut-butter", name: "Peanut Butter", proteinG: 8, calories: 188, servingLabel: "2 tbsp", category: "plant" },
  { id: "almonds", name: "Almonds", proteinG: 6, calories: 164, servingLabel: "1 oz (23 nuts)", category: "snack" },

  // ── Supplements & shakes ─────────────────────────────────────────────
  { id: "whey-protein", name: "Whey Protein Powder", proteinG: 24, calories: 120, servingLabel: "1 scoop (32g)", category: "supplement" },
  { id: "casein-protein", name: "Casein Protein Powder", proteinG: 24, calories: 120, servingLabel: "1 scoop (33g)", category: "supplement" },
  { id: "protein-shake-premade", name: "Protein Shake (premade)", proteinG: 30, calories: 160, servingLabel: "1 bottle (14 oz)", category: "supplement" },
  { id: "protein-bar", name: "Protein Bar", proteinG: 20, calories: 210, servingLabel: "1 bar", category: "supplement" },
  { id: "protein-smoothie", name: "Protein Smoothie", proteinG: 30, calories: 350, servingLabel: "16 oz", category: "supplement" },

  // ── Meals ────────────────────────────────────────────────────────────
  { id: "chicken-rice-bowl", name: "Chicken & Rice Bowl", proteinG: 40, calories: 450, servingLabel: "1 bowl", category: "meal" },
  { id: "steak-baked-potato", name: "Steak & Baked Potato", proteinG: 38, calories: 520, servingLabel: "1 plate", category: "meal" },
  { id: "salmon-roasted-veggies", name: "Salmon & Roasted Veggies", proteinG: 30, calories: 380, servingLabel: "1 plate", category: "meal" },
  { id: "turkey-sandwich", name: "Turkey Sandwich", proteinG: 28, calories: 350, servingLabel: "1 sandwich", category: "meal" },
  { id: "protein-oatmeal", name: "Protein Oatmeal", proteinG: 30, calories: 340, servingLabel: "1 bowl", category: "meal" },
  { id: "ground-beef-rice", name: "Ground Beef & Rice", proteinG: 32, calories: 480, servingLabel: "1 bowl", category: "meal" },
  { id: "burrito-bowl-chicken", name: "Burrito Bowl (chicken)", proteinG: 42, calories: 580, servingLabel: "1 bowl", category: "meal" },
  { id: "tuna-wrap", name: "Tuna Wrap", proteinG: 32, calories: 320, servingLabel: "1 wrap", category: "meal" },
  { id: "greek-yogurt-parfait", name: "Greek Yogurt Parfait", proteinG: 22, calories: 310, servingLabel: "1 bowl", category: "meal" },
];

export function searchFoods(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_DATABASE;
  return FOOD_DATABASE.filter((item) => item.name.toLowerCase().includes(q));
}
