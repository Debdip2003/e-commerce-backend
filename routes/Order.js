import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

// Helper function to convert Mongoose Map to plain object
const cartToObject = (cartMap) => {
    const result = {};
    
    if (!cartMap) {
        return result;
    }
    
    if (!(cartMap instanceof Map)) {
        return cartMap;
    }
    
    for (const [productId, items] of cartMap) {
        result[productId] = items.map(item => 
            item.toObject?.() || JSON.parse(JSON.stringify(item))
        );
    }
    return result;
};

// Create a new order
router.post("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Check if cart is empty
        const isCartEmpty = !user.cart || 
            (user.cart instanceof Map && user.cart.size === 0) || 
            (!(user.cart instanceof Map) && Object.keys(user.cart).length === 0);

        if (isCartEmpty) {
            return res.status(400).json({
                error: "Cart is empty, cannot place order"
            });
        }

        const { firstName, lastName, email, street, city, state, zipcode, country, phoneNumber, totalPrice, paymentMethod } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phoneNumber || totalPrice == null || !paymentMethod) {
            return res.status(400).json({
                error: "All fields (firstName, lastName, email, street, city, state, zipcode, country, phoneNumber, totalPrice, paymentMethod) are required"
            });
        }

        // Validate payment method
        const validPaymentMethods = ["NetBanking", "UPI", "CashOnDelivery"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                error: `Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}`
            });
        }

        // Create new order with authenticated user's ID
        const order = new Order({
            user: user._id,
            firstName,
            lastName,
            email,
            street,
            city,
            state,
            zipcode,
            country,
            phoneNumber,
            cart: cartToObject(user.cart),
            totalPrice,
            paymentMethod,
            orderStatus: "Pending"
        });

        await order.save();

        // Clear the user's cart after successful order
        user.cart = {};
        await user.save();

        res.status(201).json({
            message: "Order placed successfully",
            order: order,
            cart: {}
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Get all orders of a user
router.get("/user/:userId", protect, async (req, res) => {
    try {
        // Use authenticated user's ID for security
        const orders = await Order.find({ user: req.user._id }).populate("user", "name email");

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: "No orders found",
                orders: []
            });
        }

        res.status(200).json({
            orders: orders
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Get a single order by ID
router.get("/:orderId", protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // Verify that the order belongs to the authenticated user
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized to access this order"
            });
        }

        res.status(200).json({
            order: order
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Update order status (admin only)
router.put("/:orderId", protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus) {
            return res.status(400).json({
                error: "Order status is required"
            });
        }

        const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                error: `Invalid order status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Cancel an order
router.delete("/:orderId", protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // Verify that the order belongs to the authenticated user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized to cancel this order"
            });
        }

        // Only allow cancellation if order is in Pending or Processing status
        if (!["Pending", "Processing"].includes(order.orderStatus)) {
            return res.status(400).json({
                error: "Cannot cancel order that has already been shipped or delivered"
            });
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({
            message: "Order cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;
