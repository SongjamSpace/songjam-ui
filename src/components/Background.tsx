import { useEffect, useRef } from 'react';

export default function Background() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="background">
      <video 
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src="/media/songjam.mp4" type="video/mp4" />
      </video>
    </div>
  );
}