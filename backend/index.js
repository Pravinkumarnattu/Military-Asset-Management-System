const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

const routes = require("./src/routes/route");
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Kristallball API is running" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running at port ${process.env.PORT || 5000}`);
});
