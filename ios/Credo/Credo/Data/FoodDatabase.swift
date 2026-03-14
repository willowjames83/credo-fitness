import Foundation

struct FoodDatabase {

    /// Common foods with real nutritional values per serving.
    static let items: [FoodItem] = proteins + carbs + fats + dairy + meals + beverages + fruits + vegetables

    // MARK: - Proteins

    static let proteins: [FoodItem] = [
        FoodItem(id: "chicken_breast", name: "Chicken Breast", caloriesPerServing: 165, proteinPerServing: 31, carbsPerServing: 0, fatPerServing: 3.6, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "chicken_thigh", name: "Chicken Thigh", caloriesPerServing: 209, proteinPerServing: 26, carbsPerServing: 0, fatPerServing: 10.9, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "ground_turkey_93", name: "Ground Turkey 93/7", caloriesPerServing: 170, proteinPerServing: 21, carbsPerServing: 0, fatPerServing: 9, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "ground_beef_90", name: "Ground Beef 90/10", caloriesPerServing: 200, proteinPerServing: 22, carbsPerServing: 0, fatPerServing: 11, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "ground_beef_80", name: "Ground Beef 80/20", caloriesPerServing: 287, proteinPerServing: 19, carbsPerServing: 0, fatPerServing: 23, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "salmon", name: "Salmon Fillet", caloriesPerServing: 208, proteinPerServing: 20, carbsPerServing: 0, fatPerServing: 13, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "tuna_canned", name: "Tuna (canned in water)", caloriesPerServing: 120, proteinPerServing: 28, carbsPerServing: 0, fatPerServing: 1, servingSize: "1 can (5 oz)", servingSizeG: 142),
        FoodItem(id: "shrimp", name: "Shrimp", caloriesPerServing: 100, proteinPerServing: 24, carbsPerServing: 0, fatPerServing: 0.3, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "tilapia", name: "Tilapia", caloriesPerServing: 110, proteinPerServing: 23, carbsPerServing: 0, fatPerServing: 2.3, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "eggs_whole", name: "Eggs (whole)", caloriesPerServing: 72, proteinPerServing: 6.3, carbsPerServing: 0.4, fatPerServing: 4.8, servingSize: "1 large", servingSizeG: 50),
        FoodItem(id: "egg_whites", name: "Egg Whites", caloriesPerServing: 17, proteinPerServing: 3.6, carbsPerServing: 0.2, fatPerServing: 0.1, servingSize: "1 large", servingSizeG: 33),
        FoodItem(id: "steak_sirloin", name: "Sirloin Steak", caloriesPerServing: 207, proteinPerServing: 26, carbsPerServing: 0, fatPerServing: 11, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "steak_ribeye", name: "Ribeye Steak", caloriesPerServing: 291, proteinPerServing: 24, carbsPerServing: 0, fatPerServing: 21, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "pork_tenderloin", name: "Pork Tenderloin", caloriesPerServing: 143, proteinPerServing: 26, carbsPerServing: 0, fatPerServing: 3.5, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "tofu_firm", name: "Tofu (firm)", caloriesPerServing: 88, proteinPerServing: 10, carbsPerServing: 2.2, fatPerServing: 5, servingSize: "1/2 cup", servingSizeG: 126),
        FoodItem(id: "tempeh", name: "Tempeh", caloriesPerServing: 192, proteinPerServing: 20, carbsPerServing: 8, fatPerServing: 11, servingSize: "4 oz", servingSizeG: 113),
        FoodItem(id: "whey_protein", name: "Whey Protein Powder", caloriesPerServing: 120, proteinPerServing: 24, carbsPerServing: 3, fatPerServing: 1.5, servingSize: "1 scoop (32g)", servingSizeG: 32),
        FoodItem(id: "casein_protein", name: "Casein Protein Powder", caloriesPerServing: 120, proteinPerServing: 24, carbsPerServing: 3, fatPerServing: 1, servingSize: "1 scoop (33g)", servingSizeG: 33),
        FoodItem(id: "turkey_breast_deli", name: "Turkey Breast (deli)", caloriesPerServing: 60, proteinPerServing: 12, carbsPerServing: 1, fatPerServing: 0.5, servingSize: "2 oz", servingSizeG: 56),
        FoodItem(id: "cod", name: "Cod Fillet", caloriesPerServing: 93, proteinPerServing: 20, carbsPerServing: 0, fatPerServing: 0.8, servingSize: "4 oz", servingSizeG: 113),
    ]

