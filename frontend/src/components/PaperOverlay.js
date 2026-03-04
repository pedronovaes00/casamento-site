import React from 'react';
import { motion } from 'framer-motion';

export const PaperOverlay = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1708379584923-f44da1553304?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxjcmVhbSUyMHBhcGVyJTIwdGV4dHVyZSUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzcyNjA3OTM0fDA&ixlib=rb-4.1.0&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        mixBlendMode: 'multiply'
      }}
    />
  );
};

export default PaperOverlay;