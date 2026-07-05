const prisma = require("../config/prisma");

const createService = async (req, res) => {
    try {
        const {
            serviceName,
            businessId,
            description,
            estimatedDuration,
            price,
        } = req.body;

        if (!serviceName || !businessId || estimatedDuration === undefined || price === undefined) {
            return res.status(400).json({
                success: "false",
                message: "Required fields missing"
            });
        }

        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                isActive: true,
            }
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }
        
        if (business.ownerId !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access",
            });
        }
        
        const service = await prisma.service.create({
            data: {
                serviceName,
                businessId,
                description,
                estimatedDuration,
                price,
            }
        });
        
        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getServicesByBusiness = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: {
                businessId: req.params.businessId,
                isDeleted: false,
            }
        });

        return res.status(200).json({
            success: true,
            count: services.length,
            data: services,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await prisma.service.findFirst({
            where: {
                id: req.params.id,
                isDeleted: false,
            }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateService = async (req, res) => {
    try {
        const service = await prisma.service.findFirst({
            where: {
                id: req.params.id,
                isDeleted: false,
            }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const business = await prisma.business.findUnique({
            where: { id: service.businessId }
        });

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this service",
            });
        }

        const { serviceName, description, estimatedDuration, price } = req.body;

        const updateData = {};
        if (serviceName) updateData.serviceName = serviceName;
        if (description) updateData.description = description;
        if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
        if (price !== undefined) updateData.price = price;

        const updatedService = await prisma.service.update({
            where: { id: req.params.id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await prisma.service.findFirst({
            where: {
                id: req.params.id,
                isDeleted: false,
            }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const business = await prisma.business.findUnique({
            where: { id: service.businessId }
        });

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this service",
            });
        }

        await prisma.service.update({
            where: { id: req.params.id },
            data: { isDeleted: true }
        });

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createService,
    getServicesByBusiness,
    getServiceById,
    updateService,
    deleteService
};