    // MARK: - Carbs

    static let carbs: [FoodItem] = [
        FoodItem(id: "white_rice", name: "White Rice (cooked)", caloriesPerServing: 206, proteinPerServing: 4.3, carbsPerServing: 45, fatPerServing: 0.4, servingSize: "1 cup", servingSizeG: 158),
        FoodItem(id: "brown_rice", name: "Brown Rice (cooked)", caloriesPerServing: 216, proteinPerServing: 5, carbsPerServing: 45, fatPerServing: 1.8, servingSize: "1 cup", servingSizeG: 195),
        FoodItem(id: "oats", name: "Oats (dry)", caloriesPerServing: 150, proteinPerServing: 5, carbsPerServing: 27, fatPerServing: 2.5, servingSize: "1/2 cup (40g)", servingSizeG: 40),
        FoodItem(id: "pasta_cooked", name: "Pasta (cooked)", caloriesPerServing: 220, proteinPerServing: 8, carbsPerServing: 43, fatPerServing: 1.3, servingSize: "1 cup", servingSizeG: 140),
        FoodItem(id: "whole_wheat_bread", name: "Whole Wheat Bread", caloriesPerServing: 81, proteinPerServing: 4, carbsPerServing: 14, fatPerServing: 1.1, servingSize: "1 slice", servingSizeG: 33),
        FoodItem(id: "white_bread", name: "White Bread", caloriesPerServing: 75, proteinPerServing: 2.7, carbsPerServing: 14, fatPerServing: 1, servingSize: "1 slice", servingSizeG: 30),
        FoodItem(id: "potato", name: "Potato (baked)", caloriesPerServing: 161, proteinPerServing: 4.3, carbsPerServing: 37, fatPerServing: 0.2, servingSize: "1 medium", servingSizeG: 173),
        FoodItem(id: "sweet_potato", name: "Sweet Potato (baked)", caloriesPerServing: 103, proteinPerServing: 2.3, carbsPerServing: 24, fatPerServing: 0.1, servingSize: "1 medium", servingSizeG: 114),
        FoodItem(id: "quinoa", name: "Quinoa (cooked)", caloriesPerServing: 222, proteinPerServing: 8, carbsPerServing: 39, fatPerServing: 3.6, servingSize: "1 cup", servingSizeG: 185),
        FoodItem(id: "tortilla_flour", name: "Flour Tortilla", caloriesPerServing: 140, proteinPerServing: 3.6, carbsPerServing: 24, fatPerServing: 3.5, servingSize: "1 large (10\")", servingSizeG: 64),
        FoodItem(id: "bagel", name: "Bagel (plain)", caloriesPerServing: 270, proteinPerServing: 10, carbsPerServing: 53, fatPerServing: 1.5, servingSize: "1 bagel", servingSizeG: 105),
        FoodItem(id: "granola", name: "Granola", caloriesPerServing: 210, proteinPerServing: 5, carbsPerServing: 29, fatPerServing: 9, servingSize: "1/2 cup", servingSizeG: 55),
        FoodItem(id: "cream_of_rice", name: "Cream of Rice (dry)", caloriesPerServing: 170, proteinPerServing: 3, carbsPerServing: 38, fatPerServing: 0, servingSize: "1/4 cup (40g)", servingSizeG: 40),
    ]

    // MARK: - Fats

