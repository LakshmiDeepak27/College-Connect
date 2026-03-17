const jwt= require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const User = require('../models/User');
// async function handleUserSignUp(req,res){
//     const {username , email , password} = req.body;
//     await User.create({
//         username,
//         email,
//         password,
//     });
//     return res.render("home")
// }


const nodemailer = require('nodemailer');

exports.register = async (req , res)=>{
    try{
        const {username , email , password , countryCode, mobile  , agreeToTerms} = req.body;

        if (!agreeToTerms) {
            return res.status(400).json({ message: "You must agree to terms" });
        }

        if(!username || !email || !password || !countryCode || !mobile){
            return res.status(400).json({message: "All field required"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message : "User already exists"});
        }

        const user= await User.create({
            username,
            email,
            password,
            countryCode,
            mobile,
        });

        // Send verification email
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        // Dummy/Test transporter setup. Note: Should use actual smtp in production.
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or mock service
            auth: {
                user: process.env.EMAIL_USER || 'test@example.com',
                pass: process.env.EMAIL_PASS || 'password'
            }
        });

        const mailOptions = {
            from: 'noreply@collegeconnect.com',
            to: user.email,
            subject: 'Email Verification - College Connect',
            html: `<h3>Please verify your email</h3>
                   <p>Click <a href="http://localhost:5173/verify-email?token=${token}">here</a> to verify your account.</p>`
        };

        // We don't await this so it doesn't block the response, or we can await and catch silently
        transporter.sendMail(mailOptions).catch(err => console.log('Mail failed (mocking):', err.message));

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify.",
            userId: user._id
        });
    }catch(error){
        console.log("register error" , error);
       return res.status(500).json({message: "Server error"});
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        console.log("Verify error", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
};


exports.login = async(req , res)=>{
    try{
         console.log("LOGIN BODY 👉", req.body);
        const {email,password}= req.body;

        if(!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email before logging in." });
        }
        //   return res.status(200).json({
        //     email:user._id,
        //     username: user.username
        // });

        //jwt implementation 

        const token=jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn:process.env.JWT_EXPRESS_IN}
        );

        return res.status(200).json({
            message:"login successfully",
            token
        });

      
    }catch(error){
        console.log("Error from Login: " , error);
        return res.status(500).json({
            message:"Server Error"
        });
    }
};




//user profile

exports.   getProfile = async (req, res) => {
  try {
    // userId comes from JWT middleware
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {
    console.error("PROFILE ERROR ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const mailOptions = {
            from: 'noreply@collegeconnect.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `<h3>You requested a password reset</h3>
                   <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
        };

        transporter.sendMail(mailOptions).catch(err => console.log('Mail failed:', err.message));

        res.status(200).json({ message: "Reset link sent to your email" });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("RESET PASSWORD ERROR", error);
        res.status(500).json({ message: "Server error" });
    }
};