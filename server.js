const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;
const mongoString = process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() =>
    console.log("✅ Connected to MongoDB")
).catch(err =>
    console.error("❌ MongoDB connection error:", err)
);

app.use("/movieseries", require("./routes/msRoutes"));

app.listen(port, () => console.log(`🚀 Server is running on http://localhost:${port}`));