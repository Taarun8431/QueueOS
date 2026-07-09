const prisma = require("../config/prisma");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const assignStaff = async (req, res) => {
    try {
        const { staffId, businessId, roleType } = req.body;

        if (!staffId || !businessId) {
            return res.status(400).json({
                success: false,
                message: "staffId and businessId are required",
            });
        }

        const staffUser = await prisma.user.findFirst({
            where: {
                id: staffId,
                role: "staff",
                isDeleted: false,
            }
        });

        if (!staffUser) {
            return res.status(404).json({
                success: false,
                message: "Staff user not found",
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

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign staff to this business",
            });
        }

        const existingAssignment = await prisma.staffAssignment.findUnique({
            where: { staffId }
        });

        let assignment;
        if (existingAssignment) {
            assignment = await prisma.staffAssignment.update({
                where: { staffId },
                data: {
                    businessId,
                    assignedById: req.user.userId,
                    isActive: true,
                    ...(roleType && { roleType })
                }
            });
        } else {
            assignment = await prisma.staffAssignment.create({
                data: {
                    staffId,
                    businessId,
                    assignedById: req.user.userId,
                    isActive: true,
                    ...(roleType && { roleType })
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: `${staffUser.name} has been assigned to ${business.businessName}`,
            data: assignment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const unassignStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        const assignment = await prisma.staffAssignment.findFirst({
            where: {
                staffId,
                isActive: true,
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "No active assignment found for this staff member",
            });
        }

        const business = await prisma.business.findUnique({
            where: { id: assignment.businessId }
        });

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this staff assignment",
            });
        }

        await prisma.staffAssignment.update({
            where: { id: assignment.id },
            data: { isActive: false }
        });

        return res.status(200).json({
            success: true,
            message: "Staff assignment removed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStaffForBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;

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

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view staff for this business",
            });
        }

        const assignments = await prisma.staffAssignment.findMany({
            where: {
                businessId,
                isActive: true,
            },
            include: {
                staff: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMyAssignment = async (req, res) => {
    try {
        const assignment = await prisma.staffAssignment.findFirst({
            where: {
                staffId: req.user.userId,
                isActive: true,
            },
            include: {
                business: {
                    select: { businessName: true, category: true, address: true, phone: true, workingHoursOpen: true, workingHoursClose: true }
                },
                assignedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "You are not assigned to any business",
            });
        }

        return res.status(200).json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const createAndAssignStaff = async (req, res) => {
    try {
        const { name, phone, businessId, roleType } = req.body;

        if (!name || !businessId) {
            return res.status(400).json({
                success: false,
                message: "Name and businessId are required",
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

        if (
            business.ownerId !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign staff to this business",
            });
        }

        const randomString = crypto.randomBytes(3).toString("hex");
        const generatedEmail = `staff_${randomString}@queueos.com`;
        const generatedPassword = crypto.randomBytes(4).toString("hex");

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const staffUser = await prisma.user.create({
            data: {
                name,
                email: generatedEmail,
                password: hashedPassword,
                phone: phone || "0000000000",
                role: "staff",
            }
        });

        const assignment = await prisma.staffAssignment.create({
            data: {
                staffId: staffUser.id,
                businessId,
                assignedById: req.user.userId,
                isActive: true,
                ...(roleType && { roleType })
            }
        });

        return res.status(201).json({
            success: true,
            message: `Staff account created and assigned to ${business.businessName}`,
            data: {
                assignment,
                credentials: {
                    email: generatedEmail,
                    password: generatedPassword
                }
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getDoctorsByRole = async (req, res) => {
    try {
        const { businessId, roleType } = req.query; // roleType can be OPD_Doctor or Appointment_Doctor

        if (!businessId || !roleType) {
            return res.status(400).json({
                success: false,
                message: "businessId and roleType are required"
            });
        }

        const staffAssignments = await prisma.staffAssignment.findMany({
            where: {
                businessId,
                roleType,
                isActive: true
            },
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // Add emergency status flag
        const doctors = staffAssignments.map(assignment => ({
            ...assignment.staff,
            isEmergencyPaused: assignment.isEmergencyPaused
        }));

        return res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getDoctorAvailability = async (req, res) => {
    try {
        const { staffId, businessId, date } = req.query;

        if (!staffId || !businessId || !date) {
            return res.status(400).json({
                success: false,
                message: "staffId, businessId, and date are required"
            });
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();

        // 1. Get the schedule for this day
        const schedule = await prisma.staffSchedule.findFirst({
            where: {
                staffId,
                businessId,
                dayOfWeek,
                isActive: true
            }
        });

        if (!schedule) {
            return res.status(200).json({
                success: true,
                message: "Doctor is not scheduled on this day",
                data: []
            });
        }

        // 2. Generate all possible time slots for the schedule
        const availableSlots = [];
        const startParts = schedule.startTime.split(':');
        const endParts = schedule.endTime.split(':');
        
        let currentSlot = new Date(targetDate);
        currentSlot.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);
        
        const endTime = new Date(targetDate);
        endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

        while (currentSlot < endTime) {
            const timeString = currentSlot.toTimeString().substring(0, 5); // HH:MM
            availableSlots.push(timeString);
            
            // Increment by slot duration
            currentSlot.setMinutes(currentSlot.getMinutes() + schedule.slotDuration);
        }

        // 3. Find booked appointments for this doctor on this day
        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                staffId,
                businessId,
                appointmentDate: targetDate,
                status: {
                    in: ["scheduled", "checked_in"]
                }
            }
        });

        const bookedTimes = new Set(bookedAppointments.map(app => app.appointmentTime));

        // 4. Filter out booked slots
        const finalAvailableSlots = availableSlots.filter(slot => !bookedTimes.has(slot));

        return res.status(200).json({
            success: true,
            data: finalAvailableSlots
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { assignStaff, unassignStaff, getStaffForBusiness, getMyAssignment, createAndAssignStaff, getDoctorsByRole, getDoctorAvailability };
