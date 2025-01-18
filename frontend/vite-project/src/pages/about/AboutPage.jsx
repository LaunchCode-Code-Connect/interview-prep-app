import React from "react";

function AboutPage() {
  return (
    <div className="container">
      <h1 class="display-3">User Behavior Dataset </h1>

      <p>
        This dataset provides a comprehensive analysis of mobile device usage
        patterns and user behavior classification. It contains 700 samples of
        user data, including metrics such as app usage time, screen-on time,
        battery drain, and data consumption. Each entry is categorized into one
        of five user behavior classes, ranging from light to extreme usage,
        allowing for insightful analysis and modeling.
      </p>

      <h3 class="display-4">Key Features:</h3>
      <ul>
        <li>User ID: Unique identifier for each user.</li>
        <li>Device Model: Model of the user's smartphone.</li>
        <li>Operating System: The OS of the device (iOS or Android).</li>

        <li>
          App Usage Time: Daily time spent on mobile applications, measured in
          minutes.
        </li>
        <li>Screen On Time: Average hours per day the screen is active.</li>
        <li>Battery Drain: Daily battery consumption in mAh.</li>
        <li>Number of Apps Installed: Total apps available on the device.</li>
        <li>Data Usage: Daily mobile data consumption in megabytes.</li>
        <li>Age: Age of the user.</li>
        <li>Gender: Gender of the user (Male or Female).</li>
        <li>
          User Behavior Class: Classification of user behavior based on usage
          patterns (1 to 5).
        </li>
      </ul>
      <a href="https://www.kaggle.com/datasets/valakhorasani/mobile-device-usage-and-user-behavior-dataset?resource=download">
        Sourced from this Kaggle Dataset
      </a>
    </div>
  );
}

export default AboutPage;
