import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// Helper function to convert Mongoose Map to plain object
const cartToObject = (cartMap) => {
    const result = {};
    
    // Handle null or undefined
    if (!cartMap) {
        return result;
    }
    
    // If it's already a plain object, return it
    if (!(cartMap instanceof Map)) {
        return cartMap;
    }
    
    // If it's a Map, convert it
    for (const [productId, items] of cartMap) {
        result[productId] = items.map(item => 
            item.toObject?.() || JSON.parse(JSON.stringify(item))
        );
    }
    return result;
};

// Helper function to calculate cart total
const calculateCartTotal = async (cartMap) => {
    let total = 0;
    try {
        if (!cartMap) {
            return 0;
        }
        
        // Check if it's a Map
        if (cartMap instanceof Map) {
            if (cartMap.size === 0) {
                return 0;
            }
            
            // Convert Map entries to array for safe iteration
            const cartEntries = Array.from(cartMap.entries());
            
            for (const [productId, items] of cartEntries) {
                const product = await Product.findById(productId);
                if (product && items && Array.isArray(items)) {
                    for (const item of items) {
                        if (item.quantity) {
                            total += product.price * item.quantity;
                        }
                    }
                }
            }
        } else {
            // Handle plain object
            for (const [productId, items] of Object.entries(cartMap)) {
                const product = await Product.findById(productId);
                if (product && items && Array.isArray(items)) {
                    for (const item of items) {
                        if (item.quantity) {
                            total += product.price * item.quantity;
                        }
                    }
                }
            }
        }
    } catch (error) {
        throw error;
    }
    return total;
};

// Helper function to get cart items (handles both Map and plain object)
const getCartItems = (cart, productId) => {
    if (cart instanceof Map) {
        return cart.get(productId) || [];
    } else {
        return cart[productId] || [];
    }
};

// Helper function to set cart items (handles both Map and plain object)
const setCartItems = (cart, productId, items) => {
    if (cart instanceof Map) {
        cart.set(productId, items);
    } else {
        cart[productId] = items;
    }
};

// Helper function to delete cart items (handles both Map and plain object)
const deleteCartItems = (cart, productId) => {
    if (cart instanceof Map) {
        cart.delete(productId);
    } else {
        delete cart[productId];
    }
};

// Get cart of user
router.get("/:userId", protect, async (req, res) => {
    try {
        // Use authenticated user's ID for consistency with CRUD operations
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Check if cart is empty - handle both Map and plain object
        const isCartEmpty = !user.cart || 
            (user.cart instanceof Map && user.cart.size === 0) || 
            (!(user.cart instanceof Map) && Object.keys(user.cart).length === 0);

        if (isCartEmpty) {
            return res.status(200).json({
                cart: {},
                total: 0,
                message: "Cart is empty"
            });
        }
        
        const cartData = cartToObject(user.cart);
        const total = await calculateCartTotal(user.cart);
        const response = {
            cart: cartData,
            total: total
        };

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});


// Add to cart
router.post("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const { productId, size, quantity } = req.body;

        if (!productId || !size || quantity == null) {
            return res.status(400).json({
                error: "Product id, size and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                error: "Quantity must be greater than 0"
            });
        }

        let cartItems = getCartItems(user.cart, productId);

        const existingItemIndex = cartItems.findIndex(
            item => item.size === size
        );

        if (existingItemIndex !== -1) {
            cartItems[existingItemIndex].quantity += Number(quantity);
        } else {
            cartItems.push({
                size,
                quantity: Number(quantity)
            });
        }

        setCartItems(user.cart, productId, cartItems);
        user.markModified('cart');
        await user.save();

        // Refetch to ensure we have the latest state from database
        user = await User.findById(req.user._id);

        const total = await calculateCartTotal(user.cart);

        res.json({
            message: "Product added to cart successfully",
            cart: cartToObject(user.cart),
            total: total
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Delete cart item
router.delete("/:productId", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                error: "Product id is required"
            });
        }

        deleteCartItems(user.cart, productId);
        user.markModified('cart');
        await user.save();

        // Refetch to ensure we have the latest state from database
        user = await User.findById(req.user._id);

        const total = await calculateCartTotal(user.cart);

        res.json({
            message: "Product removed successfully",
            cart: cartToObject(user.cart),
            total: total
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Update cart
router.put("/update/:productId", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const { productId } = req.params;
        const { size, quantity } = req.body;

        if (!productId || !size || quantity == null) {
            return res.status(400).json({
                error: "Product id, size and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                error: "Quantity must be greater than 0"
            });
        }

        let cartItems = getCartItems(user.cart, productId);

        cartItems = cartItems.map(item => {
            if (item.size === size) {
                return {
                    ...item.toObject?.() || item,
                    quantity: Number(quantity)
                };
            }
            return item;
        });

        setCartItems(user.cart, productId, cartItems);
        user.markModified('cart');
        await user.save();

        // Refetch to ensure we have the latest state from database
        user = await User.findById(req.user._id);

        const total = await calculateCartTotal(user.cart);

        res.json({
            message: "Cart updated successfully",
            cart: cartToObject(user.cart),
            total: total
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;