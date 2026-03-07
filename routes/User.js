import { protect } from '../middleware/authMiddleware.js';
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate a JWT token for the user
const generateToken = (user) => {
  return jwt.sign({
    id: user._id,
  }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

//get all the user form the db
router.get('/', protect, async(req,res)=>{
    try {
        const users = await User.find();
        res.json(users);        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Route to create a new user
router.post('/register', async (req, res) => {
  try {    
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(existingUser){
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email,  password: hashedPassword });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ message: 'User created successfully', token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route to login the user
router.post('/login',async(req,res)=>{
  try{
    const {email, password} = req.body;
    //find the user with the email
    const user =await User.findOne({ email });
    //if user not found send the error
    if(!user){
        return res.status(400).json({error: 'User not found'})
    }
    //compare the password with the hashed password
    const compare = await bcrypt.compare(password, user.password);
    //if password not match send the error
    if(!compare){
        return res.status(400).json({error: 'Invalid password'})
    }
    const token = generateToken(user);
    res.json({message: 'Login successful', token: token})
  }catch(error){
    res.status(500).json({ error: error.message });
  }
})


export default router;