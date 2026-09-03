import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.25, 0.5);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
        lastPosition.current = { x: 0, y: 0 };
      }
      return newScale;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    lastPosition.current = { x: 0, y: 0 };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        e.preventDefault();
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
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        setPosition({ x: newX, y: newY });
        lastPosition.current = { x: newX, y: newY };
      }
    },
    [isDragging, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY < 0 ? 0.2 : -0.2;

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale + delta, 0.5), 5);

        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
          lastPosition.current = { x: 0, y: 0 };
        }

        return newScale;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className="position-relative d-flex flex-column flex-grow-1 h-100"
      style={{ minHeight: "0px" }}
    >
      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-grow-1 overflow-hidden d-flex align-items-center justify-content-center bg-black rounded mx-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: "none",
          minHeight: "0px",
          maxWidth: "90vw",
          minWidth: "90vw",
        }}
      >
        {!isLoaded && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <div
              className="spinner-border"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        )}

        <motion.img
          ref={imageRef}
          src={url}
          alt={name}
          className="img-fluid"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          onLoad={() => setIsLoaded(true)}
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Zoom Controls */}
      <div
        className="position-absolute d-flex align-items-center gap-2 p-10 shadow rounded-pill bg-light border"
        style={{
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          className="btn btn-light p-2 d-flex align-items-center justify-content-center rounded-circle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomOut();
          }}
          disabled={scale <= 0.5}
        >
          <Icon icon="mdi:minus" width={16} height={16} />
        </button>

        <span className="text-center" style={{ minWidth: "60px" }}>
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          className="btn btn-light p-2 d-flex align-items-center justify-content-center rounded-circle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomIn();
          }}
          disabled={scale >= 5}
        >
          <Icon icon="mdi:plus" width={16} height={16} />
        </button>

        <div className="vr mx-1"></div>

        <button
          type="button"
          className="btn btn-light p-2 d-flex align-items-center justify-content-center rounded-circle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReset();
          }}
        >
          <Icon icon="mdi:fit-to-screen" width={16} height={16} />
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
