import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Box } from "@mui/material"; // Import Box from Material-UI

const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [emotion, setEmotion] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // Use the relative path
        console.log("Loading models...");

        // Load models from the specified URL
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        console.log("Models loaded successfully!");
        startVideo();
      } catch (error: any) {
        // Detailed error handling
        console.error("Error loading models:", error.message);
        if (error.stack) {
          console.error("Error stack:", error.stack);
        }
        if (error.response) {
          console.error("Error response:", error.response);
        }
        // If the model URL is incorrect or files are missing, it should show more information
        alert("There was an issue loading the models. Please check the model files.");
      }
    };

    const startVideo = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          })
          .catch((error) => console.error("Error accessing webcam:", error));
      }
    };

    loadModels();
  }, []);

  const handleVideoPlay = async () => {
    setLoading(false);
    const video = videoRef.current!;
    const canvas = canvasRef.current!;

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceExpressions(canvas, detections);

      if (detections.length > 0) {
        const primaryEmotion = Object.entries(detections[0].expressions).reduce(
          (prev, current) => (current[1] > prev[1] ? current : prev)
        );
        setEmotion(primaryEmotion[0]);
      } else {
        setEmotion(null);
      }
    }, 100);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #120136, #3c096c, #6a1b9a)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <h1>Emotion Detector</h1>
      {loading && <p>Loading models...</p>}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "80%",
          height: "auto",
          marginBottom: "20px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <video
          ref={videoRef}
          width="720"
          height="560"
          onPlay={handleVideoPlay}
          style={{ display: loading ? "none" : "block" }}
        />
        <canvas ref={canvasRef} width="720" height="560" />
      </Box>
      {emotion && <p style={{ color: "white", fontSize: "20px" }}>Detected Emotion: {emotion}</p>}
    </Box>
  );
};

export default EmotionDetector;
