import { ShoppingList } from "../models/shoppinglist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getShoppingList = asyncHandler(async(req, res)=> {
    let list = await ShoppingList.findOne({user: req.user._id});

    if(!list) {
        list = await ShoppingList.create({user: req.user._id, items: []});
    }

    return res.status(200).json(new ApiResponse(200, list, "Shopping list fetched"))
});


const addShoppingItem = asyncHandler(async(req, res)=> {
    const {ingredient, quantity, recipeId} = req.body;

    let list = await ShoppingList.findOne({user: req.user._id});
    if(!list) {
        list = await ShoppingList.create({user: req.user._id, items: []});
    }

    const existingItem = list.items.find(item => item.ingredient.toLowerCase() === ingredient.toLowerCase());

    if(existingItem) {
        return res.status(200).json(new ApiResponse(200, list, "Item already exists in list"));
    }

    list.items.push({
        ingredient,
        quantity,
        addedFromRecipe: recipeId || null
    });

    await list.save();

    return res.status(200).json(new ApiResponse(200, list, "Item added"));
});


const toggleItemCheck = asyncHandler(async(req, res)=> {
    const {itemId} = req.params;

    const list = await ShoppingList.findOne({user: req.user._id});
    if(!list) throw new ApiError(404, "List not found");

    const item = list.items.id(itemId);
    if(item) {
        item.isChecked = !item.isChecked;
        await list.save();
    }

    return res.status(200).json(new ApiResponse(200, list, "Item updated"));
});

const removeShoppingItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const list = await ShoppingList.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { items: { _id: itemId } } },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, list, "Item removed"));
});


export {
    getShoppingList,
    addShoppingItem,
    toggleItemCheck,
    removeShoppingItem
}