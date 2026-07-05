const prisma = require("../config/prisma");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { client: redisClient } = require("../config/redis");

const createAppointment = async (req, res) => {
    try {
        const { businessId, serviceId, appointmentDate, appointmentTime } = req.body;

        if (!businessId || !serviceId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Business, service, appointment date and time are required",
            });
        }

        const business = await prisma.business.findFirst({
            where: { id: businessId, isActive: true }
        });
        
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        const service = await prisma.service.findFirst({
            where: { id: serviceId, businessId, isActive: true }
        });
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                businessId,
                serviceId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: "scheduled",
            }
        });
        
        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot is already booked",
            });
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                userId: req.user.userId,
                businessId,
                serviceId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: "scheduled",
            }
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
        const { page, limit, skip } = getPagination(req.query);

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: { userId: req.user.userId },
                include: {
                    business: {
                        select: { businessName: true, category: true, address: true, phone: true }
                    },
                    service: {
                        select: { serviceName: true, estimatedDuration: true, price: true }
                    }
                },
                orderBy: { appointmentDate: 'asc' },
                skip,
                take: limit
            }),
            prisma.appointment.count({ where: { userId: req.user.userId } }),
        ]);

        return res.status(200).json({
            success: true,
            pagination: getPaginationMeta(total, page, limit),
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
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
            include: {
                business: {
                    select: { businessName: true, category: true, address: true, phone: true }
                },
                service: {
                    select: { serviceName: true, estimatedDuration: true, price: true }
                }
            }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId !== req.user.userId &&
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
        const { page, limit, skip } = getPagination(req.query);

        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin" &&
            req.user.role !== "staff"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view business appointments",
            });
        }

        const filter = { businessId };

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: filter,
                include: {
                    user: {
                        select: { name: true, email: true, phone: true }
                    },
                    service: {
                        select: { serviceName: true, estimatedDuration: true, price: true }
                    }
                },
                orderBy: { appointmentDate: 'asc' },
                skip,
                take: limit
            }),
            prisma.appointment.count({ where: filter }),
        ]);

        return res.status(200).json({
            success: true,
            pagination: getPaginationMeta(total, page, limit),
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
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this appointment",
            });
        }

        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: "cancelled" }
        });

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            data: updated,
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

        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to reschedule this appointment",
            });
        }

        const slotExists = await prisma.appointment.findFirst({
            where: {
                businessId: appointment.businessId,
                serviceId: appointment.serviceId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: "scheduled",
                id: { not: appointment.id },
            }
        });

        if (slotExists) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot is already booked",
            });
        }

        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: "rescheduled"
            }
        });

        return res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const checkInAppointment = async (req, res) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
            include: { service: true }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.userId !== req.user.userId &&
            req.user.role !== "admin" &&
            req.user.role !== "staff"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to check-in this appointment",
            });
        }

        if (appointment.status !== "scheduled") {
            return res.status(400).json({
                success: false,
                message: `Cannot check-in. Current status is ${appointment.status}`,
            });
        }

        const businessId = appointment.businessId;
        const serviceId = appointment.serviceId;
        const seqKey = `token_seq:${businessId}:${serviceId}`;
        let tokenSequence = await redisClient.incr(seqKey);

        const prefix = appointment.service.serviceName ? appointment.service.serviceName.charAt(0).toUpperCase() : "T";
        const tokenNumber = `A-${prefix}-${tokenSequence}`;

        const token = await prisma.token.create({
            data: {
                tokenNumber,
                tokenSequence,
                customerId: appointment.userId,
                businessId,
                serviceId,
                status: "waiting"
            }
        });

        const queueKey = `queue:${businessId}:${serviceId}`;
        await redisClient.lPush(queueKey, token.id);

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: "checked_in" }
        });

        const io = req.app.get("io");
        if (io) {
            io.to(queueKey).emit("queueUpdated", {
                event: "tokenJoined",
                businessId,
                serviceId,
                token,
            });
            io.to(`queue:${businessId}:all`).emit("queueUpdated", {
                event: "tokenJoined",
                businessId,
                serviceId,
                token,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully checked in. You have been placed at the front of the queue.",
            data: {
                appointment: updatedAppointment,
                token
            },
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
    checkInAppointment,
};
