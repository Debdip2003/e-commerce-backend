import express from "express" //importing the xpress to use
import connectDb from "./config/db.js" //importing the mongodb connection
import 'dotenv/config'
import userRoute from './routes/User.js'
import productRoute from './routes/Product.js'
import dns from "node:dns/promises"

//use the imported express
const app = express()
const PORT = process.env.PORT || 5000

//middleware to parse the json data
app.use(express.json())
app.use(express.urlencoded({extended: true}))

dns.setServers(["1.1.1.1"]);
connectDb()

//using the user route for the api
app.use('/api/users', userRoute)
//using the product route for the api
app.use('/api/products', productRoute)

//used to run the serve on port 3000
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})
