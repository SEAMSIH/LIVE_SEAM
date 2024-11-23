import React from 'react';

const LoadingSpinner = () => (
  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;