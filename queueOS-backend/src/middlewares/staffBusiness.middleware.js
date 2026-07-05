const prisma = require("../config/prisma");

const verifyStaffBusiness = async (req, res, next) => {
    try {
        if (req.user.role === "admin" || req.user.role === "owner") {
            return next();
        }

        if (req.user.role !== "staff") {
            return next();
        }

        let businessId =
            req.params?.businessId ||
            req.body?.businessId ||
            req.query?.businessId;


        if (!businessId && req.params.tokenId) {
            const token = await prisma.token.findUnique({
                where: { id: req.params.tokenId },
                select: { businessId: true }
            });
            if (!token) {
                return res.status(404).json({
                    success: false,
                    message: "Token not found",
                });
            }
            businessId = token.businessId;
        }

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business ID could not be determined from the request",
            });
        }

        const assignment = await prisma.staffAssignment.findFirst({
            where: {
                staffId: req.user.userId,
                isActive: true,
            }
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to any business",
            });
        }

        if (assignment.businessId !== businessId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform operations on this business",
            });
        }

        req.staffAssignment = assignment;

        next();
    } catch (error) {
        console.error("verifyStaffBusiness error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = verifyStaffBusiness;
