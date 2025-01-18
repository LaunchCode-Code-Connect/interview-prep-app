import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactMediaRecorder } from "react-media-recorder";
import "./q-page.css"

function InterviewQuestion() {
  // ---------- state variables ----------
  const [questionText, setQuestionText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  // STAR fields
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");

  // Example: get "id" from URL
  const { id: question_id } = useParams();

  // ---------- fetch question on mount ----------
  useEffect(() => {
    const getQuestion = async (qId) => {
      try {
        // for example, /api/questions/:id
        const res = await fetch(`/api/questions/${qId}`);
        if (!res.ok) {
          throw new Error("Failed to load question data");
        }
        const data = await res.json();
        setQuestionText(data.question_text || "");
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    if (question_id) {
      getQuestion(question_id);
    }
  }, [question_id]);

  // ---------- Timer logic ----------
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

  // ---------- Speech Synthesis (Read Question) ----------
  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(questionText);
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      setShowTimer(true);
      setTimeRemaining(300); // 5 minutes
    };

    window.speechSynthesis.speak(utterance);
  };

  // ---------- "Ready to Answer" (show recorder) ----------
  const handleReadyToAnswer = () => {
    setShowTimer(false);
    setTimeRemaining(null);
    setShowRecorder(true);
  };

  // ---------- Save STAR Text ----------
  const handleSaveStarText = async () => {
    // Format date as MM/DD/YYYY
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    const dateUpdated = `${month}/${day}/${year}`;

    const payload = {
      situation_text: situation,
      task_text: task,
      action_text: action,
      response_text: response,
      question_id: question_id || "",
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
    <div className="container my-4">
      <h3 className="mb-3">{questionText}</h3>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="situation" className="form-label">
            Situation
          </label>
          <textarea
            id="situation"
            className="form-control"
            rows="4"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="task" className="form-label">
            Task
          </label>
          <textarea
            id="task"
            className="form-control"
            rows="4"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="action" className="form-label">
            Action
          </label>
          <textarea
            id="action"
            className="form-control"
            rows="4"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="response" className="form-label">
            Response
          </label>
          <textarea
            id="response"
            className="form-control"
            rows="4"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <button className="btn btn-info me-2" onClick={handleSaveStarText}>
          Save STAR Text
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSpeak}
          disabled={isSpeaking}
        >
          {isSpeaking ? "Speaking..." : "Read Question Aloud"}
        </button>
      </div>

      {showTimer && timeRemaining !== null && timeRemaining >= 0 && (
        <div className="d-flex align-items-center mb-3">
          <h5 className="me-3 mb-0">
            Time Remaining: {formatTime(timeRemaining)}
          </h5>
          <button className="btn btn-success" onClick={handleReadyToAnswer}>
            Ready to Answer Question
          </button>
        </div>
      )}

      {showRecorder && <AudioVideoRecorder />}
    </div>
  );
}

export default InterviewQuestion;

/* ----------------------------------- */
/*   AudioVideoRecorder (No Waveform)  */
/* ----------------------------------- */

function AudioVideoRecorder() {
  /*
    We manage local button states to achieve:
    - "Pause", "Resume", "Stop" hidden by default
    - Once "Record" is clicked: 
       -> "Record" text -> "Recording..." (blinks), button disabled
       -> show Pause, Stop
    - "Pause" -> hides Pause, shows Resume, record text -> "Paused"
    - "Resume" -> hides Resume, shows Pause, record text -> "Recording..."
    - "Stop" -> hide Pause & Resume, hide Stop, record text -> "Record", re-enable record
  */

  const [recordButtonText, setRecordButtonText] = useState("Record");
  const [isRecordDisabled, setIsRecordDisabled] = useState(false);

  const [showPause, setShowPause] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showStop, setShowStop] = useState(false);

  // For controlling the "blinking" class when recording
  const isBlinking = recordButtonText === "Recording...";

  // Playback just toggles <video> or user can use the <video> controls
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">Video Recording (Audio + Video)</h5>

        {/* The ReactMediaRecorder handles the actual recording logic */}
        <ReactMediaRecorder
          video
          audio
          render={({
            status,
            startRecording,
            stopRecording,
            pauseRecording,
            resumeRecording,
            mediaBlobUrl: newBlobUrl,
          }) => {
            // If the ReactMediaRecorder has a new blobUrl, store it in our local state
            useEffect(() => {
              if (newBlobUrl) {
                setMediaBlobUrl(newBlobUrl);
              }
            }, [newBlobUrl]);

            // Handlers for each button, updating local states to show/hide buttons
            const onRecordClick = () => {
              // Start recording
              startRecording();
              // Change button text to "Recording..."
              setRecordButtonText("Recording...");
              // Start blinking, disable further clicks
              setIsRecordDisabled(true);
              // Show Pause, Stop, hide Resume
              setShowPause(true);
              setShowStop(true);
              setShowResume(false);
            };

            const onPauseClick = () => {
              // Pause recording
              pauseRecording();
              // Hide Pause, show Resume
              setShowPause(false);
              setShowResume(true);
              // Record button text -> "Paused"
              setRecordButtonText("Paused");
            };

            const onResumeClick = () => {
              // Resume recording
              resumeRecording();
              // Hide Resume, show Pause
              setShowResume(false);
              setShowPause(true);
              // Record button text -> "Recording..."
              setRecordButtonText("Recording...");
            };

            const onStopClick = () => {
              // Stop recording
              stopRecording();
              // Hide Pause, Resume, Stop
              setShowPause(false);
              setShowResume(false);
              setShowStop(false);
              // Reset record button text -> "Record"
              setRecordButtonText("Record");
              // Re-enable record button
              setIsRecordDisabled(false);
            };

            return (
              <div>
                {/* status can be displayed if you want */}
                <p>
                  <strong>Recorder Status:</strong> {status}
                </p>

                {/* RECORD BUTTON */}
                <button
                  className={`btn btn-danger me-2 ${
                    isBlinking ? "blink" : ""
                  }`}
                  onClick={onRecordClick}
                  disabled={isRecordDisabled}
                >
                  {recordButtonText}
                </button>

                {/* PAUSE BUTTON */}
                {showPause && (
                  <button className="btn btn-warning me-2" onClick={onPauseClick}>
                    Pause
                  </button>
                )}

                {/* RESUME BUTTON */}
                {showResume && (
                  <button className="btn btn-secondary me-2" onClick={onResumeClick}>
                    Resume
                  </button>
                )}

                {/* STOP BUTTON */}
                {showStop && (
                  <button className="btn btn-dark me-2" onClick={onStopClick}>
                    Stop
                  </button>
                )}

                {/* PLAYBACK (video) */}
                {mediaBlobUrl && (
                  <div className="mt-3">
                    <h6>Playback:</h6>
                    <video
                      src={mediaBlobUrl}
                      controls
                      className="w-100"
                      style={{ maxHeight: "480px" }}
                    />
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export { AudioVideoRecorder };
