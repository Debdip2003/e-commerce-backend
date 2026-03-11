import express from 'express';
import {Email} from '../models/User.js';

const router = express.Router();

//register email
router.post('/register-email', async(req,res)=>{
  try{
    const {email} = req.body;
    const existingEmail = await Email.findOne({ email });
    if(existingEmail){
        return res.status(409).json({ error: 'Email is already registered' });
    }
    await Email.create({ email });
    res.json({message: 'Email is registered successfully'})
  }catch(error){
    res.status(500).json({ error: error.message });
  }
})

export default router;