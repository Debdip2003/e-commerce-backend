import express from "express" //importing the xpress to use
import connectDb from "./config/db.js" //importing the mongodb connection
import 'dotenv/config'
import userRoute from './routes/User.js'
import productRoute from './routes/Product.js'
import cartRoute from './routes/Cart.js'
import dns from "node:dns/promises"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

dns.setServers(["1.1.1.1"]);
connectDb()

app.use('/api/user', userRoute)
app.use('/api/product', productRoute)
app.use('/api/cart', cartRoute)

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})
