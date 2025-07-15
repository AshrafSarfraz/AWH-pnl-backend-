

const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./config/db');
const PORT = 3000;


connectDB();
// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://al-wessilholding.com"],
  credentials: true,
}));
app.use(express.json());

// Routes
const userRoute = require('./routes/authroutes');
app.use("/company", require("./routes/company_route"));
app.use("/category", require("./routes/category_route"));
app.use("/subcategory", require("./routes/sub_category_route"));
app.use("/entry", require("./routes/entry_route"));
app.use("/ceo/dashboard", require("./routes/ceo_route"));

// for hr system to get data from mongoDb that we use in our application
app.use("/employees", require("./HR-SystemApi/get_Data_from_mongo"));

app.use('/', userRoute);

// Root Test
app.get('/', (req, res) => {
  res.send('User API is working with schema!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


