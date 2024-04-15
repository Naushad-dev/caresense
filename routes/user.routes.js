const express = require("express");
const router = express.Router();
const {
  RegisterController,
  LoginController,
  AuthController,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", RegisterController);
router.post("/login", LoginController);
router.get("/get-user-data", authMiddleware, AuthController);
router.get("/users", (req, res) => {
  res.send({
    status: true,
    meassage: "Working",
  });
});

//127.0.0.1:6969
module.exports = router;
