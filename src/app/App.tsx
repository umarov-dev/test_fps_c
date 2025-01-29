import { useCallback, useState } from 'react';
import CanvasVideoPlayer from '../component/canvasVideoPlayer.tsx';
import VideoList from '../component/videoList';
import { videoSources } from '../const/index.ts';
import { IVideoList } from '../types/index.ts';


function App() {
  const [currentVideos, setVideos] = useState<IVideoList[]>(videoSources);

  const deleteVideo = useCallback((videoName: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.link === videoName ? { ...video, visible: false } : video
      )
    );
  }, []);

  const addVideoBack = useCallback((videoName: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.link === videoName ? { ...video, visible: true } : video
      )
    );
  }, []);

  return (
    <div className="App">
      <h1>Тест FPS</h1>
      <div className='convas_videoplayer'>
        <CanvasVideoPlayer currentVideos={currentVideos}/>
      </div>
      <VideoList currentVideos={currentVideos} deleteVideo={deleteVideo} addVideoBack={addVideoBack}/>
    </div>
  );
}


export default App;