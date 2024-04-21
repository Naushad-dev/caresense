const { doctor } = require("../models/doctor.model");
const { doctor_details } = require("../models/doctorRegisteration.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const { uploadToCloudinary } = require("../helper/Cloudinary");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("got file", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const doctorRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // const userExist = await doctor.findOne({ email: email });
    const userExist = await doctor_details.findOne({ email: email });

    if (userExist) {
      return res.status(400).send({
        status: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new doctor_details({
      name: name,
      email: email,
      password: hashedPassword,
    });
    await newDoctor.save();

    return res.status(200).send({
      status: true,
      message: "New Doctor Registered",
      newDoctor,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
      error,
    });
  }
};

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doc = await doctor_details.findOne({ email: email });

    if (!doc) {
      return res.status(404).send({
        status: false,
        message: "User NOT FOUND",
      });
    }

    const docMatch = await bcrypt.compare(password, doc.password);
    if (!docMatch) {
      return res
        .status(401)
        .send({ message: "Invlid EMail or Password", success: false });
    }

    const token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    await doctor_details.findOneAndUpdate(
      { _id: doc._id },
      { refreshToken: token },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "User Login Successfully",
      token: token,
      doc,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
      error,
    });
  }
};

const doctorDetailsApplication = async (req, res) => {
  const { email, doctorInfo } = req.body;
  console.log(doctorInfo);
  let {
    profilepic,
    licenseNumber,
    address,
    specialization,
    experience,
    feesPerConsultation,
    openingTime,
    closingTime,
    website,
    role,
  } = doctorInfo;
  //Sterilise the input to lowercase
  specialization = specialization.toLowerCase();
  console.log(profilepic);
  openingTime = new Date(openingTime);
  closingTime = new Date(closingTime);
  try {
    const foundDoctor = await doctor_details.findOne({ email: email });
    if (!foundDoctor) {
      return res.status(404).json({
        message: "You are not registered with us as a doctor",
        success: false,
      });
    }
    console.log(foundDoctor);
    const existingdoctorDetails = await doctor.findOne({
      _id: foundDoctor.info,
    });
    if (existingdoctorDetails) {
      return res.status(400).json({
        message: "Already submitted the data",
        success: false,
      });
    }
    const doctorDetails = await doctor.create({
      email: foundDoctor.email,
      name: foundDoctor.name,
      profilepic,
      licenseNumber,
      address,
      specialization,
      experience,
      feesPerConsultation,
      openingTime,
      closingTime,
      website,
      role,
    });
    if (!doctorDetails) {
      throw new Error(
        "There was an error submitting info!! Please try again later"
      );
    }
    foundDoctor.info = doctorDetails._id;
    await foundDoctor.save();
    return res.status(200).json({
      success: true,
      message: "Doctor info has been sent for verification",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getAllDoctorDetails = async (req, res) => {
  try {
    let doctors = await doctor_details.find().select("-password");

    // If no doctors are found, return a 404 response
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        message: "No doctors found",
        success: false,
      });
    }

    doctors = await doctor_details.populate(doctors, {
      path: "info",
      model: "doctor",
      select: "-status",
    });

    // Send the response with populated doctors
    return res.status(200).json({
      message: "Doctors found",
      success: true,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getDoctorWithSpecialization = async (req, res) => {
  const { specialization } = req.query;
  const pipeline = [
    {
      //Used to exclude password
      $project: {
        password: 0,
      },
    },
    {
      //First stage-----> Used to populate and add a new field in the document as doctorInfo
      $lookup: {
        from: "doctors",
        localField: "info",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      //Second stage-----> After populating now finding the actual doctorinfo that have
      $match: {
        "doctorInfo.specialization": {
          $regex: new RegExp("Dermatology", "i"), // Case-insensitive matching
        },
      },
    },
  ];

  const doctors = await doctor_details.aggregate(pipeline);
  if (doctors.length == 0) {
    return res.status(404).json({
      msg: "No doctors found with specialization in " + specialization,
      success: false,
    });
  }
  return res.status(200).json({
    success: true,
    msg: "Here is a list of doctors",
    doctors,
  });
};

const getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const doctor = await doctor_details
      .findOne({ _id: doctorId })
      .select("-password")
      .populate({
        path: "info",
        model: "doctor",
      });

    // If no doctor is found, return a 404 response
    if (!doctor) {
      return res.status(404).json({
        message: "No doctor found",
        success: false,
      });
    }

    // Send the response with the populated doctor profile
    return res.status(200).json({
      message: "Doctor found",
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status;
  }
};
const DoctorAuthController = async (req, res) => {
  try {
    const user = await doctor_details.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

module.exports = {
  doctorRegistration,
  doctorLogin,
  DoctorAuthController,
  doctorDetailsApplication,
  getAllDoctorDetails,
  getDoctorProfile,
  upload,
  getDoctorWithSpecialization,
};
