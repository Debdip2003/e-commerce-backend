import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  cart: { type: Object, default: {} }
},
  {timestamps: true}
);

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true }
},
  {timestamps: true}
);

export const User = mongoose.model('User', userSchema);
export const Email = mongoose.model('Email', emailSchema);
