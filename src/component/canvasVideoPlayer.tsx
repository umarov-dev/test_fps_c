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

    // Фильтруем видимые видео
    const visibleVideos = currentVideos.filter(video => video.visible);

    // Инициализируем видеоэлементы
    const videos = visibleVideos.map(video => {
      const videoElement = document.querySelector(`video[data-src="${video.link}"]`) as HTMLVideoElement;
      return videoElement;
    });

    const totalWidth = visibleCanvas.width;
    const totalHeight = visibleCanvas.height;

    let frameCount = 0; // Счетчик кадров
    let lastTime = performance.now(); // Время последнего обновления

    const draw = () => {
      const now = performance.now();

      // Очистка всего видимого канваса перед отрисовкой
      visibleCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);

      // Очистка только скрытого канваса
      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      // Минимальная ширина видео (например, 200px)
      const minVideoWidth = 200;
      const spacing = 10; // Отступ между видео

      // Расчет максимального количества видео в одной строке
      const maxVideosPerRow = Math.floor((totalWidth + spacing) / (minVideoWidth + spacing));

      // Общий отступ для строки
      const rowSpacing = (maxVideosPerRow > 1) ? spacing : 0;

      // Рисование видео на скрытом Canvas
      let currentX = 0;
      let currentY = 0;
      let maxHeightInRow = 0;

      videos.forEach((video) => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          // Реальное соотношение сторон видео
          const videoAspectRatio = video.videoWidth / video.videoHeight;

          // Максимальная ширина видео в строке
          const maxWidth = (totalWidth - rowSpacing * (maxVideosPerRow - 1)) / maxVideosPerRow;

          // Вычисляем ширину и высоту видео с учетом соотношения сторон
          let videoWidth = maxWidth;
          let videoHeight = videoWidth / videoAspectRatio;

          // Если видео не помещается в текущую строку, переносим его на новую строку
          if (currentX + videoWidth > totalWidth) {
            currentX = 0;
            currentY += maxHeightInRow + spacing;
            maxHeightInRow = 0;
          }

          // Если видео не помещается по высоте канваса, пропускаем его
          if (currentY + videoHeight > totalHeight) return;

          // Рисуем фон
          hiddenCtx.fillStyle = '#000'; // Черный фон
          hiddenCtx.fillRect(currentX, currentY, videoWidth, videoHeight);

          // Рисуем видео
          hiddenCtx.drawImage(video, currentX, currentY, videoWidth, videoHeight);

          // Обновляем максимальную высоту строки
          maxHeightInRow = Math.max(maxHeightInRow, videoHeight);

          // Обновляем текущую позицию X для следующего видео
          currentX += videoWidth + rowSpacing;
        }
      });

      // Отрисовываем со скрытого канваса на видимый
      visibleCtx?.drawImage(hiddenCanvas, 0, 0);

      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);

    // Очистка ресурсов при размонтировании компонента
    return () => {
      // Останавливаем только те видео, которые больше не видимы
      currentVideos.forEach(video => {
        if (!video.visible) {
          const videoElement = document.querySelector(`video[data-src="${video.link}"]`) as HTMLVideoElement;
          if (videoElement) {
            videoElement.pause();
          }
        }
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