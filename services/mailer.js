import nodemailer from "nodemailer";
import Product from "../models/Product.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "debdip987@gmail.com",
    pass: "gnuo lobb iavq vdae"
  }
});

export const sendEmail = async (email) => {
  try {
    const saleProducts = await Product.find({ onSale: true })
      .sort({ ratings: -1 })
      .limit(5);
    
    const bestsellerProducts = await Product.find({ bestSeller: true })
      .sort({ ratings: -1 })
      .limit(5);

    const saleList = saleProducts.map(product => 
      `<li><strong>${product.name}</strong> - $${product.price} <span style="color: #e74c3c;">⭐ ${product.ratings}/5</span></li>`
    ).join('');

    const bestsellerList = bestsellerProducts.map(product => 
      `<li><strong>${product.name}</strong> - $${product.price} <span style="color: #e74c3c;">⭐ ${product.ratings}/5</span></li>`
    ).join('');

    await transporter.sendMail({
      from: "debdip987@gmail.com",
      to: email,
      subject: "🔥 Exclusive Sale Alert & Bestseller Picks",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">🔥 Exclusive Sale Alert!</h2>
          <p>Hello!</p>
          <p>Don't miss out on our <strong>exclusive sale</strong>! Get amazing deals on selected items.</p>
          
          ${saleProducts.length > 0 ? `
            <h3 style="color: #2c3e50;">💰 PRODUCTS ON SALE:</h3>
            <ul style="line-height: 1.8;">
              ${saleList}
            </ul>
          ` : '<p>No products on sale at the moment.</p>'}
          
          ${bestsellerProducts.length > 0 ? `
            <h3 style="color: #2c3e50;">🌟 THIS WEEK'S BESTSELLERS:</h3>
            <ul style="line-height: 1.8;">
              ${bestsellerList}
            </ul>
          ` : ''}
          
          <p style="margin-top: 20px;">Shop now and grab these amazing deals before they're gone!</p>
          
          <a href="http://localhost:5173" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Shop Now</a>
          
          <p style="margin-top: 30px; color: #7f8c8d;">Happy Shopping!<br>Forever Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};