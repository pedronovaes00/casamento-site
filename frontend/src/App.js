import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// Components
import PaperOverlay from './components/PaperOverlay';
import InvitationLanding from './components/InvitationLanding';
import RSVPForm from './components/RSVPForm';
import GiftsAndVaquinhas from './components/GiftsAndVaquinhas';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

// Public Flow Component
const PublicFlow = () => {
  const [currentStep, setCurrentStep] = useState('rsvp');
  const [confirmedGuest, setConfirmedGuest] = useState(null);

  const handleRSVPComplete = (guest) => {
    setConfirmedGuest(guest);
    setCurrentStep('confirmation');
  };

  const handleContinueToGifts = () => {
    setCurrentStep('gifts');
  };

  return (
    <>
      <PaperOverlay />
      <div className="relative z-10">
        {currentStep === 'rsvp' && (
          <RSVPForm onComplete={handleRSVPComplete} />
        )}
        {currentStep === 'confirmation' && confirmedGuest && (
          <InvitationLanding guest={confirmedGuest} onContinue={handleContinueToGifts} />
        )}
        {currentStep === 'gifts' && confirmedGuest && (
          <GiftsAndVaquinhas guest={confirmedGuest} />
        )}
      </div>
    </>
  );
};

// Admin Flow Component
const AdminFlow = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated && !localStorage.getItem('adminToken')) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicFlow />} />
          <Route path="/admin" element={<AdminFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
