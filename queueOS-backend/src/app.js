const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();


const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const serviceRoutes = require("./routes/service.routes");
const queueRoutes = require("./routes/queue.routes");
const notificationRoutes = require("./routes/notification.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const analyticsRoutes = require("./routes/analytics.routes");


app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);


module.exports = app;



