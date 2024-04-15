const express = require("express");
const { createBooking } = require("../controllers/booking.controller");

const router = express.Router();

router.post("/booking", createBooking);
module.exports = router;
