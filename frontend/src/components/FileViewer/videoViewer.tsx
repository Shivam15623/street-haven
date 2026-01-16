import React, { useRef, useState, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";

interface VideoViewerProps {
  url: string;
  name: string;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatTime = (time: number) =>
    `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(
      2,
      "0"
    )}`;

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      if (videoRef.current) videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    },
    []
  );

  const toggleMute = useCallback(() => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else videoRef.current.requestFullscreen();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
    };
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      className="position-relative w-100 h-100 flex-grow-1 d-flex align-items-center justify-content-center"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {!isLoaded && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "2.5rem", height: "2.5rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={url}
        className="img-fluid rounded"
        onClick={togglePlay}
        style={{
          opacity: isLoaded ? 1 : 0,
          border: "none",
          width: "90vw",
          maxWidth: "1200px",
          maxHeight: "80vh",
          objectFit: "contain", // 🔑 IMPORTANT
        }}
      />

      {/* Play Overlay */}
      {!isPlaying && isLoaded && (
        <button
          onClick={togglePlay}
          className="position-absolute top-50 start-50 translate-middle btn btn-outline-light rounded-circle p-4"
        >
          <Icon icon="mdi:play" width={32} height={32} />
        </button>
      )}

      {/* Controls */}
      <div
        className={`position-absolute bottom-0   bg-light bg-opacity-75 p-2 d-flex flex-column gap-2 rounded transition ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="form-range"
        />
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={togglePlay}
              className="btn btn-outline-secondary btn-sm"
            >
              <Icon
                icon={isPlaying ? "mdi:pause" : "mdi:play"}
                width={16}
                height={16}
              />
            </button>
            <small className="text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggleMute}
              className="btn btn-outline-secondary btn-sm"
            >
              <Icon
                icon={
                  isMuted || volume === 0
                    ? "mdi:volume-off"
                    : volume < 0.5
                    ? "mdi:volume-low"
                    : "mdi:volume-high"
                }
                width={16}
                height={16}
              />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="form-range"
              style={{ width: "80px" }}
            />
            <button
              onClick={toggleFullscreen}
              className="btn btn-outline-secondary btn-sm"
            >
              <Icon icon="mdi:fullscreen" width={16} height={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;
