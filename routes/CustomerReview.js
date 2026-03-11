import express from "express";
import CustomerReviews from "../models/CustomerReviews.js";

const router = express.Router();

//get all reviews 
router.get('/customer-reviews', async(req,res)=>{
    try{
        const reviews = await CustomerReviews.find().populate('product').populate('user', 'name');
        res.json(reviews);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

export default router;