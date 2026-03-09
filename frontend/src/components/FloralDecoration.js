import React from 'react';
import { motion } from 'framer-motion';

const FLORAL_IMAGE = 'https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/3aakyqkb_image.png';

export const FloralDecoration = () => {
  return (
    <>
      {/* Top Right - White Flowers */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -50 }}
        animate={{ opacity: 0.85, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed top-0 right-0 pointer-events-none z-0"
        style={{
          width: 'clamp(140px, 30vw, 380px)',
          height: 'clamp(120px, 25vw, 320px)',
          backgroundImage: `url(${FLORAL_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Bottom Left - Leaves */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 0.85, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="fixed bottom-0 left-0 pointer-events-none z-0"
        style={{
          width: 'clamp(120px, 28vw, 320px)',
          height: 'clamp(100px, 22vw, 288px)',
          backgroundImage: `url(${FLORAL_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(180deg)'
        }}
      />
    </>
  );
};

export default FloralDecoration;
