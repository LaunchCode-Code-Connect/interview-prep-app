const fs = require("fs");
const path = require("path");

const question_areas = [
  "all",
  "software-dev",
  "data-or-bi-analyst",
  "launchcode-specific",
  "important-general-questions",
];

const questions = [
  {
    question_id: 1,
    question_text: "Can you explain your liftoff app to me?",
    question_type: "Behavioral/Technical",
    question_area: question_areas[3],
    example_answer:
      "Situation: I created a personal budgeting web app to track expenses. Action: I designed a simple back-end with a relational database, built a front-end interface, and iterated based on feedback from friends. Response: Completing the project sharpened my full-stack skills, and I learned the importance of user-friendly design.",
  },
  {
    question_id: 2,
    question_text: "Can you explain your liftoff app to me?",
    question_type: "Behavioral/Technical",
    question_area: question_areas[3],
    example_answer:
      "Situation: I created a personal budgeting web app to track expenses. Action: I designed a simple back-end with a relational database, built a front-end interface, and iterated based on feedback from friends. Response: Completing the project sharpened my full-stack skills, and I learned the importance of user-friendly design.",
  },
];

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
  fs.writeFileSync(ANSWERS_FILE_PATH, "[]", "utf8");
}

const getQMap = () => {
  const qMap = new Map();

  for (let q of questions) {
    qMap.set(Number(q["question_id"]), q);
  }

  // 1) Build a map of the second file (rightData) keyed by question_id

  // const joinedData = new Map();
  const f_data = fs.readFileSync(FAVORITES_FILE, "utf8");
  const a_data = fs.readFileSync(ANSWERS_FILE_PATH, "utf8");

  const favorites = JSON.parse(f_data);
  const answers = JSON.parse(a_data);

  for (let id of favorites) {
    const q_record = qMap.get(Number(id));
    if (q_record) {
      q_record["is_favorite"] = true;
      qMap.set(Number(id), q_record);
    }
  }

  for (let a in answers) {
    const id = Number(a["question_id"]);
    const q_record = qMap.get(id);
    if (q_record) {
      q_record["user_notes"] = a;
      qMap.set(id, q_record);
    }
  }

  return qMap
};

module.exports = {
  getQMap,
};
