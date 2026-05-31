import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    country: { type: String, default: "" }
  },
  cart: { type: Object, default: {} }
},
  { timestamps: true }
);

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true }
},
  {timestamps: true}
);

export const User = mongoose.model('User', userSchema);
export const Email = mongoose.model('Email', emailSchema);
