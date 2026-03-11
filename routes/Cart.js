import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {User} from "../models/User.js";

const router = express.Router();

//get cart for a user
router.get('/', protect, async(req,res)=>{
    try{
        const user  = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        if(!user.cart){
            return res.status(404).json({ error: 'Cart not found' });
        }
        if(Object.keys(user.cart).length === 0){
            return res.status(200).json({ error: 'Cart is empty' });
        }
        res.json(user.cart);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//add to cart
router.post('/', protect, async(req,res)=>{
    try{
        const user  = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        //if profuct id and quantity are not provided in the request body, return an error
        const {_id, quantity} = req.body;
        const productId = _id;
        if(!productId || !quantity){
            return res.status(400).json({ error: 'Product id and quantity are required' });
        }
        user.cart[productId] = quantity;
        user.markModified('cart');
        await user.save();
        res.json({ message: 'Product added to cart successfully', cart: user.cart });
    }catch(error){
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
router.put('/', protect, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const { _id, quantity } = req.body;
        const productId = _id;
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