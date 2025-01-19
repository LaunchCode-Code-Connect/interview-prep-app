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

// for (let i = 2; i <= 100; i++) {
//   questions.push({
//     question_id: i,
//     question_text: "Filler",
//     question_type: "Technical",
//     question_area: question_areas[2],
//     example_answer:
//      "Example answer"
//   });
// }

module.exports = questions;
