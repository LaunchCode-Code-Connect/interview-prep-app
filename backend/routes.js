// server.js or similar Express server file
const express = require("express");
const fs = require("fs");
const path = require("path");
const question_records = require("./question-bank/questions")

// Adjust this path to match your directory structure
const ANSWERS_FILE_PATH = path.join(
  __dirname,
  "user-data",
  "user-answers.json"
);

const FAVORITES_FILE = path.join(__dirname, "user-data", "user-favorites.json");

const QUESTIONS_FILE_PATH = path.join(
  __dirname,
  "question-bank",
  "entry-level-software-dev.json"
);

if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, "[]", "utf8");
}
if (!fs.existsSync(ANSWERS_FILE_PATH)) {
  fs.writeFileSync(FAVORITES_FILE, "[]", "utf8");
}

const router = express.Router();

const rawData = fs.readFileSync(QUESTIONS_FILE_PATH, "utf8");

router.get("/search", (req, res) => {
  try {
    // Read JSON file from disk

    // If you want to optionally filter records using query params, you can do so here.
    // For example:

    // Question Types
    // "all",
    // "software-dev",
    // "data-or-bi-analyst",
    // "launchcode-specific",
    // "important-general-questions",

    // let { type } = req.query;
    // if (type) {
    //   // Filter or find
    //   records = records.filter(r => r.type_of_question === type);
    // }

    // Return the records as JSON
    res.json(question_records);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Could not retrieve records." });
  }
});

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
      date_updated,
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
      date_updated,
    };

    if (existingIndex !== -1) {
      answers[existingIndex] = newData;
    } else {
      answers.push(newData);
    }

    // 5) Write back to file
    fs.writeFileSync(
      ANSWERS_FILE_PATH,
      JSON.stringify(answers, null, 2),
      "utf8"
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error writing to user-answers.json:", error);
    res.status(500).json({ error: "Could not save data" });
  }
});

router.get("/questions/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const question_record = question_records.filter(
      (o) =>  o["question_id"] === id
    );

    if (question_record.length > 0) {
      return res.send(question_record);
    } else {
      res.send({});
    }
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Could not retrieve records." });
  }
});

router.get("/questions/:id/favorite", (req, res) => {
  try {
    const question_id = parseInt(req.params.id, 10);
    const data = fs.readFileSync(FAVORITES_FILE, "utf8");
    const favorites = JSON.parse(data); // e.g. [1, 2, 5, ...]
    console.log(favorites)
    const isFavorited = favorites.includes(question_id);
    res.json({ isFavorited });
  } catch (err) {
    console.error("Error reading favorites:", err);
    res.status(500).json({ error: "Could not read favorites" });
  }
});

router.post("/questions/:id/favorite", (req, res) => {
  try {
    const question_id = parseInt(req.params.id, 10);
    const { favorite } = req.body; // true => add, false => remove
    let data = fs.readFileSync(FAVORITES_FILE, "utf8");
    let favorites = JSON.parse(data);

    if (favorite) {
      // Add if not already present
      if (!favorites.includes(question_id)) {
        favorites.push(question_id);
      }
    } else {
      // Remove if present
      favorites = favorites.filter((id) => id !== question_id);
    }

    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2), "utf8");
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating favorites:", err);
    res.status(500).json({ error: "Could not update favorites" });
  }
});

module.exports = router;
