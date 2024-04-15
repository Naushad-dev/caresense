const { ref } = require("firebase/database");
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"doctor_details"
    },
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"doctor_details"
    },
    password: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"doctor_details"
    },
    profilepic:{
        type: String,
        required:[true, "Please Provide a profile picture"],
    },
    licenseNumber:{
      type:String,
      required:[true, "Please provide a license number"],
    },
    address: {
      type: String,
      required: [true, "Please enter a valid address"],
    },
    specialization: {
      type: String,
      required: [true, "Please enter a specialization"],
    },
    experience: {
      type: String,
      required: [true, "Please enter your experience"],
    },
    feesPerConsultation: {
      type: Number,
      required: [true, "Please enter fees"],
    },
    timinigs: {
      type: Object,
      required: [true, "Please enter timing"],
    },
    website: {
      type: String,
    },

    role: {
      type: String,
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    status:{
      type: String,
      default:"pending"
    }
  },
  { timestamps: true }
);

const doctor = new mongoose.model("doctor", doctorSchema);

module.exports = { doctor };
