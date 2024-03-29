const mongoose = require("mongoose");
const isUrl = require("is-url");

const urlSchema = new mongoose.Schema(
  {
    urlCode: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    longUrl: { type: String, required: true, validate: isUrl },
    shortUrl: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TinyUrl", urlSchema);
