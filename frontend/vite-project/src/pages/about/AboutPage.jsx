import React from "react";

function AboutPage() {
  return (
    <div className="container">
      <h1 className="display-3">Behavioral Interview Prep App</h1>

      <p>
        This app for preparin'
      </p>

      <h3 className="display-4">Key Features:</h3>
      <ul>
        <li>A managed process to prompt you with a question, give you time for Situation-Action-Response writing, and then recording the audio of your answer.</li>
        <li>Ability to search through the questions in the app, favorite them, and save your answers to them.</li>
      </ul>
      <a href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/">
        MIT Recommendations for using the STAR Method in Interviews
      </a>
    </div>
  );
}

export default AboutPage;
