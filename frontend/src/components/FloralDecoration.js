import React from 'react';

const FLORAL_DESKTOP = 'https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/3aakyqkb_image.png';
const FLORAL_MOBILE = '/bg-mobile.png';

export const FloralDecoration = () => {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 md:hidden"
        style={{
          backgroundImage: `url(${FLORAL_MOBILE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="fixed top-0 right-0 pointer-events-none z-0 hidden md:block"
        style={{
          width: 'clamp(140px, 30vw, 380px)',
          height: 'clamp(120px, 25vw, 320px)',
          backgroundImage: `url(${FLORAL_DESKTOP})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="fixed bottom-0 left-0 pointer-events-none z-0 hidden md:block"
        style={{
          width: 'clamp(120px, 28vw, 320px)',
          height: 'clamp(100px, 22vw, 288px)',
          backgroundImage: `url(${FLORAL_DESKTOP})`,
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
