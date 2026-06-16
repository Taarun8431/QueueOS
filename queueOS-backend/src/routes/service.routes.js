const express=require("express");

const router=express.Router();

const {createService, getServicesByBusiness,getServiceById,updateService,deleteService}=require("../controllers/service.controller");

const protect=require("../middlewares/auth.middleware");

const authorizeRoles=require("../middlewares/role.middleware");

router.post("/",protect,authorizeRoles("owner","admin"),createService);

router.get(
  "/business/:businessId",
  protect,
  getServicesByBusiness
);

router.get("/:id", protect, getServiceById);

router.put(
  "/:id",
  protect,
  authorizeRoles("owner", "admin"),
  updateService
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("owner", "admin"),
  deleteService
);
module.exports=router;