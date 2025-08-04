const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const MovieSeries = require("../models/msModels.js");
const Contact = require("../models/contactModel.js");

const jwtSecret = process.env.JWT_SECRET;

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/get", async (req, res) => {
    try {
        const { search, format, industry, genre, watched } = req.query;
        const filter = {};

        if (search) filter.msName = { $regex: new RegExp(escapeRegex(search), "i") };
        if (format) filter.msFormat = { $regex: new RegExp(`^${escapeRegex(format)}$`, "i") };
        if (industry) filter.msIndustry = { $regex: new RegExp(`^${escapeRegex(industry)}$`, "i") };
        if (genre) filter.msGenre = { $in: [new RegExp(`^${escapeRegex(genre)}$`, "i")] };
        if (watched === "true") filter.msWatched = true;
        else if (watched === "false") filter.msWatched = false;

        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        let role = "guest";

        if (token) {
            try {
                const decoded = jwt.verify(token, jwtSecret);
                const user = await Auth.findById(decoded.id);
                if (user && user.isApproved) role = user.role;
            } catch (err) {
                // invalid/expired token: skip
            };
        };

        if (role !== "dev" && "admin") {
            filter.msGenre = {
                ...(filter.msGenre || {}),
                $not: { $in: [/^18\+$/i, /hard romance/i] }
            };
        };

        const data = await MovieSeries.find(filter).sort({ msReleaseDate: -1 });

        const get = data.reduce((acc, item) => {
            const year = new Date(item.msReleaseDate).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(item);
            return acc;
        }, {});

        res.status(200).json({ data: get, totalYears: Object.keys(get).length, totalData: data.length, message: `The MovieSeries fetched${genre ? ` in genre '${genre}'` : ""}${industry ? ` with industry '${industry}'` : ""}${format ? ` with format '${format}'` : ""}${search ? ` matching '${search}'` : ""}, sorted by latest release date.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

router.get("/about", (req, res) => {
    res.json({
        name: "HelloHood",
        tagline: "Your Personal Movie & Series Tracker",
        description: "HelloHood is a simple platform to help users track, explore, and manage their favorite movies and web series. It supports filters, search, watched status, and more.",
        techStack: {
            frontend: "React + Bootstrap",
            backend: "Node.js + Express",
            database: "MongoDB",
            auth: "JWT-based role protected API"
        },
        roles: {
            guest: "Can view public content",
            user: "Can only browse",
            admin: "Can add, edit, delete, mark watched",
            dev: "Same as admin, with full access"
        },
        dataHandling: {
            source: "Manually curated",
            privacy: "No personal tracking. Only authentication data stored.",
            moderation: "Only approved admins/devs can modify content."
        },
        contact: {
            email: "support@hellohood.com",
            github: "https://github.com/yourrepo",
            version: "1.0.0"
        }
    });
});

router.post("/contact", async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;

        if (!name || !email || !mobile || !message) return res.status(400).json({ message: "All fields are required." });

        const contact = new Contact({ name, email, mobile, message });
        await contact.save();

        res.status(200).json({ data: contact, message: "Thanks for contacting us!, we will get back to you." });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit contact form", error: error.message });
    };
});

module.exports = router;