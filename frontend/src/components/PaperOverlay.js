import React from 'react';

const FLORAL_BACKGROUND = 'https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/bpv1pir5_Convite%20do%20Cas%C3%B3rio%20.png';

export const PaperOverlay = () => {
  return (
    <>
      {/* Beautiful floral background created in Canva */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${FLORAL_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </>
  );
};

export default PaperOverlay;