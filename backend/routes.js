// server.js or similar Express server file
const express = require("express");
const fs = require("fs");
const path = require("path");
const qMap = require("./question-bank/questions");

const router = express.Router();

// Adjust this path to match your directory structure
const ANSWERS_FILE_PATH = path.join(
  __dirname,
  "user-data",
  "user-answers.json"
);

const FAVORITES_FILE = path.join(__dirname, "user-data", "user-favorites.json");


if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, "[]", "utf8");
}
if (!fs.existsSync(ANSWERS_FILE_PATH)) {
  fs.writeFileSync(FAVORITES_FILE, "[]", "utf8");
}

// 1) Build a map of the second file (rightData) keyed by question_id

// const joinedData = new Map();
const f_data = fs.readFileSync(FAVORITES_FILE, "utf8");
const a_data = fs.readFileSync(ANSWERS_FILE_PATH, "utf8");

const favorites = JSON.parse(f_data);
const answers = JSON.parse(a_data)

const inMemQMap = new Map(qMap)

for (let id in favorites){

  const q_record = inMemQMap.get(Number(id))
  if (q_record){
    q_record["is_favorite"] = true
    inMemQMap.set(Number(id), q_record)
  }
}

for (let a in answers){
  const id = Number(a["question_id"])
  const q_record = inMemQMap.get(id)
  if (q_record){
    q_record["user_notes"] = a
    inMemQMap.set(id, q_record)
  }
}


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
    
    res.json(Object.fromEntries(inMemQMap));
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

    const q_record = inMemQMap.get(Number(question_id))
    q_record["user_notes"] = newData
    inMemQMap.set(Number(question_id), q_record) 

    res.json({ success: true });
  } catch (error) {
    console.error("Error writing to user-answers.json:", error);
    res.status(500).json({ error: "Could not save data" });
  }
});

router.get("/questions/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const question_record = inMemQMap.get(id)

    if (question_record) {
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
    const q_record = inMemQMap.get(question_id)
    const isFavorited = q_record.hasOwnProperty("is_favorite") && q_record["is_favorite"] === true
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

    const q_record = inMemQMap.get(question_id)

    if (favorite) {
      // Add if not already present
      if (!favorites.includes(question_id)) {
        favorites.push(question_id);
        q_record["is_favorite"] === true
      }
    } else {
      // Remove if present
      favorites = favorites.filter((id) => id !== question_id);
      q_record["is_favorite"] === false
    }

    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2), "utf8");
   
    inMemQMap.set(question_id, q_record)
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating favorites:", err);
    res.status(500).json({ error: "Could not update favorites" });
  }
});

module.exports = router;
