import React, { useRef, useEffect, useState } from 'react';
import { IVideoList } from '../types';

interface CanvasVideoPlayerProps {
  currentVideos: IVideoList[];
}

const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = ({ currentVideos }) => {
  const visibleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    if (!visibleCanvasRef.current || !hiddenCanvasRef.current) return;

    const visibleCanvas = visibleCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const visibleCtx = visibleCanvas.getContext('2d');
    const hiddenCtx = hiddenCanvas.getContext('2d');

    if (!visibleCtx || !hiddenCtx) return;

    /** Объект для хранения видео элементов по их ссылкам  */
    const videoElements: { [key: string]: HTMLVideoElement } = {};

    const initializeVideos = (videos: IVideoList[]) => {
      return videos.map((src) => {
        if (videoElements[src.link]) {
          return videoElements[src.link];
        }
        const video = document.createElement('video');
        video.src = src.link;
        video.crossOrigin = 'anonymous'; // Для доступа к внешним источникам
        video.preload = 'auto';
        video.loop = true;
        video.muted = true; // Автовоспроизведение требует mute
        video.play();
        videoElements[src.link] = video;
        return video;
      });
    };

    // Фильтруем видимые видео
    const visibleVideos = currentVideos.filter(video => video.visible);

    // Инициализируем видео элементы для видимых видео
    const videos = initializeVideos(visibleVideos);

    const totalWidth = visibleCanvas.width;
    const videoWidth = totalWidth / (videos.length || 1);
    const videoHeight = visibleCanvas.height;

    let frameCount = 0; // Счетчик кадров
    let lastTime = performance.now(); // Время последнего обновления

    const draw = () => {
      const now = performance.now();

      // Очистка только скрытого канваса
      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      // Рисование видео на скрытом Canvas
      videos.forEach((video, index) => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          const x = index * videoWidth;
          hiddenCtx.drawImage(video, x, 0, videoWidth, videoHeight);
        }
      });

      // Отрисовываем со скрытого конваса на видимый
      visibleCtx?.drawImage(hiddenCanvas, 0, 0);

      frameCount++;

      // Если прошла секунда, обновляем FPS
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(draw);
    };


    requestAnimationFrame(draw);

    return () => {
      // Остановка всех видео и очистка ресурсов
      Object.values(videoElements).forEach((video) => {
        video.pause();
        video.src = ''; // Очищаем src для освобождения ресурсов
        video.load();   // Вызываем load чтобы завершить все процессы воспроизведения
      });
    };
  }, [currentVideos]);

  return (
    <div className="convas">
      <canvas ref={hiddenCanvasRef} width={800} height={450} style={{ display: 'none' }}></canvas>
      <canvas ref={visibleCanvasRef} width={800} height={450} className="border-2 border-gray-300"></canvas>
      <div className="fps">FPS: {fps}</div>
    </div>
  );
};

export default CanvasVideoPlayer;