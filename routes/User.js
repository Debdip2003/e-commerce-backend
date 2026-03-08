import { protect } from '../middleware/authMiddleware.js';
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({
    id: user._id,
  }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

//get all users
router.get('/', protect, async(req,res)=>{
    try {
        const users = await User.find();
        res.json(users);        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//get user by  id
router.get('/:id', protect, async(req,res)=>{
  try{
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
})

// create new user
router.post('/register', async (req, res) => {
  try {    
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(existingUser){
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email,  password: hashedPassword });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ message: 'User created successfully', token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//login existing user
router.post('/login',async(req,res)=>{
  try{
    const {email, password} = req.body;
    const user =await User.findOne({ email });
    if(!user){
        return res.status(400).json({error: 'User not found'})
    }
    const compare = await bcrypt.compare(password, user.password);
    if(!compare){
        return res.status(400).json({error: 'Invalid password'})
    }
    const token = generateToken(user);
    res.json({message: 'Login successful', token: token})
  }catch(error){
    res.status(500).json({ error: error.message });
  }
})

//delete existing user
router.delete('/:id', protect, async(req,res)=>{
  try{
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
        return res.status(404).json({error: 'User not found'})
    }
    res.json({message: 'User deleted successfully'})
  }catch(error){
    res.status(500).json({ error: error.message });
  }
})  


export default router;