const Appointment = require("../models/appointment.model");
const Business = require("../models/business.model");
const Service = require("../models/services.model");

const createAppointment = async (req, res) => {
    try {
        const { businessId, serviceId, appointmentDate, appointmentTime } = req.body;

        if (!businessId || !serviceId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Business, service, appointment date and time are required",
            });
        }

        const business = await Business.findOne({ _id: businessId, isActive: true });
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        // Fix: was using businessId instead of serviceId for _id lookup
        const service = await Service.findOne({ _id: serviceId, businessId, isActive: true });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Check if this slot is already booked
        const existingAppointment = await Appointment.findOne({
            businessId,
            serviceId,
            appointmentDate,
            appointmentTime,
            status: "scheduled",
        });
        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot is already booked",
            });
        }

        // Fix: was returning the model reference instead of creating a document
        const newAppointment = await Appointment.create({
            userId: req.user.userId,
            businessId,
            serviceId,
            appointmentDate,
            appointmentTime,
        });

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: newAppointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            userId: req.user.userId,
        })
            .populate("businessId", "businessName category address phone")
            .populate("serviceId", "serviceName estimatedDuration price")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("businessId", "businessName category address phone")
            .populate("serviceId", "serviceName estimatedDuration price");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this appointment",
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getBusinessAppointments = async (req, res) => {
    try {
        const { businessId } = req.params;

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId.toString() !== req.user.userId &&
            req.user.role !== "admin" &&
            req.user.role !== "staff"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view business appointments",
            });
        }

        const appointments = await Appointment.find({ businessId })
            .populate("userId", "name email phone")
            .populate("serviceId", "serviceName estimatedDuration price")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this appointment",
            });
        }

        appointment.status = "cancelled";
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            data: appointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime } = req.body;

        if (!appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "New appointment date and time are required",
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to reschedule this appointment",
            });
        }

        // Check slot conflict excluding current appointment
        const slotExists = await Appointment.findOne({
            businessId: appointment.businessId,
            serviceId: appointment.serviceId,
            appointmentDate,
            appointmentTime,
            status: "scheduled",
            _id: { $ne: appointment._id },
        });

        if (slotExists) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot is already booked",
            });
        }

        appointment.appointmentDate = appointmentDate;
        appointment.appointmentTime = appointmentTime;
        appointment.status = "rescheduled";
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully",
            data: appointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    getBusinessAppointments,
    cancelAppointment,
    rescheduleAppointment,
};
