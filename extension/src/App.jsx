import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthenticationPage from "./pages/AuthenticationPage";
import ProfilePage from "./pages/ProfilePage";
import WebcamWithFaceDetection from "./components/WebcamWithFaceDetection"; // Import the webcam component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Page */}
        <Route path="/" element={<AuthenticationPage />} />

        {/* Profile Page */}
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Webcam with Face Detection */}
        <Route path="/webcam" element={<WebcamWithFaceDetection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
