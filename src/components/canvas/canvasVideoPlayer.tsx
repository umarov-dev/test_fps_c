import React, { useRef, useEffect } from 'react';
import { IVideoList } from '../../types';
import FPSCounter from './FpsCounter'; // Импортируем новый компонент

interface CanvasVideoPlayerProps {
  currentVideos: IVideoList[];
  selectedBackground: string | null;
}

const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = React.memo(({ currentVideos, selectedBackground }) => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Состояние для текущего фонового изображения
  const [backgroundImage, setBackgroundImage] = React.useState<HTMLImageElement | null>(null);

  // Ref для AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref для предыдущего значения selectedBackground
  const prevSelectedBackground = useRef<string | null>(null);

  // Функция для загрузки фонового изображения
  const loadBackgroundImage = (src: string) => {
    // Отменяем предыдущую загрузку, если она была запущена
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      // Проверяем, не была ли загрузка отменена
      if (!controller.signal.aborted) {
        setBackgroundImage(img);
      }
    };

    img.onerror = () => {
      console.error(`Не удалось загрузить фоновое изображение: ${src}`);
    };
  };

  // Эффект для загрузки фона
  useEffect(() => {
    if (selectedBackground !== prevSelectedBackground.current) {
      prevSelectedBackground.current = selectedBackground;

      if (selectedBackground) {
        loadBackgroundImage(selectedBackground);
      } else {
        setBackgroundImage(null); // Очищаем фоновое изображение
      }
    }

    // При размонтировании компонента отменяем загрузку
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedBackground]);

  // Основной эффект для отрисовки
  useEffect(() => {
    if (
      !backgroundCanvasRef.current ||
      !hiddenCanvasRef.current ||
      !visibleCanvasRef.current
    )
      return;

    const backgroundCanvas = backgroundCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const visibleCanvas = visibleCanvasRef.current;

    const backgroundCtx = backgroundCanvas.getContext('2d');
    const hiddenCtx = hiddenCanvas.getContext('2d');
    const visibleCtx = visibleCanvas.getContext('2d');

    if (!backgroundCtx || !hiddenCtx || !visibleCtx) return;

    // Отключаем сглаживание для улучшения качества
    visibleCtx.imageSmoothingEnabled = false;
    hiddenCtx.imageSmoothingEnabled = false;

    const totalWidth = visibleCanvas.width;
    const totalHeight = visibleCanvas.height;

    // Отрисовка фона
    const drawBackground = () => {
      if (backgroundImage && backgroundCtx) {
        backgroundCtx.clearRect(0, 0, totalWidth, totalHeight); // Очищаем фоновый канвас
        backgroundCtx.drawImage(backgroundImage, 0, 0, totalWidth, totalHeight); // Рисуем фон
      } else {
        backgroundCtx?.clearRect(0, 0, totalWidth, totalHeight); // Полностью очищаем фоновый канвас
      }
    };

    // Отрисовываем фон при первой загрузке или изменении
    drawBackground();

    let animationFrameId: number;

    const draw = () => {
      // Очистка скрытого канваса
      hiddenCtx.clearRect(0, 0, totalWidth, totalHeight);

      // Фильтруем видимые видео
      const visibleVideos = currentVideos.filter(video => video.visible);

      // Поиск всех видеоэлементов один раз
      const videos = visibleVideos.map(video => {
        const videoElement = document.querySelector(`video[data-src="${video.link}"]`) as HTMLVideoElement;
        return videoElement;
      }).filter(video => video !== null); // Убираем null, если видео не найдено

      // Минимальная ширина видео (например, 200px)
      const minVideoWidth = 200;
      const spacing = 10; // Отступ между видео

      // Расчет максимального количества видео в одной строке
      const maxVideosPerRow = Math.floor((totalWidth + spacing) / (minVideoWidth + spacing));
      const rowSpacing = (maxVideosPerRow > 1) ? spacing : 0;

      // Рисование видео на скрытом Canvas
      let currentX = 0;
      let currentY = 0;
      let maxHeightInRow = 0;

      videos.forEach((video) => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          const videoAspectRatio = video.videoWidth / video.videoHeight;
          const maxWidth = (totalWidth - rowSpacing * (maxVideosPerRow - 1)) / maxVideosPerRow;
          const videoWidth = maxWidth;
          const videoHeight = videoWidth / videoAspectRatio;

          // Перенос на новую строку
          if (currentX + videoWidth > totalWidth) {
            currentX = 0;
            currentY += maxHeightInRow + spacing;
            maxHeightInRow = 0;
          }

          // Пропуск видео, если оно не помещается по высоте
          if (currentY + videoHeight > totalHeight) return;

          // Рисуем фон
          hiddenCtx.fillRect(currentX, currentY, videoWidth, videoHeight);

          // Рисуем видео
          hiddenCtx.drawImage(video, currentX, currentY, videoWidth, videoHeight);

          // Обновляем максимальную высоту строки
          maxHeightInRow = Math.max(maxHeightInRow, videoHeight);

          // Обновляем позицию X для следующего видео
          currentX += videoWidth + rowSpacing;
        }
      });

      // Отрисовываем со скрытого канваса на видимый
      visibleCtx.clearRect(0, 0, totalWidth, totalHeight); // Очищаем видимый канвас
      visibleCtx.drawImage(hiddenCanvas, 0, 0); // Рисуем видео поверх фона

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Очистка ресурсов при размонтировании компонента
    return () => {
      cancelAnimationFrame(animationFrameId);

      currentVideos.forEach(video => {
        if (!video.visible) {
          const videoElement = document.querySelector(`video[data-src="${video.link}"]`) as HTMLVideoElement;
          if (videoElement) {
            videoElement.pause();
          }
        }
      });
    };
  }, [currentVideos, backgroundImage]);

  return (
    <div className="convas" style={{ position: 'relative', width: '800px', height: '450px' }}>
      <canvas
        ref={backgroundCanvasRef}
        width={800}
        height={450}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      ></canvas>

      <canvas
        ref={hiddenCanvasRef}
        width={800}
        height={450}
        style={{ display: 'none' }}
      ></canvas>

      <canvas
        ref={visibleCanvasRef}
        width={800}
        height={450}
        className="border-2 border-gray-300"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
        }}
      ></canvas>

      <FPSCounter />
    </div>
  );
});

export default CanvasVideoPlayer;