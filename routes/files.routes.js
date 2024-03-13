const express = require("express");
const { upload, uploadFile } = require("../controllers/files.controller");
const router = express.Router();

router.post("/upload-file",upload.single('image'),uploadFile)

module.exports = router;