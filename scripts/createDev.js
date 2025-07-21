const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Auth = require("../models/authModel");

const createDev = async () => {

    await mongoose.connect("mongodb+srv://username:password@cluster0.uttbuqz.mongodb.net/database");

    const hashedPassword = await bcrypt.hash("password", 10);

    const dev = new Auth({
        name: "John Doe",
        email: "email",
        mobile: "mobile",
        password: hashedPassword,
        isApproved: true,
        role: "dev"
    });

    await dev.save();
    console.log("Dev created:", dev);
    process.exit();
};
createDev();