import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactMediaRecorder } from "react-media-recorder";

/**
 * Main InterviewQuestion component
 */
function InterviewQuestion() {
  /* ---------- State Variables ---------- */
  const [questionText, setQuestionText] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [questionRecommendedLimit, setQuestionRecommendedLimit] =
    useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  // STAR fields
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");
  const [notesHidden, setNotesHidden] = useState(false);

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPrepped, setIsPrepped] = useState(false);

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
        const qText = questionData ? questionData.question_text : "";
        const qRecommendedLimit = questionData
          ? questionData["recommended_time_limit"]
          : 300;
        setQuestionText(qText);
        setQuestionRecommendedLimit(qRecommendedLimit);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    const getNotes = async (qId) => {
      try {
        // 1) Fetch question data from /api/questions/:id
        const res = await fetch(`/api/questions/${qId}/notes`);
        if (!res.ok) throw new Error("Failed to load notes data");
        const data = await res.json();
        const { action_text, response_text, situation_text, task_text } = data;
        setSituation(situation_text);
        setAction(action_text);
        setTask(task_text);
        setResponse(response_text);
      } catch (error) {
        console.error("Error fetching notes:", error);
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

    const checkPrepped = async (qId) => {
      try {
        const prepRes = await fetch(`/api/questions/${qId}/prepped`);
        if (!prepRes.ok) throw new Error("Failed to check prepped status");
        const prepData = await prepRes.json();
        setIsPrepped(prepData.isPrepped || false);
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    if (question_id) {
      getQuestion(question_id);
      checkFavorite(question_id);
      checkPrepped(question_id);
      getNotes(question_id);
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
      setShowTimer(true);
      setTimeRemaining(questionRecommendedLimit); // 5 minutes
      return;
    }
    const utterance = new SpeechSynthesisUtterance(questionText);

    utterance.onend = () => {
      setShowTimer(true);
      setTimeRemaining(questionRecommendedLimit); // 5 minutes
    };

    window.speechSynthesis.speak(utterance);
  };

  /* ---------- "Ready to Answer" ---------- */
  const handleReadyToAnswer = () => {
    handleSpeak();
    setShowRecorder(true);
    setNotesHidden(true)
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
      const res = await fetch("/api/save-notes", {
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

  const handleTogglePrepped = async () => {
    if (!question_id) return;

    const newPreppedState = !isPrepped;
    // Update local UI state immediately
    setIsPrepped(newPreppedState);

    try {
      const res = await fetch(`/api/questions/${question_id}/prepped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prepped: newPreppedState }),
      });
      if (!res.ok) {
        throw new Error("Failed to update favorite status on server");
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      // Revert local state if the server call fails
      setIsPrepped(!newPreppedState);
      alert("Unable to update favorite status. Please try again.");
    }
  };

  return (
    <div className="container my-4">
      {/* Star icon row */}

      <h4 className="mb-2 mt-2">Interview Question:</h4>
      <p className="lead mt-2 mb-2">{questionText}</p>

      <div className="d-flex align-items-left">
        <label className="fw-bold">Favorite this Question? </label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="favoritedToggle"
            checked={isFavorited}
            onChange={handleToggleFavorite}
          />
        </div>
        <label className="fw-bold">
          Do I feel prepared for this question?{" "}
        </label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="preparedToggle"
            checked={isPrepped}
            onChange={handleTogglePrepped}
          />
        </div>
      </div>
      {!notesHidden && (
        <>
          <h4 className="mb-2 mt-4">STAR Based Notes:</h4>
          <div className="row g-3">
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
        </>
      )}

      <div className="mt-3">
        {!notesHidden && (
          <button className="btn btn-info me-2" onClick={handleSaveStarText}>
            Save STAR Notes
          </button>
        )}
        <button className="btn btn-success" onClick={handleReadyToAnswer}>
          Ready to Practice Response
        </button>
      </div>

      {showTimer && timeRemaining !== null && timeRemaining >= 0 && (
        <>
          <div className="d-flex align-items-center mt-3 mb-3">
            <h5 className="me-3 mb-0">
              Recommended Response Time Limit: {formatTime(timeRemaining)}
            </h5>
          </div>
          <div className="d-flex align-items-center mt-3 mb-3">
            <p className="lead me-3 mb-0">
              After hitting "Record", please wait a few seconds before speaking
            </p>
          </div>
        </>
      )}

      {showRecorder && <AudioVideoRecorder questionId={question_id} setNotesHidden={setNotesHidden}/>}
    </div>
  );
}

export default InterviewQuestion;

/* ------------------------------------------ */
/*   AudioVideoRecorder w/ MP4 mimeType       */
/* ------------------------------------------ */

function AudioVideoRecorder({ questionId, setNotesHidden }) {
  const [recordButtonText, setRecordButtonText] = useState(
    "Record Audio/Video Response"
  );
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
        const filename = `LaunchCode-Question-${questionId}-response-${dateTime}.webm`;

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
    <div className=" mt-3 card">
      <div className="card-body">
        <h5 className="card-title mb-3">Video Recording (Audio + Video)</h5>

        <ReactMediaRecorder
          audio
          video
          mimeType="video/webm"
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
              setNotesHidden(false)
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
                    Stop Recording and View Video
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
