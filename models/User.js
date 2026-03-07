import mongoose from "mongoose";

//schema for the user model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  cart: { type: Object, default: {} }
},
  {timestamps: true} // geenarate the createdAt and updatedAt field automatically
);

//creating the user model
const User = mongoose.model('User', userSchema);

export default User;