import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ReactMediaRecorder } from "react-media-recorder";
import WaveSurfer from "wavesurfer.js";

function InterviewQuestion() {
  // ------------- State ----------------
  const [questionText, setQuestionText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // Local state for text fields
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");

  // Get the "id" parameter from the URL
  const { id: question_id } = useParams();

  // ------------- On Component Mount (Fetch Question) -------------
  useEffect(() => {
    const getQuestion = async (qId) => {
      try {
        // Example: /api/questions/:id
        const res = await fetch(`/api/questions/${qId}`);
        if (!res.ok) {
          throw new Error("Failed to load question data");
        }
        const data = await res.json();
        console.log(data)
        if (data.length > 0){
            setQuestionText(data[0].question_text || "");
        } else {
            setQuestionText("No Question exists for that id")
        }
        // data might be { question_id: '123', question_text: '...' }

      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    // Call the function to fetch question data
    if (question_id) {
      getQuestion(question_id);
    }
  }, [question_id]);

  // ------------- Timer Logic -------------
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

  // ------------- Speech Synthesis -------------
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

  // ------------- "Ready to Answer" -------------
  const handleReadyToAnswer = () => {
    setShowTimer(false);
    setTimeRemaining(null);
    setShowAudioRecorder(true);
  };

  // ------------- Save STAR Text -------------
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
      // Example POST to your backend route:
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

      {/* Text areas */}
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

      {/* Countdown + Ready to Answer */}
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

      {showAudioRecorder && <AudioRecorder />}
    </div>
  );
}

export default InterviewQuestion;

/* ----------------------------------- */
/*        Audio Recorder Component     */
/* ----------------------------------- */

function AudioRecorder() {
  const waveSurferRef = useRef(null);
  const [waveSurfer, setWaveSurfer] = useState(null);

  useEffect(() => {
    if (!waveSurferRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#ccc",
        progressColor: "#0d6efd", // a bootstrap-like color
        cursorColor: "#999",
        barWidth: 2,
        barRadius: 2,
        responsive: true,
        height: 80,
      });
      setWaveSurfer(waveSurferRef.current);
    }
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <ReactMediaRecorder
          audio
          render={({
            status,
            startRecording,
            stopRecording,
            pauseRecording,
            resumeRecording,
            mediaBlobUrl,
          }) => {
            // Load audio into WaveSurfer once we have a URL
            useEffect(() => {
              if (waveSurfer && mediaBlobUrl) {
                waveSurfer.load(mediaBlobUrl);
              }
            }, [mediaBlobUrl, waveSurfer]);

            // Playback via WaveSurfer
            const handlePlayback = () => {
              if (waveSurfer) {
                waveSurfer.playPause();
              }
            };

            return (
              <div>
                <h5 className="card-title">Recording Status: {status}</h5>
                <div className="mb-3">
                  <button
                    className="btn btn-danger me-2"
                    onClick={startRecording}
                  >
                    Record
                  </button>
                  <button
                    className="btn btn-warning me-2"
                    onClick={pauseRecording}
                  >
                    Pause
                  </button>
                  <button
                    className="btn btn-secondary me-2"
                    onClick={resumeRecording}
                  >
                    Resume
                  </button>
                  <button className="btn btn-dark me-2" onClick={stopRecording}>
                    Stop
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handlePlayback}
                  >
                    Playback
                  </button>
                </div>

                <div id="waveform" className="mb-3" />

                {mediaBlobUrl && (
                  <audio src={mediaBlobUrl} controls className="w-100 mt-2" />
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
