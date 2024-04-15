const express = require('express');
const { doctorRegistration, doctorLogin, DoctorAuthController, DoctorApplicationForm } = require('../controllers/doctor.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { AuthController } = require('../controllers/user.controller');
const router= express.Router()

router.post('/register-doctor', doctorRegistration)
router.post('/login-doctor', doctorLogin)
router.get("/get-doctor-data", authMiddleware, DoctorAuthController);
router.post("/apply-doctor",DoctorApplicationForm)

module.exports = router