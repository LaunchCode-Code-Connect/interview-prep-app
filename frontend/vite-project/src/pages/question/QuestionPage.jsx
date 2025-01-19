import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactMediaRecorder } from "react-media-recorder";

/**
 * Main InterviewQuestion component
 */
function InterviewQuestion() {
  /* ---------- State Variables ---------- */
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

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);

  // param from URL
  const { id: question_id } = useParams();

  // ---------- On mount, load question + check if favorited ----------
  useEffect(() => {
    const getQuestion = async (qId) => {
      try {
        // 1) Fetch question data from /api/questions/:id
        const questionRes = await fetch(`/api/questions/${qId}`);
        if (!questionRes.ok) throw new Error("Failed to load question data");
        const questionData = await questionRes.json();
        const qText = questionData.length > 0 ? questionData[0].question_text : ""
        setQuestionText(qText);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    const checkFavorite = async (qId) => {
      try {
        // 2) Check if this question is currently favorited
        // For example, a GET route that returns { isFavorited: true/false }
        const favRes = await fetch(`/api/questions/${qId}/favorite`);
        if (!favRes.ok) throw new Error("Failed to check favorite status");
        const favData = await favRes.json();
        setIsFavorited(favData.isFavorited || false);
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    if (question_id) {
      getQuestion(question_id);
      checkFavorite(question_id);
    }
  }, [question_id]);

  /* ---------- Timer logic ---------- */
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

  /* ---------- Speech Synthesis ---------- */
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

  /* ---------- "Ready to Answer" ---------- */
  const handleReadyToAnswer = () => {
    setShowTimer(false);
    setTimeRemaining(null);
    setShowRecorder(true);
  };

  /* ---------- Save STAR Text ---------- */
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
      if (!res.ok) {
        alert("Error saving STAR text. Check server logs.");
      } else {
        alert("STAR text saved successfully!");
      }
    } catch (err) {
      console.error("Error saving STAR text:", err);
      alert("Unable to save. Ensure the server is running.");
    }
  };

  /* ---------- Toggle Favorite ---------- */
  const handleToggleFavorite = async () => {
    if (!question_id) return;

    const newFavoriteState = !isFavorited;
    // Update local UI state immediately
    setIsFavorited(newFavoriteState);

    try {
      // POST to /api/questions/:id/favorite
      // We'll pass { favorite: true/false } to let the backend decide to add or remove from user-favorites.json
      const res = await fetch(`/api/questions/${question_id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: newFavoriteState }),
      });
      if (!res.ok) {
        throw new Error("Failed to update favorite status on server");
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      // Revert local state if the server call fails
      setIsFavorited(!newFavoriteState);
      alert("Unable to update favorite status. Please try again.");
    }
  };

  return (
    <div className="container my-4">
      {/* Star icon row */}
      <div className="d-flex justify-content-start mb-2">
        {/* If not favorited => hollow star, if favored => filled star */}
        <button
          className={`btn btn-info`}
          onClick={handleToggleFavorite}
          title={
            isFavorited ? "Click to remove from favorites" : "Click to favorite"
          }
        >
          {isFavorited ? "Click to remove this question from favorites " : "Click to favorite this question"}
          <i
            className={`bi ${isFavorited ? "bi-star-fill" : "bi-star"} fs-4`}
            style={{ cursor: "pointer" }}
            onClick={handleToggleFavorite}
          ></i>
        </button>
      </div>

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
          Save STAR Notes
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSpeak}
          disabled={isSpeaking}
        >
          {isSpeaking ? "Speaking..." : "Read Question and Prepare to Answer"}
        </button>
      </div>

      {showTimer && timeRemaining !== null && timeRemaining >= 0 && (
        <div className="d-flex align-items-center mb-3">
          <h5 className="me-3 mb-0">
            Preparation Time Remaining: {formatTime(timeRemaining)}
          </h5>
          <button className="btn btn-success" onClick={handleReadyToAnswer}>
            Ready to Record Question Response
          </button>
        </div>
      )}

      {showRecorder && <AudioVideoRecorder questionId={question_id} />}
    </div>
  );
}

export default InterviewQuestion;

/* ------------------------------------------ */
/*   AudioVideoRecorder w/ MP4 mimeType       */
/* ------------------------------------------ */

function AudioVideoRecorder({ questionId }) {
  const [recordButtonText, setRecordButtonText] = useState("Record Audio/Video Response");
  const [isRecordDisabled, setIsRecordDisabled] = useState(false);

  const [showPause, setShowPause] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showStop, setShowStop] = useState(false);

  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [showDownload, setShowDownload] = useState(false);

  // isBlinking = apply .blink class if "Recording..."
  const isBlinking = recordButtonText === "Recording...";

  // Download Handler
  const handleDownloadVideo = () => {
    if (!mediaBlobUrl) return;
    fetch(mediaBlobUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);

        // Format current date/time as requested
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        const dateTime = `${mm}-${dd}-${yyyy}_${hh}:${min}:${ss}`;

        // e.g. LaunchCode-Question-123-response-07-12-2023_14:35:10.mp4
        const filename = `LaunchCode-Question-${questionId}-response-${dateTime}.mp4`;

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">Video Recording (Audio + Video)</h5>

        <ReactMediaRecorder
          audio
          video
          mimeType="video/mp4"
          render={({
            status,
            startRecording,
            stopRecording,
            pauseRecording,
            resumeRecording,
            mediaBlobUrl: newBlobUrl,
          }) => {
            useEffect(() => {
              if (newBlobUrl) {
                setMediaBlobUrl(newBlobUrl);
              }
            }, [newBlobUrl]);

            /* Button Actions */
            const onRecordClick = () => {
              startRecording();
              setRecordButtonText("Recording...");
              setIsRecordDisabled(true);
              setShowPause(true);
              setShowStop(true);
              setShowResume(false);
              setShowDownload(false);
            };

            const onPauseClick = () => {
              pauseRecording();
              setShowPause(false);
              setShowResume(true);
              setRecordButtonText("Paused");
            };

            const onResumeClick = () => {
              resumeRecording();
              setShowResume(false);
              setShowPause(true);
              setRecordButtonText("Recording...");
            };

            const onStopClick = () => {
              stopRecording();
              setShowPause(false);
              setShowResume(false);
              setShowStop(false);
              setRecordButtonText("Record");
              setIsRecordDisabled(false);
              setShowDownload(true);
            };

            return (
              <>
                <p>
                  <strong>Recorder Status:</strong> {status}
                </p>

                {/* RECORD BUTTON */}
                <button
                  className={`btn btn-danger me-2 ${isBlinking ? "blink" : ""}`}
                  onClick={onRecordClick}
                  disabled={isRecordDisabled}
                >
                  {recordButtonText}
                </button>

                {/* PAUSE BUTTON */}
                {showPause && (
                  <button
                    className="btn btn-warning me-2"
                    onClick={onPauseClick}
                  >
                    Pause
                  </button>
                )}

                {/* RESUME BUTTON */}
                {showResume && (
                  <button
                    className="btn btn-secondary me-2"
                    onClick={onResumeClick}
                  >
                    Resume
                  </button>
                )}

                {/* STOP BUTTON */}
                {showStop && (
                  <button className="btn btn-dark me-2" onClick={onStopClick}>
                    Stop
                  </button>
                )}

                {/* VIDEO Playback */}
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

                {/* DOWNLOAD BUTTON */}
                {showDownload && (
                  <button
                    className="btn btn-success mt-3"
                    onClick={handleDownloadVideo}
                  >
                    Download Video
                  </button>
                )}
              </>
            );
          }}
        />
      </div>
    </div>
  );
}

export { AudioVideoRecorder };
