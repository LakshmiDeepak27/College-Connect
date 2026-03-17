const express = require('express');
const router= express.Router();
const {register , login , getProfile, verifyEmail} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register" , register);
router.post("/login" , login);
router.get("/verify-email", verifyEmail);
module.exports = router;