    static let fats: [FoodItem] = [
        FoodItem(id: "avocado", name: "Avocado", caloriesPerServing: 240, proteinPerServing: 3, carbsPerServing: 13, fatPerServing: 22, servingSize: "1 medium", servingSizeG: 150),
        FoodItem(id: "olive_oil", name: "Olive Oil", caloriesPerServing: 119, proteinPerServing: 0, carbsPerServing: 0, fatPerServing: 14, servingSize: "1 tbsp", servingSizeG: 14),
        FoodItem(id: "almonds", name: "Almonds", caloriesPerServing: 164, proteinPerServing: 6, carbsPerServing: 6, fatPerServing: 14, servingSize: "1 oz (23 nuts)", servingSizeG: 28),
        FoodItem(id: "peanut_butter", name: "Peanut Butter", caloriesPerServing: 188, proteinPerServing: 8, carbsPerServing: 6, fatPerServing: 16, servingSize: "2 tbsp", servingSizeG: 32),
        FoodItem(id: "almond_butter", name: "Almond Butter", caloriesPerServing: 196, proteinPerServing: 7, carbsPerServing: 6, fatPerServing: 18, servingSize: "2 tbsp", servingSizeG: 32),
        FoodItem(id: "walnuts", name: "Walnuts", caloriesPerServing: 185, proteinPerServing: 4.3, carbsPerServing: 3.9, fatPerServing: 18, servingSize: "1 oz", servingSizeG: 28),
        FoodItem(id: "cashews", name: "Cashews", caloriesPerServing: 157, proteinPerServing: 5.2, carbsPerServing: 8.6, fatPerServing: 12, servingSize: "1 oz", servingSizeG: 28),
        FoodItem(id: "coconut_oil", name: "Coconut Oil", caloriesPerServing: 121, proteinPerServing: 0, carbsPerServing: 0, fatPerServing: 14, servingSize: "1 tbsp", servingSizeG: 14),
        FoodItem(id: "butter", name: "Butter", caloriesPerServing: 102, proteinPerServing: 0.1, carbsPerServing: 0, fatPerServing: 12, servingSize: "1 tbsp", servingSizeG: 14),
        FoodItem(id: "chia_seeds", name: "Chia Seeds", caloriesPerServing: 138, proteinPerServing: 4.7, carbsPerServing: 12, fatPerServing: 8.7, servingSize: "1 oz", servingSizeG: 28),
        FoodItem(id: "flax_seeds", name: "Flax Seeds (ground)", caloriesPerServing: 37, proteinPerServing: 1.3, carbsPerServing: 2, fatPerServing: 3, servingSize: "1 tbsp", servingSizeG: 7),
    ]

    // MARK: - Dairy

    static let dairy: [FoodItem] = [
        FoodItem(id: "greek_yogurt", name: "Greek Yogurt (nonfat)", caloriesPerServing: 100, proteinPerServing: 17, carbsPerServing: 6, fatPerServing: 0.7, servingSize: "3/4 cup (170g)", servingSizeG: 170),
        FoodItem(id: "greek_yogurt_full", name: "Greek Yogurt (whole)", caloriesPerServing: 150, proteinPerServing: 14, carbsPerServing: 7, fatPerServing: 8, servingSize: "3/4 cup (170g)", servingSizeG: 170),
        FoodItem(id: "cottage_cheese", name: "Cottage Cheese (2%)", caloriesPerServing: 90, proteinPerServing: 12, carbsPerServing: 5, fatPerServing: 2.5, servingSize: "1/2 cup", servingSizeG: 113),
        FoodItem(id: "whole_milk", name: "Whole Milk", caloriesPerServing: 149, proteinPerServing: 8, carbsPerServing: 12, fatPerServing: 8, servingSize: "1 cup", servingSizeG: 244),
        FoodItem(id: "skim_milk", name: "Skim Milk", caloriesPerServing: 83, proteinPerServing: 8, carbsPerServing: 12, fatPerServing: 0.2, servingSize: "1 cup", servingSizeG: 245),
        FoodItem(id: "cheddar_cheese", name: "Cheddar Cheese", caloriesPerServing: 113, proteinPerServing: 7, carbsPerServing: 0.4, fatPerServing: 9.3, servingSize: "1 oz", servingSizeG: 28),
        FoodItem(id: "mozzarella", name: "Mozzarella (part-skim)", caloriesPerServing: 86, proteinPerServing: 7, carbsPerServing: 1, fatPerServing: 6, servingSize: "1 oz", servingSizeG: 28),
        FoodItem(id: "cream_cheese", name: "Cream Cheese", caloriesPerServing: 99, proteinPerServing: 1.7, carbsPerServing: 1.6, fatPerServing: 10, servingSize: "2 tbsp", servingSizeG: 29),
    ]

