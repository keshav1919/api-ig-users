import React from 'react';

/**
 * Official Meta vector logo and name from https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg
 */
export const MetaLogo = ({ height = 15, className = '' }) => {
  return (
    <img
      src="/meta-logo.svg"
      alt="Meta"
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      className={`inline-block shrink-0 select-none ${className}`}
      loading="eager"
    />
  );
};

export default MetaLogo;
