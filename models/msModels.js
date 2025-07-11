const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    msName: {
        type: String,
        required: true
    },
    msAbout: {
        type: String,
        required: true
    },
    msPoster: {
        type: String,
        required: true
    },
    msLink: {
        type: String,
        required: true
    },
    msGenre: {
        type: [String],
        required: true
    },
    msFormat: {
        type: String,
        required: true
    },
    msIndustry: {
        type: String,
        required: true
    },
    msOrigin: {
        type: String,
        required: true
    },
    msSeason: {
        type: Number,
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
        required: true
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

module.exports = mongoose.model("MovieSeries", movieSchema);