    // MARK: - Fruits

    static let fruits: [FoodItem] = [
        FoodItem(id: "banana", name: "Banana", caloriesPerServing: 105, proteinPerServing: 1.3, carbsPerServing: 27, fatPerServing: 0.4, servingSize: "1 medium", servingSizeG: 118),
        FoodItem(id: "apple", name: "Apple", caloriesPerServing: 95, proteinPerServing: 0.5, carbsPerServing: 25, fatPerServing: 0.3, servingSize: "1 medium", servingSizeG: 182),
        FoodItem(id: "blueberries", name: "Blueberries", caloriesPerServing: 84, proteinPerServing: 1.1, carbsPerServing: 21, fatPerServing: 0.5, servingSize: "1 cup", servingSizeG: 148),
        FoodItem(id: "strawberries", name: "Strawberries", caloriesPerServing: 49, proteinPerServing: 1, carbsPerServing: 12, fatPerServing: 0.5, servingSize: "1 cup", servingSizeG: 152),
        FoodItem(id: "orange", name: "Orange", caloriesPerServing: 62, proteinPerServing: 1.2, carbsPerServing: 15, fatPerServing: 0.2, servingSize: "1 medium", servingSizeG: 131),
    ]

    // MARK: - Vegetables

    static let vegetables: [FoodItem] = [
        FoodItem(id: "broccoli", name: "Broccoli (cooked)", caloriesPerServing: 55, proteinPerServing: 3.7, carbsPerServing: 11, fatPerServing: 0.6, servingSize: "1 cup", servingSizeG: 156),
        FoodItem(id: "spinach", name: "Spinach (raw)", caloriesPerServing: 7, proteinPerServing: 0.9, carbsPerServing: 1.1, fatPerServing: 0.1, servingSize: "1 cup", servingSizeG: 30),
        FoodItem(id: "mixed_greens", name: "Mixed Salad Greens", caloriesPerServing: 10, proteinPerServing: 1, carbsPerServing: 2, fatPerServing: 0, servingSize: "2 cups", servingSizeG: 85),
        FoodItem(id: "bell_pepper", name: "Bell Pepper", caloriesPerServing: 31, proteinPerServing: 1, carbsPerServing: 6, fatPerServing: 0.3, servingSize: "1 medium", servingSizeG: 119),
        FoodItem(id: "green_beans", name: "Green Beans (cooked)", caloriesPerServing: 44, proteinPerServing: 2.4, carbsPerServing: 10, fatPerServing: 0.4, servingSize: "1 cup", servingSizeG: 125),
    ]

    // MARK: - Beverages

    static let beverages: [FoodItem] = [
        FoodItem(id: "black_coffee", name: "Black Coffee", caloriesPerServing: 2, proteinPerServing: 0.3, carbsPerServing: 0, fatPerServing: 0, servingSize: "8 oz", servingSizeG: 237),
        FoodItem(id: "orange_juice", name: "Orange Juice", caloriesPerServing: 112, proteinPerServing: 1.7, carbsPerServing: 26, fatPerServing: 0.5, servingSize: "1 cup", servingSizeG: 248),
        FoodItem(id: "protein_shake_premade", name: "Protein Shake (premade)", caloriesPerServing: 160, proteinPerServing: 30, carbsPerServing: 5, fatPerServing: 2.5, servingSize: "1 bottle (14 oz)", servingSizeG: 414),
        FoodItem(id: "oat_milk", name: "Oat Milk", caloriesPerServing: 120, proteinPerServing: 3, carbsPerServing: 16, fatPerServing: 5, servingSize: "1 cup", servingSizeG: 240),
        FoodItem(id: "almond_milk_unsweetened", name: "Almond Milk (unsweetened)", caloriesPerServing: 30, proteinPerServing: 1, carbsPerServing: 1, fatPerServing: 2.5, servingSize: "1 cup", servingSizeG: 240),
    ]

