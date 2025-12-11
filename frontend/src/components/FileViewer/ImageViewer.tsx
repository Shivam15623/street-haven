import React, { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface ImageViewerProps {
  url: string;
  name: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ url, name }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(
    () => setScale((prev) => Math.min(prev + 0.25, 5)),
    []
  );
  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.25, 0.5);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        };
      }
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && scale > 1) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
    },
    [isDragging, scale]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    },
    [handleZoomIn, handleZoomOut]
  );

  return (
    <div className="position-relative flex-grow-1 h-100 d-flex flex-column">
      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-grow-1 overflow-hidden d-flex align-items-center justify-content-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        {!isLoaded && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <motion.img
          src={url}
          alt={name}
          className="img-fluid"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${
              position.y / scale
            }px)`,
            opacity: isLoaded ? 1 : 0,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          onLoad={() => setIsLoaded(true)}
          draggable={false}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex align-items-center bg-light rounded p-2 shadow">
        <button
          onClick={handleZoomOut}
          className="btn btn-outline-secondary btn-sm"
          disabled={scale <= 0.5}
        >
          <Icon icon="mdi:minus" width={16} height={16} />
        </button>
        <span className="mx-2 small text-center" style={{ minWidth: "60px" }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="btn btn-outline-secondary btn-sm"
          disabled={scale >= 5}
        >
          <Icon icon="mdi:plus" width={16} height={16} />
        </button>
        <div className="vr mx-2"></div>
        <button
          onClick={handleReset}
          className="btn btn-outline-secondary btn-sm"
        >
          <Icon icon="mdi:fit-to-screen" width={16} height={16} />
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
