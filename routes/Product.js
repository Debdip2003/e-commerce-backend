import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


//get all products
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

//create new product
router.post('/',protect, async(req,res)=>{
    try{
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({message: 'Product created successfully', product: product});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//update existing product
router.put('/:id', protect, async(req,res)=>{
try{
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!product){
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: product });
}catch(error){
    res.status(500).json({ error: error.message });
}
})

//delete existing product
router.delete('/:id', protect, async(req,res)=>{
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully', product: product });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//get bestseeller products
router.get('/bestsellers', async(req,res)=>{
    try{
        const products = await Product.find({ bestSeller: true });
        res.json(products);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//get products for bestseller (only top 10)
router.get('/bestseller/bestselleroverview', async(req,res)=>{
    try{
        const products = await Product.find({ bestSeller: true }).sort({ ratings: -1 }).limit(10);
        res.json(products);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
})


//get products for sale 
router.get('/sale', async(req,res)=>{
    try{
        const products = await Product.find({ onSale: true });
        res.json(products);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//get products for sale (only top 10)
router.get('/sale/saleoverview', async(req,res)=>{
    try{
        const products = await Product.find({ onSale: true }).sort({ ratings: -1 }).limit(10);
        res.json(products);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
})


export default router;