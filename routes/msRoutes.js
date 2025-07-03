const express = require("express");
const router = express.Router();

const MovieSeries = require("../models/msModels.js");

router.post("/post", async (req, res) => {
    try {
        const { msName, msAbout, msPoster, msLink, msSeason, msCategory, msType, msYear, msGenre, msRating, msUploadedBy } = req.body;

        const existing = await MovieSeries.findOne({ msName: { $regex: new RegExp(`^${msName}$`, "i") } });

        if (existing) {
            return res.status(409).json({
                message: `A MovieSeries named '${msName}' already exists.`
            });
        };

        const newMovieSeries = new MovieSeries({
            msName, msAbout, msPoster, msLink, msSeason, msCategory, msType, msYear, msGenre, msRating, msUploadedBy
        });

        await newMovieSeries.save();
        res.status(200).json({ data: newMovieSeries, message: `A MovieSeries named '${msName}' added successfully.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    };
});

router.get("/all", async (req, res) => {
    try {
        const { type, category, search } = req.query;
        const filter = {};

        if (type) filter.msType = { $regex: new RegExp(`^${type}$`, "i") };
        if (category) filter.msCategory = { $regex: new RegExp(`^${category}$`, "i") };
        if (search) filter.msName = { $regex: new RegExp(search, "i") };

        const data = await MovieSeries.find(filter).sort({ msName: 1 });

        const groupedData = data.reduce((acc, item) => {
            const year = item.msYear;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(item);
            return acc;
        }, {});

        res.status(200).json({ data: groupedData, totalYears: Object.keys(groupedData).length, totalData: data.length, message: `A MovieSeries fetched${type ? ` with type '${type}'` : ""}${category ? ` and category '${category}'` : ""}${search ? ` matching '${search}'` : ""}, sorted A-Z.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    };
});

router.patch("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        if (updatedData.msName) {
            const existing = await MovieSeries.findOne({
                _id: { $ne: id },
                msName: { $regex: new RegExp(`^${updatedData.msName}$`, "i") }
            });
            if (existing) {
                return res.status(409).json({
                    message: `A MovieSeries named '${updatedData.msName}' already exists.`
                });
            };
        };

        const options = { new: true };
        const data = await MovieSeries.findByIdAndUpdate(id, updatedData, options);
        res.status(201).json({ data: data, message: `A MovieSeries named '${data.msName}' updated successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await MovieSeries.findByIdAndDelete(id);
        res.status(200).json({ message: `A MovieSeries named '${data.msName}' updated successfully.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
});

module.exports = router;