import React, { useState, useEffect, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import WaveSurfer from "wavesurfer.js";
// If you have React Router for reading URL params:
import { useParams } from "react-router-dom";

function InterviewQuestion({ question_text }) {
  question_text = "Example"
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // Local state for text fields
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");

  // If using React Router to get question_id from the URL
  const { id: question_id } = useParams(); // e.g., /question/123 => question_id = "123"

  // Timer logic
  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${ss < 10 ? "0" + ss : ss}`;
  };

  // Web Speech API
  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(question_text);
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      setShowTimer(true);
      setTimeRemaining(300); // 5 min
    };

    window.speechSynthesis.speak(utterance);
  };

  // When user is ready to answer (removes timer, shows recorder)
  const handleReadyToAnswer = () => {
    setShowTimer(false);
    setTimeRemaining(null);
    setShowAudioRecorder(true);
  };

  // Handle "Save STAR Text" click
  const handleSaveStarText = async () => {
    // Format current date as MM/DD/YYYY
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    const dateUpdated = `${month}/${day}/${year}`;

    // Prepare payload
    const payload = {
      situation_text: situation,
      task_text: task,
      action_text: action,
      response_text: response,
      question_id: question_id || "", // in case there's no param
      date_updated: dateUpdated,
    };

    try {
      const res = await fetch("/api/save-star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("STAR text saved successfully!");
      } else {
        alert("Error saving STAR text. Check server logs.");
      }
    } catch (error) {
      console.error("Error saving STAR text:", error);
      alert("Unable to save. Ensure the server is running.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>{question_text}</h3>

      {/* Textareas for Situation, Task, Action, Response */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="situation"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Situation
          </label>
          <textarea
            id="situation"
            rows="4"
            style={{ width: "100%" }}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="task"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Task
          </label>
          <textarea
            id="task"
            rows="4"
            style={{ width: "100%" }}
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
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
          <textarea
            id="action"
            rows="4"
            style={{ width: "100%" }}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="response"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Response
          </label>
          <textarea
            id="response"
            rows="4"
            style={{ width: "100%" }}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
      </div>

      {/* Third row with Save STAR Text button */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleSaveStarText}>Save STAR Text</button>
      </div>

      {/* Button to speak question */}
      <button onClick={handleSpeak} disabled={isSpeaking}>
        {isSpeaking ? "Speaking..." : "Read Question Aloud"}
      </button>

      {/* Countdown + Ready to Answer */}
      {showTimer && timeRemaining !== null && timeRemaining >= 0 && (
        <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginRight: "20px",
            }}
          >
            Time Remaining: {formatTime(timeRemaining)}
          </div>
          <button onClick={handleReadyToAnswer}>Ready to Answer Question</button>
        </div>
      )}

      {/* Audio Recorder */}
      {showAudioRecorder && <AudioRecorder />}
    </div>
  );
}

export default InterviewQuestion;

/* -------------------------------------------- */
/*           Audio Recorder Component          */
/* -------------------------------------------- */

function AudioRecorder() {
  const waveSurferRef = useRef(null);
  const [waveSurfer, setWaveSurfer] = useState(null);

  // Initialize WaveSurfer once on mount
  useEffect(() => {
    if (!waveSurferRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#ccc",
        progressColor: "#333",
        cursorColor: "#999",
        barWidth: 2,
        barRadius: 2,
        responsive: true,
        height: 80
      });
      setWaveSurfer(waveSurferRef.current);
    }
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <ReactMediaRecorder
        audio
        render={({
          status,
          startRecording,
          stopRecording,
          pauseRecording,
          resumeRecording,
          mediaBlobUrl
        }) => {
          // Whenever the blob url updates, load it into WaveSurfer for playback
          useEffect(() => {
            if (waveSurfer && mediaBlobUrl) {
              waveSurfer.load(mediaBlobUrl);
            }
          }, [mediaBlobUrl, waveSurfer]);

          // For "playback" via WaveSurfer
          const handlePlayback = () => {
            if (waveSurfer) {
              waveSurfer.playPause(); // If paused, play. If playing, pause.
            }
          };

          return (
            <div>
              <h4>Recording Status: {status}</h4>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button onClick={startRecording}>Record</button>
                <button onClick={pauseRecording}>Pause</button>
                <button onClick={resumeRecording}>Resume</button>
                <button onClick={stopRecording}>Stop</button>
                <button onClick={handlePlayback}>Playback</button>
              </div>

              {/* Waveform container */}
              <div id="waveform" style={{ marginTop: "20px" }} />

              {/* Optionally display audio below, if you want a native control */}
              {mediaBlobUrl && (
                <audio src={mediaBlobUrl} controls style={{ marginTop: "10px" }} />
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
