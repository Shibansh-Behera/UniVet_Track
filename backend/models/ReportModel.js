// backend/models/ReportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterName: String,
  contactNumber: String,
  category: { type: String, required: true },
  description: String,
  photoUrl: String,
  status: {
    type: String,
    enum: ["Yet to be picked up", "Picked up", "In treatment", "Treatment done"],
    default: "Yet to be picked up",
  },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [lon, lat]
  },
  history: [
    {
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number],
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);
