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
        className="fixed top-0 right-0 w-96 h-80 pointer-events-none z-0"
        style={{
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
        className="fixed bottom-0 left-0 w-80 h-72 pointer-events-none z-0"
        style={{
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
