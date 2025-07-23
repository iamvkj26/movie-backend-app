const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    msName: {
        type: String,
        required: true,
        trim: true
    },
    msAbout: {
        type: String,
        required: true,
        trim: true
    },
    msPoster: {
        type: String,
        required: true,
        trim: true
    },
    msLink: {
        type: String,
        required: true,
        trim: true
    },
    msGenre: {
        type: [String],
        required: true
    },
    msFormat: {
        type: String,
        required: true,
        trim: true
    },
    msIndustry: {
        type: String,
        required: true,
        trim: true
    },
    msSeason: {
        type: String,
        required: true
    },
    msReleaseDate: {
        type: String,
        required: true
    },
    msRating: {
        type: Number,
        required: true
    },
    msUploadedBy: {
        type: String,
        required: true,
        trim: true
    },
    msWatched: {
        type: Boolean,
        default: false
    },
    msWatchedAt: {
        type: Date,
        default: null
    }
});

movieSchema.index({ msName: 1, msReleaseDate: 1 }, { unique: true });

module.exports = mongoose.model("MovieSeries", movieSchema);