import { useRef, useEffect, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import axios from "axios";

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  const [prevFace, setPreFace] = useState([]);

  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // LOAD MODELS FROM FACE API

  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = async () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      });

      if (detections.length > 0) {
        // setPreFace([detections[0].descriptor]);

        const payload = {
          label: "Person 3",
          descriptor: JSON.stringify(detections[0].descriptor),
        };
        // const response = await axios.post("http://localhost:4000/", payload);

        axios.post("http://localhost:4000/", payload).then((response) => {
          console.log(response);
        });
      }

      const response = await axios.get("http://localhost:4000/");

      const data = response.status === 200 ? response.data.data : [];

      if (prevFace.length > 0 && detections.length > 0) {
        // Assuming you have the face descriptor of the detected face
        const detectedFaceDescriptor = detections[0].descriptor;

        // Perform face verification by comparing the detected face descriptor with the face descriptors from the database
        const faceMatcher = new faceapi.FaceMatcher(prevFace);
        const bestMatch = faceMatcher.findBestMatch(detectedFaceDescriptor);

        if (bestMatch.label === "unknown" || bestMatch.distance > 0.5) {
          console.log("Face not found in the database.");
          // alert("Face Not Found!");
        } else {
          console.log(
            `Face found in the database with label: ${bestMatch.label}`
          );
          // alert("Face Found with Label", bestMatch.label);
        }
      }

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 3000);
  };

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvide">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} width="940" height="650" className="appcanvas" />
    </div>
  );
}

export default App;
