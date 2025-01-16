import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { Box, TextField, Button, Typography, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel, IconButton } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // Attachment icon
import * as THREE from "three";
import { corresponding } from "./corresponding";
import { useAnimations, useGLTF, useFBX } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as faceapi from "face-api.js";

// MouthCue interface for lip sync data
interface MouthCue {
  start: number;
  end: number;
  value: number;
}

interface ChatMessage {
  type: "question" | "answer" | "image";
  content: string;
}

const NikitaChat: React.FC = () => {
  const [docId, setDocId] = useState<string>(""); // Document ID selected by the user
  const [question, setQuestion] = useState<string>(""); // User's question
  const [answer, setAnswer] = useState<string>(""); // Answer from LLM
  const [visemeData, setVisemeData] = useState<MouthCue[] | null>(null); // Viseme data for lip sync
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string>(""); // Error message
  const audioRef = useRef<HTMLAudioElement>(null); // Audio playback reference
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]); // Store the document UUIDs for selection
  const [audioLoaded, setAudioLoaded] = useState<boolean>(false); // State to track if audio is loaded
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false); // State to track if audio is playing
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Selected image for analysis
  const [emotion, setEmotion] = useState<string | null>(null); // Detected emotion from camera
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // Store chat messages

  // Load Uploaded Documents (Fetching from a static list or API)
  useEffect(() => {
    async function fetchDocs() {
      try {
        const response = await axios.get("https://bw-avatar.onrender.com/uploaded_docs");
        setUploadedDocs(response.data.docs || []); // Assuming the backend sends back a list of UUIDs
      } catch (err) {
        console.error("Failed to fetch uploaded documents:", err);
      }
    }
    fetchDocs();
  }, []);

  // Load face-api.js models and start emotion detection
  useEffect(() => {
    const loadModelsAndStartDetection = async () => {
      try {
        const MODEL_URL = "/models"; // Path to your face-api.js models
        console.log("Loading models...");

        // Load the face-api.js models
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        console.log("Models loaded successfully!");

        // Start the video stream
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoElement = document.createElement("video");
          videoElement.srcObject = stream;
          videoElement.play();

          // Detect emotions in real-time
          videoElement.addEventListener("play", () => {
            const interval = setInterval(async () => {
              const detections = await faceapi
                .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

              if (detections.length > 0) {
                // Get the primary emotion
                const primaryEmotion = Object.entries(detections[0].expressions).reduce(
                  (prev, current) => (current[1] > prev[1] ? current : prev)
                );
                setEmotion(primaryEmotion[0]); // Update emotion state
              } else {
                setEmotion(null); // Reset if no face detected
              }
            }, 500); // Run detection every 500ms

            // Clean up on component unmount
            return () => clearInterval(interval);
          });
        }
      } catch (err) {
        console.error("Error setting up emotion detection:", err);
      }
    };

    loadModelsAndStartDetection();
  }, []);

  // Handle asking a question or analyzing an image
  const handleAskQuestion = async () => {
    if (!docId) {
      setError("Please select a document.");
      return;
    }
    if (!question) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setAudioLoaded(false); // Reset audio loaded state
    setVisemeData(null); // Clear previous viseme data
    setIsAudioPlaying(false); // Reset audio playing state

    try {
      let response;
      if (selectedImage) {
        // If an image is selected, send it to the /analyze-image endpoint
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("prompt", question);

        response = await axios.post("https://bw-avatar.onrender.com/analyze-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Add the image and question to the chat
        setChatMessages((prev) => [
          ...prev,
          { type: "image", content: URL.createObjectURL(selectedImage) },
          { type: "question", content: question },
        ]);
      } else {
        // If no image is selected, send the question to the /qna endpoint
        const payload = {
          question,
          emotion, // Include detected emotion in the payload
        };
        response = await axios.post(`https://bw-avatar.onrender.com/qna/${docId}`, payload);

        // Add the question to the chat
        setChatMessages((prev) => [...prev, { type: "question", content: question }]);
      }

      setAnswer(response.data.answer || response.data.data || "No answer found.");
      setVisemeData(response.data.visemeData || null);

      // Add the answer to the chat
      setChatMessages((prev) => [...prev, { type: "answer", content: response.data.answer || response.data.data }]);

      // Play the MP3 after loading completely
      if (audioRef.current) {
        const base64String = response.data.audio; // This is your Base64 string
        const audio = new Audio(`data:audio/mp3;base64,${base64String}`);

        // Set audio element's oncanplaythrough event to trigger animation
        audio.oncanplaythrough = () => {
          setAudioLoaded(true); // Mark audio as loaded
          setIsAudioPlaying(true); // Mark audio as playing
          audio.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        };

        // Detect when the audio ends
        audio.onended = () => {
          setIsAudioPlaying(false); // Mark audio as stopped
          setAudioLoaded(false); // Reset audio loaded state
        };
      }
    } catch (err) {
      setError("Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        background: "radial-gradient(circle at top, #120136, #3c096c, #6a1b9a)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left Side: Nikita's Model */}
      <Box
        sx={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #000428, #004e92)",
          boxShadow: "inset 0 0 50px rgba(0, 0, 0, 0.6)",
          borderRadius: "20px",
        }}
      >
        <Canvas style={{ height: "100%", borderRadius: "20px" }}>
          <Nikita visemeData={audioLoaded ? visemeData : null} audioLoaded={audioLoaded} isAudioPlaying={isAudioPlaying} />
        </Canvas>
      </Box>

      {/* Right Side: Chat Interface */}
      <Box
        sx={{
          width: "50%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          borderRadius: "20px",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "#6a1b9a",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
            background: "linear-gradient(90deg,rgb(55, 29, 157),rgb(76, 33, 157),rgba(95, 30, 170, 0.83))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientMove 5s infinite",
            fontSize: "2.5rem",
            letterSpacing: "1px",
          }}
        >
          Your AI Companion
        </Typography>

        {emotion && (
          <Alert
            severity="info"
            sx={{
              marginBottom: "20px",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              fontSize: "16px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Detected Emotion: {emotion}
          </Alert>
        )}

        <FormControl fullWidth sx={{ marginBottom: "30px" }}>
          <InputLabel id="doc-select-label">Select Document</InputLabel>
          <Select
            labelId="doc-select-label"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            label="Select Document"
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "15px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "16px",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a document
            </MenuItem>
            {uploadedDocs.map((doc) => (
              <MenuItem key={doc} value={doc}>
                {doc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Chat Window */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          {chatMessages.map((message, index) => (
            <Box
              key={index}
              sx={{
                maxWidth: "70%",
                padding: "10px 15px",
                borderRadius: message.type === "question" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                backgroundColor: message.type === "question" ? "#007bff" : "#f1f1f1",
                color: message.type === "question" ? "#fff" : "#000",
                alignSelf: message.type === "question" ? "flex-end" : "flex-start",
                marginBottom: "10px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              {message.type === "image" ? (
                <img
                  src={message.content}
                  alt="Uploaded"
                  style={{ maxWidth: "100%", borderRadius: "10px" }}
                />
              ) : (
                message.content
              )}
            </Box>
          ))}
        </Box>

        {/* Input Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#fff",
            padding: "10px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
              },
            }}
          />
          <IconButton component="label" sx={{ color: "#6a1b9a" }}>
            <AttachFileIcon />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </IconButton>
          <Button
            variant="contained"
            onClick={handleAskQuestion}
            disabled={loading}
            sx={{
              borderRadius: "15px",
              padding: "10px 20px",
              textTransform: "none",
              fontWeight: "bold",
              backgroundColor: "#6a1b9a",
              fontSize: "16px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#8e24aa",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                transform: "scale(1.05)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Ask Question"
            )}
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              marginTop: "20px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#ffebee",
              color: "#d32f2f",
            }}
          >
            {error}
          </Alert>
        )}

        <audio ref={audioRef} />
      </Box>
    </Box>
  );
};

// Nikita's Model Component
function Nikita({ visemeData, audioLoaded, isAudioPlaying }: { visemeData: MouthCue[] | null; audioLoaded: boolean; isAudioPlaying: boolean }) {
  const { nodes, materials } = useGLTF("/models/nikita.glb") as any;
  const headMeshRef = useRef<THREE.SkinnedMesh>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh>(null);
  const tongueMeshRef = useRef<THREE.SkinnedMesh>(null);

  // Load idle and talking animations
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: talkingAnimation } = useFBX("/animations/Talking.fbx");
  idleAnimation[0].name = "Idle"; // Name the idle animation
  talkingAnimation[0].name = "Talking"; // Name the talking animation

  const group = useRef<THREE.Group>(null);
  const { actions } = useAnimations([idleAnimation[0], talkingAnimation[0]], group);

  // Ensure camera position and angle are set correctly
  const { camera } = useThree();
  useEffect(() => {
    if (camera) {
      camera.position.set(0, 1.75, 1.98);
      camera.lookAt(0, 1.5, 0);
    }
  }, [camera]);

  // Play idle animation on mount
  useEffect(() => {
    if (actions["Idle"]) {
      actions["Idle"].reset().fadeIn(0.1).play();
    }

    return () => {
      if (actions["Idle"]) {
        actions["Idle"].fadeOut(0.5);
      }
    };
  }, [actions]);

  // Switch between idle and talking animations based on visemeData and isAudioPlaying
  useEffect(() => {
    if (visemeData && isAudioPlaying) {
      // If visemeData is present and audio is playing, play the talking animation
      if (actions["Talking"]) {
        actions["Talking"].reset().fadeIn(0.5).play();
      }
      if (actions["Idle"]) {
        actions["Idle"].fadeOut(0.5);
      }
    } else {
      // If no visemeData or audio is not playing, play the idle animation
      if (actions["Idle"]) {
        actions["Idle"].reset().fadeIn(0.5).play();
      }
      if (actions["Talking"]) {
        actions["Talking"].fadeOut(0.5);
      }
    }
  }, [visemeData, isAudioPlaying, actions]);

  const updateMorphTargets = (time: number) => {
    if (!visemeData) return;

    const updateMeshMorphTargets = (meshRef: React.RefObject<THREE.SkinnedMesh>) => {
      if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;

      const influences = meshRef.current.morphTargetInfluences;
      const dictionary = meshRef.current.morphTargetDictionary;

      // Reset all morph targets
      influences.fill(0);

      // Apply the current viseme data
      const currentViseme = visemeData.find((cue) => time >= cue.start && time <= cue.end);
      if (currentViseme) {
        const morphTargetName = corresponding[currentViseme.value.toString() as keyof typeof corresponding]; // Convert to string
        const index = dictionary ? dictionary[morphTargetName] : undefined;

        if (index !== undefined) {
          influences[index] = 1;
        }
      }
    };

    updateMeshMorphTargets(headMeshRef);
    updateMeshMorphTargets(teethMeshRef);
    updateMeshMorphTargets(tongueMeshRef);
  };

  useEffect(() => {
    if (!visemeData || visemeData.length === 0) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const animateLipSync = () => {
      const elapsedTime = (performance.now() - startTime) / 1000;
      updateMorphTargets(elapsedTime);

      if (elapsedTime < visemeData[visemeData.length - 1].end) {
        animationFrameId = requestAnimationFrame(animateLipSync);
      }
    };

    animateLipSync();

    return () => cancelAnimationFrame(animationFrameId);
  }, [visemeData]);

  return (
    <>
      <KeyLight />
      <FillLight />
      <BackLight />
      <RimLight />

      <group ref={group}>
        <primitive object={nodes.Hips} scale={[2, 2, 2]} />
        {/* Render Skinned Meshes */}
        <skinnedMesh
          geometry={nodes.avaturn_hair_0.geometry}
          material={materials.avaturn_hair_0_material}
          skeleton={nodes.avaturn_hair_0.skeleton}
        />
        <skinnedMesh
          geometry={nodes.avaturn_hair_1.geometry}
          material={materials.avaturn_hair_1_material}
          skeleton={nodes.avaturn_hair_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.avaturn_look_0.geometry}
          material={materials.avaturn_look_0_material}
          skeleton={nodes.avaturn_look_0.skeleton}
        />
        <skinnedMesh
          geometry={nodes.avaturn_shoes_0.geometry}
          material={materials.avaturn_shoes_0_material}
          skeleton={nodes.avaturn_shoes_0.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Body_Mesh.geometry}
          material={materials.Body}
          skeleton={nodes.Body_Mesh.skeleton}
        />

        {/* Render Morph Target Meshes (Eyes, Teeth, Tongue, Head) */}
        <skinnedMesh
          name="Eye_Mesh"
          geometry={nodes.Eye_Mesh.geometry}
          material={materials.Eyes}
          skeleton={nodes.Eye_Mesh.skeleton}
          morphTargetDictionary={nodes.Eye_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.Eye_Mesh.morphTargetInfluences}
        />
        <skinnedMesh
          name="EyeAO_Mesh"
          geometry={nodes.EyeAO_Mesh.geometry}
          material={materials.EyeAO}
          skeleton={nodes.EyeAO_Mesh.skeleton}
          morphTargetDictionary={nodes.EyeAO_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeAO_Mesh.morphTargetInfluences}
        />
        <skinnedMesh
          name="Eyelash_Mesh"
          geometry={nodes.Eyelash_Mesh.geometry}
          material={materials.Eyelash}
          skeleton={nodes.Eyelash_Mesh.skeleton}
          morphTargetDictionary={nodes.Eyelash_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.Eyelash_Mesh.morphTargetInfluences}
        />

        {/* Head, Teeth, and Tongue */}
        <skinnedMesh
          ref={headMeshRef}
          name="Head_Mesh"
          geometry={nodes.Head_Mesh.geometry}
          material={materials.Head}
          skeleton={nodes.Head_Mesh.skeleton}
          morphTargetDictionary={nodes.Head_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.Head_Mesh.morphTargetInfluences}
        />
        <skinnedMesh
          ref={teethMeshRef}
          name="Teeth_Mesh"
          geometry={nodes.Teeth_Mesh.geometry}
          material={materials.Teeth}
          skeleton={nodes.Teeth_Mesh.skeleton}
          morphTargetDictionary={nodes.Teeth_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.Teeth_Mesh.morphTargetInfluences}
        />
        <skinnedMesh
          ref={tongueMeshRef}
          name="Tongue_Mesh"
          geometry={nodes.Tongue_Mesh.geometry}
          material={materials["Teeth.001"]}
          skeleton={nodes.Tongue_Mesh.skeleton}
          morphTargetDictionary={nodes.Tongue_Mesh.morphTargetDictionary}
          morphTargetInfluences={nodes.Tongue_Mesh.morphTargetInfluences}
        />
      </group>
    </>
  );
}

// Lighting Components
function KeyLight() {
  return (
    <directionalLight
      castShadow
      position={[0, 5, 10]}
      intensity={1}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
  );
}

function FillLight() {
  return <directionalLight position={[-10, 5, 5]} intensity={0.3} color="#ffffff" />;
}

function RimLight() {
  return <hemisphereLight groundColor={"#444444"} intensity={0.8} />;
}

function BackLight() {
  return <directionalLight position={[10, 5, -10]} intensity={0.6} color="#ffffff" />;
}

export default NikitaChat;