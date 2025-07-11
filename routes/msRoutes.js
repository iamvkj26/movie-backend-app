const express = require("express");
const router = express.Router();

const MovieSeries = require("../models/msModels.js");

router.post("/post", async (req, res) => {
    try {
        const { msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msOrigin, msReleaseDate, msGenre, msRating, msUploadedBy } = req.body;

        if (msName && msReleaseDate) {
            const existing = await MovieSeries.findOne({
                msName: { $regex: new RegExp(`^${msName}$`, "i") },
                msReleaseDate: msReleaseDate
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${msName}' already exists for this release date ${msReleaseDate}.`
                });
            };
        };

        const newMovieSeries = new MovieSeries({
            msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msOrigin, msReleaseDate, msGenre, msRating, msUploadedBy
        });

        const add = await newMovieSeries.save();
        res.status(200).json({ data: add, message: `The '${msName}' added successfully.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    };
});

router.get("/get", async (req, res) => {
    try {
        const { genre, industry, format, search, watched } = req.query;
        const filter = {};

        if (genre) filter.msGenre = { $in: [new RegExp(`^${genre}$`, "i")] };
        if (format) filter.msFormat = { $regex: new RegExp(`^${format}$`, "i") };
        if (industry) filter.msIndustry = { $regex: new RegExp(`^${industry}$`, "i") };
        if (search) filter.msName = { $regex: new RegExp(search, "i") };

        if (watched === "true") filter.msWatched = true;
        else if (watched === "false") filter.msWatched = false;

        const data = await MovieSeries.find(filter).sort({ msName: 1 });

        const get = data.reduce((acc, item) => {
            const year = new Date(item.msReleaseDate).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            };
            acc[year].push(item);
            return acc;
        }, {});

        res.status(200).json({ data: get, totalYears: Object.keys(get).length, totalData: data.length, message: `The MovieSeries fetched${genre ? ` in genre '${genre}'` : ""}${industry ? ` with industry '${industry}'` : ""}${format ? ` with format '${format}'` : ""}${search ? ` matching '${search}'` : ""}, sorted A-Z.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    };
});

router.patch("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        if (body.msName && body.msReleaseDate) {
            const existing = await MovieSeries.findOne({
                _id: { $ne: id },
                msName: { $regex: new RegExp(`^${body.msName}$`, "i") },
                msReleaseDate: body.msReleaseDate
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${body.msName}' already exists for this release date ${body.msReleaseDate}.`
                });
            };
        };

        const options = { new: true };
        const update = await MovieSeries.findByIdAndUpdate(id, body, options);
        res.status(200).json({ data: update, message: `The '${update.msName}' updated successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deleteD = await MovieSeries.findByIdAndDelete(id);
        res.status(200).json({ message: `The '${deleteD.msName}' deleted successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

router.patch("/watched/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const item = await MovieSeries.findById(id);

        if (!item) return res.status(404).json({ message: "Movie/Series not found." });

        const wasWatched = item.msWatched;
        item.msWatched = !wasWatched;
        item.msWatchedAt = !wasWatched ? new Date() : null;

        const watched = await item.save();

        res.status(200).json({ data: watched, message: `The '${watched.msName}' marked as ${watched.msWatched ? "Watched" : "Unwatched"}${watched.msWatched ? ` at ${watched.msWatchedAt.toISOString()}` : ""}.` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

module.exports = router;