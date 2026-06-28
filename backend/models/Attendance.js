import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  hoursWorked: Number,
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);