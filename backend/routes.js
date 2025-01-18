// server.js or similar Express server file
const express = require("express");
const fs = require("fs");
const path = require("path");

// Adjust this path to match your directory structure
const ANSWERS_FILE_PATH = path.join(__dirname, "user-data", "user-answers.json");

const router = express.Router()

// Example route to save data
router.post("/save-star", (req, res) => {
  try {
    // 1) Read existing JSON
    let rawData = fs.readFileSync(ANSWERS_FILE_PATH, "utf8");
    let answers = JSON.parse(rawData); // Should be an array

    // 2) The new or updated object
    const {
      situation_text,
      task_text,
      action_text,
      response_text,
      question_id,
      date_updated
    } = req.body;

    // 3) Find if it already exists
    const existingIndex = answers.findIndex(
      (item) => item.question_id === question_id
    );

    // 4) If exists, replace; if not, push
    const newData = {
      situation_text,
      task_text,
      action_text,
      response_text,
      question_id,
      date_updated
    };

    if (existingIndex !== -1) {
      answers[existingIndex] = newData;
    } else {
      answers.push(newData);
    }

    // 5) Write back to file
    fs.writeFileSync(ANSWERS_FILE_PATH, JSON.stringify(answers, null, 2), "utf8");

    res.json({ success: true });
  } catch (error) {
    console.error("Error writing to user-answers.json:", error);
    res.status(500).json({ error: "Could not save data" });
  }
});


module.exports = router
