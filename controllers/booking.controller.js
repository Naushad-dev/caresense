const mongoose = require("mongoose");

const { doctor_details } = require("../models/doctorRegisteration.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");

const createBooking = async (req, res) => {
  try {
    let { userId, doctorId, timing } = req.body;
    if (userId.length < 24 || doctorId.length < 24) {
      return res.status(404).json({
        message: "Send correct data",
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

const getBookingDetailsUser = async (req, res) => {
  let { userId } = req.query;
  // console.log(userId);
  userId = userId;
  try {
    let bookings = await Booking.aggregate([
      // Stage 1 for matching
      {
        $match: {
          patient: userId,
        },
      },
      // Stage 2 for sorting by appointment
      {
        $sort: {
          appointment: 1,
        },
      },
    ]).exec();

    // If bookings are found, populate the 'doctor' field
    if (bookings.length > 0) {
      bookings = await Booking.populate(bookings, {
        path: "doctor",
        model: "doctor_details",
        select: "-password",
      });

      // Assuming 'doctor_details' has an 'info' field to populate
      bookings = await Booking.populate(bookings, {
        path: "doctor.info",
        model: "doctor",
      });
    }

    // console.log(bookings);

    if (bookings.length < 1) {
      return res.status(404).json({
        message: "No bookings found for the user",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Bookings found for the user",
      success: true,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getAppointmentDetails = async (req, res) => {
  let { doctorId } = req.query;
  // console.log(doctorId);
  doctorId = new mongoose.Types.ObjectId(doctorId);
  try {
    let bookings = await Booking.aggregate([
      // Stage 1 for matching
      {
        $match: {
          doctor: doctorId,
        },
      },
      // Stage 2 for sorting by appointment
      {
        $sort: {
          appointment: 1,
        },
      },
    ]).exec();

    // If bookings are found, populate the 'user' field
    if (bookings.length > 0) {
      bookings = await Booking.populate(bookings, {
        path: "patient",
        model: "User",
        select: "-password -role",
      });
    }

    // console.log(bookings);

    if (bookings.length < 1) {
      return res.status(404).json({
        message: "No appointments  found for you",
        success: false,
      });
    }
    return res.status(200).json({
      message: "You have appointments!! Doctor Sahab",
      success: true,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  createBooking,
  getBookingDetailsUser,
  getAppointmentDetails,
};
