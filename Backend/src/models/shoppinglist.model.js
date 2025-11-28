import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema({
    ingredient: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        default: "1",
    },
    isChecked: {
        type: Boolean,
        default: false
    },
    addedFromRecipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }
});


const shoppingListSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [shoppingItemSchema]
    },
    {timestamps: true}
);


export const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);