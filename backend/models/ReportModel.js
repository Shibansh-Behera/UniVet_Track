// backend/models/ReportModel.js
import mongoose from "mongoose";
const reportSchema = new mongoose.Schema(
  {
    // 🐾 Animal category
    category: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Cow", "Bird", "Other"], // optional custom categories
    },

    // 🔗 Optional Firebase UID of the reporting user (for cross-ref)
    firebaseUid: {
      type: String,
      required: false,
      index: true,
    },

    // ⚙️ Rescue progress status
    status: {
      type: String,
      enum: [
        "Yet to be picked up",
        "Picked up",
        "In treatment",
        "Treatment done",
      ],
      default: "Yet to be picked up",
    },

    // 👥 All users who reported/updated this same animal
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 📝 Multiple descriptions from different users
    descriptions: [
      {
        text: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // 📸 Array of images uploaded by any user
    photos: [
      {
        url: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // 📍 GeoJSON location for spatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // 📜 History of all updates (for tracking)
    history: [
      {
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            required: true,
          },
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 📍 Index for GeoSpatial queries (very important for $geoNear)
reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);
