import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


//get all the products from the db
router.get('/', async(req,res)=>{
    try{
    const product = await Product.find();
    res.json(product);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//get product by id
router.get('/:id', async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//create a new product
router.post('/',protect, async(req,res)=>{
    try{
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({message: 'Product created successfully'});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//delete a product by id
router.delete('/:id', protect, async(req,res)=>{
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

export default router;