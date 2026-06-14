const express=require("express");
const router=express.Router();
const { testAuth, registerUser ,loginUser, getCurrentUser,updateProfile,updatePassword, logOutuser} = require("../controllers/auth.controller");
const protect=require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const User = require("../models/user.model");




router.get("/profile",protect,(req,res)=>
{
    res.status(200).json(
        {
            success:true,
            user:req.user,
        }
    );
});

router.get("/test", testAuth);

router.post("/register", registerUser);

router.post("/login",loginUser);

router.get("/me",protect,getCurrentUser);

router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Welcome Admin"
        });

    }
);

router.put("/Profile",protect,updateProfile);

router.put("/change-password",protect,updatePassword);

router.post("/logout",protect,logOutuser);




module.exports=router;