import React, { useState, useEffect } from "react";

function InterviewQuestion({ question_text }) {
  question_text = "Here is an example thing";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Effect to handle the countdown timer once timeRemaining is set
  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;

    // If timeRemaining >= 0, set an interval to count down every second
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format the remaining time as MM:SS
  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${ss < 10 ? "0" + ss : ss}`;
  };

  // Function to handle text-to-speech
  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(question_text);
    setIsSpeaking(true);

    // When speech ends, start the countdown
    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeRemaining(300); // 5 minutes in seconds
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>{question_text}</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="situation"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Situation
          </label>
          <textarea id="situation" rows="4" style={{ width: "100%" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="task"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Task
          </label>
          <textarea id="task" rows="4" style={{ width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="action"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Action
          </label>
          <textarea id="action" rows="4" style={{ width: "100%" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="response"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Response
          </label>
          <textarea id="response" rows="4" style={{ width: "100%" }} />
        </div>
      </div>

      <button onClick={handleSpeak} disabled={isSpeaking}>
        {isSpeaking ? "Speaking..." : "Read Question Aloud"}
      </button>

      {/* Render the countdown once it's started (timeRemaining is not null) */}
      {timeRemaining !== null && timeRemaining >= 0 && (
        <div
          style={{ marginTop: "20px", fontSize: "1.5rem", fontWeight: "bold" }}
        >
          Time Remaining: {formatTime(timeRemaining)}
        </div>
      )}
    </div>
  );
}

export default InterviewQuestion;
