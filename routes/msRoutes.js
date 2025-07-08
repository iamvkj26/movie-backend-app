const express = require("express");
const router = express.Router();

const MovieSeries = require("../models/msModels.js");

router.post("/post", async (req, res) => {
    try {
        const { msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msOrigin, msYear, msGenre, msRating, msUploadedBy } = req.body;

        if (msName && msYear) {
            const existing = await MovieSeries.findOne({
                msName: { $regex: new RegExp(`^${msName}$`, "i") },
                msYear: msYear
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${msName}' already exists for the year ${msYear}.`
                });
            };
        };

        const newMovieSeries = new MovieSeries({
            msName, msAbout, msPoster, msLink, msSeason, msFormat, msIndustry, msOrigin, msYear, msGenre, msRating, msUploadedBy
        });

        const add = await newMovieSeries.save();
        res.status(200).json({ data: add, message: `The '${msName}' added successfully.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    };
});

router.get("/all", async (req, res) => {
    try {
        const { genre, industry, format, search } = req.query;
        const filter = {};

        if (genre) filter.msGenre = { $in: [new RegExp(`^${genre}$`, "i")] };
        if (format) filter.msFormat = { $regex: new RegExp(`^${format}$`, "i") };
        if (industry) filter.msIndustry = { $regex: new RegExp(`^${industry}$`, "i") };
        if (search) filter.msName = { $regex: new RegExp(search, "i") };

        const data = await MovieSeries.find(filter).sort({ msName: 1 });

        const get = data.reduce((acc, item) => {
            const year = item.msYear;
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

        if (body.msName && body.msYear) {
            const existing = await MovieSeries.findOne({
                _id: { $ne: id },
                msName: { $regex: new RegExp(`^${body.msName}$`, "i") },
                msYear: body.msYear
            });
            if (existing) {
                return res.status(409).json({
                    message: `The '${body.msName}' already exists for the year ${body.msYear}.`
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

module.exports = router;