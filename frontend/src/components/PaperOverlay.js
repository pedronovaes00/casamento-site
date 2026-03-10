import React from 'react';

const FLORAL_DESKTOP = 'https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/bpv1pir5_Convite%20do%20Cas%C3%B3rio%20.png';
const FLORAL_MOBILE = '/bg-mobile.png';

export const PaperOverlay = () => {
  return (
    <>
      {/* Mobile */}
      <div
        className="fixed inset-0 pointer-events-none z-0 md:hidden"
        style={{
          backgroundImage: `url(${FLORAL_MOBILE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Desktop */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden md:block"
        style={{
          backgroundImage: `url(${FLORAL_DESKTOP})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </>
  );
};

export default PaperOverlay;