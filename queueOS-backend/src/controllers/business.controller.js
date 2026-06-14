const Business = require("../models/business.model");
const jwt = require("jsonwebtoken");

const createBusiness = async (req, res) => {
    try {
        const
            {
                businessName,
                businessEmail,
                description,
                category,
                address,
                phone,
                workingHours,

            } = req.body;
        if (!businessName || !businessEmail || !description || !category || !address || !workingHours) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Required field missing"
                }
            );
        }
        const business = await Business.create(
            {
                businessName,
                businessEmail,
                description,
                category,
                address,
                phone,
                workingHours,
                ownerId: req.user.userId,
            }
        );
        return res.status(201).json(
            {
                success: true,
                message: "Business created successfully",
                data: business,
            }
        );


    }
    catch (error) {
        console.log(req.body);
        return res.status(500).json(
            {
                success: false,
                message: error.message
            }
        );
    }

}

const getbusiness = async (req, res) => {
    try {
        const businesses = await Business.find(
            {
                ownerId: req.user.userId,
                isActive: true
            }
        );
        return res.status(200).json(
            {
                success: true,
                count: businesses.length,
                data: businesses,
            }
        );

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateBusiness = async (req, res) => {
    try {
        const business = await Business.findOne(
            {
                _id: req.params.id,
                isActive: true

            }
        );
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }
        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this business",
            });
        }
        const {
            businessName,
            businessEmail,
            description,
            category,
            address,
            phone,
            workingHours,
        } = req.body;

        const allowedUpdates = {
            businessName,
            businessEmail,
            description,
            category,
            address,
            phone,
            workingHours,
        };

        Object.keys(allowedUpdates).forEach((key) => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedBusiness = await Business.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            success: true,
            message: "Business updated successfully",
            data: updatedBusiness,
        });


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this business",
      });
    }

    business.isActive = false;
    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { createBusiness, getbusiness, getBusinessById, updateBusiness,deleteBusiness };
