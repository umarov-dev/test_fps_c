import React, { useState, useEffect } from 'react';

const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }, []);

  return (
    <div className="fps absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded z-50">
      FPS: {fps}
    </div>
  );
};

export default FPSCounter;