import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterName: String,
  contactNumber: String,
  category: String,  // e.g., dog, cat, bird
  color: String,
  description: String,
  photoUrl: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ["yet to be picked", "picked up", "in treatment", "treated"],
    default: "yet to be picked"
  },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      latitude: Number,
      longitude: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
