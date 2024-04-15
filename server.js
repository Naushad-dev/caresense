const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const dotenv = require("dotenv").config();
const DB_connection = require("./helper/DB_connection");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

DB_connection();
const port = process.env.PORT || 6969;

//routes
const userRoutes = require("./routes/user.routes");
const fileRoutes = require("./routes/files.routes");
const doctorRoutes = require("./routes/doctor.routes");
const bookingRoutes = require("./routes/booking.routes");
app.use("/api/v1/", userRoutes);
app.use("/api/v1/", fileRoutes);
app.use("/api/v1/", doctorRoutes);
app.use("/api/v1/", bookingRoutes);

app.listen(port, () => {
  console.log(`server successfully started at ${port}`);
});
