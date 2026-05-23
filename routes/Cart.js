import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {User} from "../models/User.js";

const router = express.Router();

//get cart for a user
router.get('/:userId', protect, async(req,res)=>{
    try{
        const user  = await User.findById(req.params.userId);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        if(!user.cart){
            return res.status(404).json({ error: 'Cart not found' });
        }
        if(Object.keys(user.cart).length === 0){
            return res.status(200).json({ error: 'Cart is empty' });
        }
        //finding the user first and then returning the cart of that user
        res.json(user.cart);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//add to cart
router.post('/', protect, async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Accept productId (_id), size, and quantity from request body
        const { productId, size, quantity } = req.body;
        if (!productId || !size || !quantity) {
            return res.status(400).json({ error: 'Product id, size, and quantity are required' });
        }
        // Initialize cart if not present
        if (!user.cart) user.cart = {};
        if (!Array.isArray(user.cart[productId])) {
            user.cart[productId] = [];
        }

        // Check if this size already exists for this product
        const existingItem = user.cart[productId].find(item => item.size === size);
        if (existingItem) {
            // If exists, update quantity
            existingItem.quantity += quantity;
        } else {
            // Else, add new size entry
            user.cart[productId].push({ size, quantity });
        }
        user.markModified('cart');
        await user.save();
        res.json({ message: 'Product added to cart successfully', cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//remove from cart
router.delete('/:productId', protect, async(req,res)=>{
  try{
    const user  = await User.findById(req.user._id);
    if(!user){
        return res.status(404).json({ error: 'User not found' });
    }
    const { productId } = req.params;
    if(!productId){
        return res.status(400).json({ error: 'Product id is required' });
    }
    delete user.cart[productId];
    user.markModified('cart');
    await user.save();
    res.json({ message: 'Product removed from cart successfully', cart: user.cart });
  }catch(error){
    res.status(500).json({ error: error.message });
  } 
})

//update cart
router.put('/update/:productId', protect, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const { productId, quantity } = req.body;
        if(!productId){
            return res.status(400).json({ error: 'Product id is required' });
        }
        if(!quantity){
            return res.status(400).json({ error: 'Quantity is required' });
        }
        user.cart[productId] = (user.cart[productId] || 0) + quantity;
        user.markModified('cart');
        await user.save();
        res.json({ message: 'Cart updated successfully', cart: user.cart });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

export default router;