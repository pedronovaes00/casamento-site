import React from 'react';
import { motion } from 'framer-motion';

export const FloralDecoration = () => {
  return (
    <>
      {/* Top Left - White Flowers with Green Leaves */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: -50 }}
        animate={{ opacity: 0.7, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed top-0 left-0 w-72 h-72 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL || ''}/floral-top-left.png), url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/jf6ddfip_image.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'top left',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Top Right - White Flowers */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -50 }}
        animate={{ opacity: 0.7, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="fixed top-0 right-0 w-80 h-80 pointer-events-none z-0"
        style={{
          backgroundImage: `url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/jf6ddfip_image.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Bottom Left - Green Leaves */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 0.6, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none z-0"
        style={{
          backgroundImage: `url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/jf6ddfip_image.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(180deg)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Bottom Right - White Flowers */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 0.7, x: 0, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        className="fixed bottom-0 right-0 w-72 h-72 pointer-events-none z-0"
        style={{
          backgroundImage: `url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/jf6ddfip_image.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1) rotate(180deg)',
          mixBlendMode: 'multiply'
        }}
      />
    </>
  );
};

export default FloralDecoration;
