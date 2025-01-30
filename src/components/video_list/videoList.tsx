import "./videoList.scss";
import { IVideoList } from "../../types";
import { memo } from "react";

interface VideoListPlayerProps {
  currentVideos: IVideoList[];
  deleteVideo: (videoName: string) => void;
  addVideoBack: (videoName: string) => void;
}

const VideoList: React.FC<VideoListPlayerProps> = memo(({
  currentVideos,
  deleteVideo,
  addVideoBack,
}) => {
  return (
    <div className="videoplayer">
      <div className="list">
        {currentVideos.map(({ link, visible }) => (
          <div key={link} className="video_item">
            <div style={{ display: visible ? "flex" : "none" }}>
              <video
                width="200"
                height="100"
                controls
                autoPlay
                muted
                data-src={link}
                className="rounded-lg shadow-md"
              >
                <source src={link} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button onClick={() => deleteVideo(link)} className="remove-btn">
                Удалить
              </button>
            </div>

            <div style={{ display: visible ? "none" : "block" }}>
              <button onClick={() => addVideoBack(link)} className="add-btn">
                Добавить видео поток
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default VideoList;
