import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

import PaperOverlay from './components/PaperOverlay';
import { FloralDecoration } from './components/FloralDecoration';
import InvitationLanding from './components/InvitationLanding';
import RSVPForm from './components/RSVPForm';
import GiftsAndVaquinhas from './components/GiftsAndVaquinhas';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

const PublicFlow = () => {
  const [currentStep, setCurrentStep] = useState('rsvp');
  const [confirmedGuest, setConfirmedGuest] = useState(null);

  const handleRSVPComplete = (guest) => {
    setConfirmedGuest(guest);
    setCurrentStep('confirmation');
  };

  return (
    <>
      <PaperOverlay />
      <FloralDecoration />
      <div className="relative z-10">
        {currentStep === 'rsvp' && (
          <RSVPForm onComplete={handleRSVPComplete} />
        )}
        {currentStep === 'confirmation' && confirmedGuest && (
          <InvitationLanding guest={confirmedGuest} />
        )}
      </div>
    </>
  );
};

const AdminFlow = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated && !localStorage.getItem('adminToken')) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
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
