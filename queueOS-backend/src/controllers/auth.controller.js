const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const testAuth = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Test Authoriztion working perfectly"
    })
}
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role, dob } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Name,email,pasowrd or phone is missing please check",
                });

        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json(
                {
                    success: false,
                    message: "User already exists",
                }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            dob,
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Email or password required",
                });
        }
        const user = await User.findOne({ email });

        if (!user || user.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "email or user does not exist",
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password",
            })
        }
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );

        return res.status(200).json(
            {
                success: true,
                message: "Login sucessful",
                token,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            });
    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                sucess: false,
                message: "Login failed",
                error: error.message,
            }
        );

    }

}
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json(
                {
                    success: "false",
                    message: "User not found",
                }
            )
        }
        return res.status(200).json(
            {
                success: "true",
                data: user,
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {

                success: "message",
                message: error.message,
            }
        )
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, email, dob } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                name,
                email,
                dob
            },
            {
                new: true,
                runValidators: true
            }
        );
        return res.status(200).json(
            {
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            }
        );
    }
    catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: error.message
            }
        );
    }
}

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required",
            });
        }

        const user = await User.findById(req.user.userId).select("+password");
        if (!user) {
            return res.status(404).json(
                {
                    success: false,
                    message: "User not found"
                }
            )
        }
        console.log(user.password);
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);


        if (!isPasswordMatch) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Old password is incorrect",
                }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });



    }
    catch (error) {
        console.log(error)
        return res.status(404).json(
            {
                success: false,
                message: error.message
            }
        );
    }
}

const logOutuser=async(req,res)=>
{
    return res.status(200).json(
        {
            success:true,
            message:"User logout Successgul",
        }
    );
};





module.exports = { testAuth, registerUser, loginUser, getCurrentUser, updateProfile, updatePassword,logOutuser };
