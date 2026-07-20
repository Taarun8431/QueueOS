const prisma = require("../config/prisma");

const createBusiness = async (req, res) => {
    try {
        const {
            businessName,
            businessEmail,
            description,
            category,
            address,
            phone,
            workingHours,
        } = req.body;

        if (!businessName || !businessEmail || !category || !address || !workingHours) {
            return res.status(400).json({
                success: false,
                message: "Required field missing"
            });
        }

        const business = await prisma.business.create({
            data: {
                businessName,
                businessEmail,
                description,
                category,
                address,
                phone,
                workingHoursOpen: workingHours.open,
                workingHoursClose: workingHours.close,
                ownerId: req.user.userId,
            }
        });

        return res.status(201).json({
            success: true,
            message: "Business created successfully",
            data: business,
        });

    } catch (error) {
        console.log(req.body);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getbusiness = async (req, res) => {
    try {
        const businesses = await prisma.business.findMany({
            where: {
                ownerId: req.user.userId,
                isActive: true
            }
        });
        
        return res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await prisma.business.findMany({
            where: {
                isActive: true
            }
        });
        return res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getBusinessById = async (req, res) => {
    try {
        const business = await prisma.business.findFirst({
            where: {
                id: req.params.id,
                isActive: true,
            }
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
        const business = await prisma.business.findFirst({
            where: {
                id: req.params.id,
                isActive: true
            }
        });
        
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }
        
        if (
            business.ownerId !== req.user.userId &&
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

        const updateData = {};
        if (businessName) updateData.businessName = businessName;
        if (businessEmail) updateData.businessEmail = businessEmail;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (workingHours && workingHours.open) updateData.workingHoursOpen = workingHours.open;
        if (workingHours && workingHours.close) updateData.workingHoursClose = workingHours.close;

        const updatedBusiness = await prisma.business.update({
            where: { id: req.params.id },
            data: updateData
        });
        
        return res.status(200).json({
            success: true,
            message: "Business updated successfully",
            data: updatedBusiness,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const deleteBusiness = async (req, res) => {
    try {
        const business = await prisma.business.findFirst({
            where: {
                id: req.params.id,
                isActive: true,
            }
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this business",
            });
        }

        await prisma.business.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

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

module.exports = { createBusiness, getbusiness, getAllBusinesses, getBusinessById, updateBusiness, deleteBusiness };
