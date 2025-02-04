import { useCallback, useState } from "react";
import CanvasVideoPlayer from "../components/canvas/canvasVideoPlayer.tsx";
import VideoList from "../components/video_list/videoList.tsx";
import { videoSources } from "../const/index.ts";
import { IVideoList } from "../types/index.ts";
import BackgroundSelector from "../components/background_select/backgroundSelect.tsx";
import './app.css';
import PeerMy from "../components/peers/peer_my.tsx";

function App() {
  const [currentVideos, setVideos] = useState<IVideoList[]>(videoSources);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // const [stream]
  const deleteVideo = useCallback((videoName: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.link === videoName ? { ...video, visible: false } : video
      )
    );
  }, []);

  const addVideoBack = useCallback((videoName: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.link === videoName ? { ...video, visible: true } : video
      )
    );
  }, []);

  const setSelectedBackgroundFunc = useCallback((even: string | null)=> setSelectedBackground(even), []);

  return (
    <div className="App">
      <h1 className="text-center p-3 font-bold text-3xl">Тест FPS</h1>
      <div className="flex justify-center">
        <div className="w-max">
          <CanvasVideoPlayer cameraStream={cameraStream} currentVideos={currentVideos} selectedBackground={selectedBackground}/>
        </div>
        <div className="w-20">
          <BackgroundSelector
            selectedBackground={selectedBackground}
            onBackgroundChange={setSelectedBackgroundFunc}
            />
        </div>
      </div>
      <PeerMy onStreamChange={setCameraStream}/>
      {/* <VideoList
        currentVideos={currentVideos}
        deleteVideo={deleteVideo}
        addVideoBack={addVideoBack}
      /> */}
    </div>
  );
}

export default App;
