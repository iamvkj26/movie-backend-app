const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { authenticate, authorize } = require("../middleware/auth.js");

const Auth = require("../models/authModel.js");
const MovieSeries = require("../models/msModels.js");

const jwtSecret = process.env.JWT_SECRET;

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.post("/post", authenticate, authorize("dev", "admin"), async (req, res) => {
    try {
        const { msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msReleaseDate, msGenre, msRating, msUploadedBy } = req.body;

        if (msName && msReleaseDate) {
            const existing = await MovieSeries.findOne({
                msName: { $regex: new RegExp(`^${escapeRegex(msName)}$`, "i") },
                msReleaseDate
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${msName}' already exists for this release date ${msReleaseDate}.`
                });
            };
        };

        const newMovieSeries = new MovieSeries({
            msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msReleaseDate, msGenre, msRating, msUploadedBy
        });

        const add = await newMovieSeries.save();
        res.status(200).json({ data: add, message: `The '${msName}' added successfully.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    };
});

router.get("/get", async (req, res) => {
    try {
        const { genre, industry, format, search, watched } = req.query;
        const filter = {};

        if (genre) filter.msGenre = { $in: [new RegExp(`^${escapeRegex(genre)}$`, "i")] };
        if (format) filter.msFormat = { $regex: new RegExp(`^${escapeRegex(format)}$`, "i") };
        if (industry) filter.msIndustry = { $regex: new RegExp(`^${escapeRegex(industry)}$`, "i") };
        if (search) filter.msName = { $regex: new RegExp(escapeRegex(search), "i") };

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

        const data = await MovieSeries.find(filter).sort({ msName: 1 });

        const get = data.reduce((acc, item) => {
            const year = new Date(item.msReleaseDate).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(item);
            return acc;
        }, {});

        res.status(200).json({ data: get, totalYears: Object.keys(get).length, totalData: data.length, message: `The MovieSeries fetched${genre ? ` in genre '${genre}'` : ""}${industry ? ` with industry '${industry}'` : ""}${format ? ` with format '${format}'` : ""}${search ? ` matching '${search}'` : ""}, sorted A-Z.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

router.patch("/update/:id", authenticate, authorize("dev"), async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        if (body.msName && body.msReleaseDate) {
            const existing = await MovieSeries.findOne({
                _id: { $ne: id },
                msName: { $regex: new RegExp(`^${escapeRegex(body.msName)}$`, "i") },
                msReleaseDate: body.msReleaseDate
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${body.msName}' already exists for this release date ${body.msReleaseDate}.`
                });
            };
        };

        const update = await MovieSeries.findByIdAndUpdate(id, body, { new: true });
        res.status(200).json({ data: update, message: `The '${update.msName}' updated successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

router.delete("/delete/:id", authenticate, authorize("dev"), async (req, res) => {
    try {
        const id = req.params.id;
        const deleteD = await MovieSeries.findByIdAndDelete(id);
        res.status(200).json({ message: `The '${deleteD.msName}' deleted successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

router.patch("/watched/:id", authenticate, authorize("dev", "admin"), async (req, res) => {
    try {
        const id = req.params.id;
        const item = await MovieSeries.findById(id);

        if (!item) return res.status(404).json({ message: "Movie/Series not found." });

        const wasWatched = item.msWatched;
        item.msWatched = !wasWatched;
        item.msWatchedAt = !wasWatched ? new Date() : null;

        const watched = await item.save();

        res.status(200).json({ message: `The '${watched.msName}' marked as ${watched.msWatched ? "Watched" : "Unwatched"}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

module.exports = router;