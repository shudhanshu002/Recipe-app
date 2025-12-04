import { ShoppingList } from '../models/shoppinglist.model.js';
import { Recipe } from '../models/recipe.model.js'; // ✅ Import Recipe Model
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// 1. GET MY LIST
const getShoppingList = asyncHandler(async (req, res) => {
    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
        list = await ShoppingList.create({ user: req.user._id, items: [] });
    }
    return res.status(200).json(new ApiResponse(200, list, 'Shopping list fetched'));
});

// 2. ADD ITEM (Manual)
const addShoppingItem = asyncHandler(async (req, res) => {
    const { ingredient, quantity, recipeId } = req.body;

    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
        list = await ShoppingList.create({ user: req.user._id, items: [] });
    }

    const existingItem = list.items.find((item) => item.ingredient.toLowerCase() === ingredient.toLowerCase());
    if (existingItem) {
        return res.status(200).json(new ApiResponse(200, list, 'Item already in list'));
    }

    list.items.push({ ingredient, quantity, addedFromRecipe: recipeId || null });
    await list.save();

    return res.status(200).json(new ApiResponse(200, list, 'Item added'));
});

// ✅ NEW: ADD ALL INGREDIENTS FROM RECIPE
const addFromRecipe = asyncHandler(async (req, res) => {
    const { recipeId } = req.body;

    if (!recipeId) throw new ApiError(400, 'Recipe ID is required');

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new ApiError(404, 'Recipe not found');

    let list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) {
        list = await ShoppingList.create({ user: req.user._id, items: [] });
    }

    let addedCount = 0;

    // Loop through recipe ingredients
    recipe.ingredients.forEach((ing) => {
        // Check if already exists (simple text check)
        const exists = list.items.some((item) => item.ingredient.toLowerCase() === ing.toLowerCase());

        if (!exists) {
            list.items.push({
                ingredient: ing,
                quantity: '1', // Default quantity since recipe ingredients are often unstructured strings
                addedFromRecipe: recipe._id,
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        await list.save();
    }

    return res.status(200).json(new ApiResponse(200, list, `Added ${addedCount} ingredients to your list`));
});

// 3. TOGGLE CHECK
const toggleItemCheck = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const list = await ShoppingList.findOne({ user: req.user._id });
    if (!list) throw new ApiError(404, 'List not found');

    const item = list.items.id(itemId);
    if (item) {
        item.isChecked = !item.isChecked;
        await list.save();
    }
    return res.status(200).json(new ApiResponse(200, list, 'Item updated'));
});

// 4. REMOVE ITEM
const removeShoppingItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const list = await ShoppingList.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { _id: itemId } } }, { new: true });
    return res.status(200).json(new ApiResponse(200, list, 'Item removed'));
});

export { getShoppingList, addShoppingItem, toggleItemCheck, removeShoppingItem, addFromRecipe };
