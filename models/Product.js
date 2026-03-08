import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  stock: { type: Number, required: true },
  ratings: { type: Number, default: 0 },
  size: { type: String, required: true },
  color: { type: String, required: true },
  brand: { type: String, required: true },
  bestSeller: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
},
{timestamps: true}
);

const Product = mongoose.model('Product', productSchema);

export default Product;