    // MARK: - Combo Meals

    static let meals: [FoodItem] = [
        FoodItem(id: "chicken_rice_bowl", name: "Chicken & Rice Bowl", caloriesPerServing: 450, proteinPerServing: 40, carbsPerServing: 50, fatPerServing: 8, servingSize: "1 bowl", servingSizeG: 350),
        FoodItem(id: "steak_potato", name: "Steak & Baked Potato", caloriesPerServing: 520, proteinPerServing: 38, carbsPerServing: 42, fatPerServing: 18, servingSize: "1 plate", servingSizeG: 400),
        FoodItem(id: "salmon_veggies", name: "Salmon & Roasted Veggies", caloriesPerServing: 380, proteinPerServing: 30, carbsPerServing: 18, fatPerServing: 20, servingSize: "1 plate", servingSizeG: 340),
        FoodItem(id: "turkey_sandwich", name: "Turkey Sandwich", caloriesPerServing: 350, proteinPerServing: 28, carbsPerServing: 34, fatPerServing: 10, servingSize: "1 sandwich", servingSizeG: 250),
        FoodItem(id: "protein_oatmeal", name: "Protein Oatmeal", caloriesPerServing: 340, proteinPerServing: 30, carbsPerServing: 38, fatPerServing: 7, servingSize: "1 bowl", servingSizeG: 300),
        FoodItem(id: "ground_beef_rice", name: "Ground Beef & Rice", caloriesPerServing: 480, proteinPerServing: 32, carbsPerServing: 48, fatPerServing: 16, servingSize: "1 bowl", servingSizeG: 350),
        FoodItem(id: "burrito_bowl", name: "Burrito Bowl (chicken)", caloriesPerServing: 580, proteinPerServing: 42, carbsPerServing: 55, fatPerServing: 18, servingSize: "1 bowl", servingSizeG: 450),
        FoodItem(id: "tuna_wrap", name: "Tuna Wrap", caloriesPerServing: 320, proteinPerServing: 32, carbsPerServing: 28, fatPerServing: 8, servingSize: "1 wrap", servingSizeG: 250),
        FoodItem(id: "egg_toast", name: "Eggs on Toast", caloriesPerServing: 280, proteinPerServing: 18, carbsPerServing: 28, fatPerServing: 10, servingSize: "2 eggs + 2 slices", servingSizeG: 200),
        FoodItem(id: "pb_banana_toast", name: "PB & Banana Toast", caloriesPerServing: 340, proteinPerServing: 12, carbsPerServing: 42, fatPerServing: 16, servingSize: "2 slices", servingSizeG: 180),
        FoodItem(id: "greek_yogurt_parfait", name: "Greek Yogurt Parfait", caloriesPerServing: 310, proteinPerServing: 22, carbsPerServing: 36, fatPerServing: 9, servingSize: "1 bowl", servingSizeG: 280),
        FoodItem(id: "smoothie_protein", name: "Protein Smoothie", caloriesPerServing: 350, proteinPerServing: 30, carbsPerServing: 45, fatPerServing: 6, servingSize: "16 oz", servingSizeG: 480),
    ]

    // MARK: - Search

    static func search(query: String) -> [FoodItem] {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            return items
        }
        let lowered = query.lowercased()
        return items.filter { item in
            item.name.lowercased().contains(lowered) ||
            (item.brand?.lowercased().contains(lowered) ?? false)
        }
    }
}
