import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  try {
    const { employerPhone, hoursWorked } = req.body;

    if (!employerPhone || hoursWorked === undefined || hoursWorked === null) {
      return res.status(400).json({ message: "Employer phone number and hours worked are required" });
    }

    const parsedHours = Number(hoursWorked);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      return res.status(400).json({ message: "Hours worked must be a positive number" });
    }

    const employer = await User.findOne({ phone: employerPhone });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found with this phone number" });
    }

    if (employer.role !== "employer") {
      return res.status(400).json({ message: "The specified phone number does not belong to an employer" });
    }

    if (employer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot mark attendance with yourself as the employer" });
    }

    const attendance = await Attendance.create({
      worker: req.user._id,
      employer: employer._id,
      hoursWorked: parsedHours
    });

    // Populate employer details before returning
    const populatedAttendance = await Attendance.findById(attendance._id).populate("employer", "name phone");

    res.status(201).json(populatedAttendance);
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    res.status(500).json({ message: "Server error while marking attendance. " + err.message });
  }
};

export const approveAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Verify logged-in user is the employer assigned to this record
    if (attendance.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to approve this attendance record" });
    }

    attendance.approved = true;
    await attendance.save();

    // Populate worker details before sending response
    const populated = await Attendance.findById(attendance._id).populate("worker", "name phone");

    res.json(populated);
  } catch (err) {
    console.error("Approve Attendance Error:", err);
    res.status(500).json({ message: "Server error while approving attendance. " + err.message });
  }
};

export const getEmployerAttendance = async (req, res) => {
  try {
    let records;
    if (req.user.role === "employer") {
      records = await Attendance.find({
        employer: req.user._id
      })
        .populate("worker", "name phone")
        .sort({ createdAt: -1 });
    } else {
      // Role is worker, return worker's marked history
      records = await Attendance.find({
        worker: req.user._id
      })
        .populate("employer", "name phone")
        .sort({ createdAt: -1 });
    }

    res.json(records);
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ message: "Server error while retrieving attendance records. " + err.message });
  }
};