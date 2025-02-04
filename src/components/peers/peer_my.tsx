import React, { useEffect, useRef, useState } from 'react';

interface PeerMyProps {
  onStreamChange: (stream: MediaStream | null) => void; // Коллбэк для передачи потока
}

const PeerMy: React.FC<PeerMyProps> = ({ onStreamChange }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Функция для включения камеры и микрофона
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setIsCameraOn(true);
      setIsMicrophoneOn(true);
      setStream(mediaStream);
      onStreamChange(mediaStream);
    } catch (error) {
      console.error('Ошибка при включении камеры и микрофона:', error);
    }
  };

  // Функция для переключения микрофона
  const toggleMicrophone = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneOn(audioTrack.enabled);
      }
    }
  };

  // Функция для приостановки/возобновления видео
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Очистка ресурсов при размонтировании компонента
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div>
      {/* Элемент video или черный квадрат, если камера выключена */}
      <div
        style={{
          width: '100%',
          height: '400px',
          maxHeight: '400px',
          maxWidth: '520px',
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isCameraOn ? 'transparent' : 'black',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            display: isCameraOn ? 'block' : 'none',
          }}
        />
      </div>

      <div className="mt-2 flex gap-2">
        {!isCameraOn && (
          <button onClick={startCamera} className="bg-green-500 text-white px-4 py-2 rounded">
            Включить камеру
          </button>
        )}
        {isCameraOn && (
          <button
            onClick={toggleCamera}
            className={`${isCameraOn ? 'bg-yellow-500' : 'bg-gray-500'} text-white px-4 py-2 rounded`}
          >
            {isCameraOn ? 'Приостановить видео' : 'Возобновить видео'}
          </button>
        )}
        <button
          onClick={toggleMicrophone}
          className={`${isMicrophoneOn ? 'bg-blue-500' : 'bg-gray-500'} text-white px-4 py-2 rounded`}
        >
          {isMicrophoneOn ? 'Выключить микрофон' : 'Включить микрофон'}
        </button>
      </div>
    </div>
  );
};

export default PeerMy;
