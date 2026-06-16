const Service = require("../models/services.model");
const Business = require("../models/business.model");

const createService = async (req, res) => {
    try {
        const
            {
                serviceName,
                businessId,
                description,
                estimatedDuration,
                price,
            } = req.body;

        if (!serviceName || !businessId || estimatedDuration === undefined || price === undefined) {
            return res.status(400).json(
                {
                    success: "false",
                    message: "Required fields missing"
                }
            );
        }

        const business = await Business.findOne(
            {
                _id: businessId,
                isActive: true,
            }
        );

        if (!business) {
            return res.status(404).json(
                {
                    success: false,
                    message: "Business not found",
                }
            )
        }
        if (business.ownerId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json(
                {
                    success: false,
                    message: "Not authorized to access",
                }
            );
        }
        const service = await Service.create(
            {
                serviceName,
                businessId,
                description,
                estimatedDuration,
                price,
            }

        )
        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getServicesByBusiness = async (req, res) => {
    try {
        const services = await Service.find({
            businessId: req.params.businessId,
            isActive: true,
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
        const service = await Service.findOne({
            _id: req.params.id,
            isActive: true,
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
        const service = await Service.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const business = await Business.findById(service.businessId);

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this service",
            });
        }

        const { serviceName, description, estimatedDuration, price } = req.body;

        const allowedUpdates = {
            serviceName,
            description,
            estimatedDuration,
            price,
        };

        Object.keys(allowedUpdates).forEach((key) => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        );

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
        const service = await Service.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const business = await Business.findById(service.businessId);

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this service",
            });
        }

        service.isActive = false;
        await service.save();

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