import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthenticationPage from './pages/AuthenticationPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthenticationPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;