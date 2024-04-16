const express = require("express");
const {
  createBooking,
  getBookingDetailsUser,
  getAppointmentDetails,
} = require("../controllers/booking.controller");

const router = express.Router();

router.post("/booking", createBooking);
router.get("/get-booking", getBookingDetailsUser);
router.get("/get-appointment", getAppointmentDetails);
module.exports = router;
