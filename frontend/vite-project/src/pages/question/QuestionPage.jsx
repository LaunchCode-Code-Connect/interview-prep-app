import React, { useState, useEffect, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import WaveSurfer from "wavesurfer.js";

function InterviewQuestion({ question_text }) {
  question_text = "Example"
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimer, setShowTimer] = useState(false); // Controls displaying the timer
  const [showAudioRecorder, setShowAudioRecorder] = useState(false); // Controls rendering the audio recorder

  // ---- Countdown effect ----
  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format countdown as MM:SS
  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${ss < 10 ? "0" + ss : ss}`;
  };

  // SpeechSynthesis
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
      setTimeRemaining(300); // 5 minutes = 300 seconds
    };

    window.speechSynthesis.speak(utterance);
  };

  // Called when user clicks "Ready to Answer Question"
  const handleReadyToAnswer = () => {
    // Remove the timer and reveal the audio recorder
    setShowTimer(false);
    setTimeRemaining(null);
    setShowAudioRecorder(true);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>{question_text}</h3>

      {/* Four textareas: Situation, Task, Action, Response */}
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

      {/* Button to speak question */}
      <button onClick={handleSpeak} disabled={isSpeaking}>
        {isSpeaking ? "Speaking..." : "Read Question Aloud"}
      </button>

      {/* Display countdown + 'Ready to Answer' only when showTimer = true */}
      {showTimer && timeRemaining !== null && timeRemaining >= 0 && (
        <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginRight: "20px"
            }}
          >
            Time Remaining: {formatTime(timeRemaining)}
          </div>
          <button onClick={handleReadyToAnswer}>Ready to Answer Question</button>
        </div>
      )}

      {/* Render the Audio Recorder when showAudioRecorder = true */}
      {showAudioRecorder && <AudioRecorder />}
    </div>
  );
}

export default InterviewQuestion;

/* -------------------------------------------- */
/*             Audio Recorder Component         */
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

              {/* Optionally, we can still display the audio directly if needed */}
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
