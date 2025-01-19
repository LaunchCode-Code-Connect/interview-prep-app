const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs")
const apiRoutes = require("./routes");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Root route

const USER_DATA_DIR = path.join(__dirname, "user-data");
const ANSWERS_FILE_PATH = path.join(
  __dirname,
  "user-data",
  "user-answers.json"
);

const FAVORITES_FILE = path.join(__dirname, "user-data", "user-favorites.json");

const PREPPED_FILE_PATH = path.join(
  __dirname,
  "user-data",
  "user-prepped.json"
);

if (!fs.existsSync(USER_DATA_DIR)) {
  fs.mkdirSync(USER_DATA_DIR);
  console.log(`Directory '${USER_DATA_DIR}' created.`);
}
if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, "[]", "utf8");
}
if (!fs.existsSync(ANSWERS_FILE_PATH)) {
  fs.writeFileSync(ANSWERS_FILE_PATH, "[]", "utf8");
}
if (!fs.existsSync(PREPPED_FILE_PATH)) {
  fs.writeFileSync(PREPPED_FILE_PATH, "[]", "utf8");
}

app.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to the api",
  });
});

app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
