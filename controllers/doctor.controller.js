const { doctor } = require("../models/doctor.model");
const {doctor_details}= require("../models/doctorRegisteration.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const doctorRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // const userExist = await doctor.findOne({ email: email });
    const userExist= await doctor_details.findOne({ email: email });

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
await doctor_details.findOneAndUpdate({_id:doc._id},{refreshToken:token},{new:true});

    return res.status(200).send({
      status: true,
      message: "User Login Successfully",
      token,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
      error,
    });
  }
};

const DoctorApplicationForm= async (req, res)=>{


  try {

    const details= new doctor(req.body)
    details.save();
    return res.status(200).send({
      message:"Application sucessfully submitted",
      status: true,
      details

    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
    
  }

}

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
        data: user
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

module.exports = { doctorRegistration,doctorLogin,DoctorAuthController,DoctorApplicationForm };
