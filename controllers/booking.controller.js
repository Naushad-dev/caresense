const mongoose = require("mongoose");

const { doctor_details } = require("../models/doctorRegisteration.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");

const createBooking = async (req, res) => {
  try {
    let { userId, doctorId, timing } = req.body;
    if (userId.length < 24 || doctorId.length < 24) {
      return res.status(404).json({
        message: "send correct data",
        success: false,
      });
    }
    userId = new mongoose.Types.ObjectId(userId);
    doctorId = new mongoose.Types.ObjectId(doctorId);
    timing = new Date(timing);
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const doctor = await doctor_details.findOne({ _id: doctorId });
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }
    const newBooking = await Booking.create({
      patient: user._id,
      doctor: doctor._id,
      appointment: timing,
    });
    return res.status(200).json({
      message: "Booking created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = { createBooking };
