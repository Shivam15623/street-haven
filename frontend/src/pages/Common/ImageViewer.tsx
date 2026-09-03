import  { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const ImageViewer = () => {
  const [searchParams] = useSearchParams();

  const imageUrl = searchParams.get("url");

  useEffect(() => {
    document.title = "Street Haven";

    const originalStyles = {
      margin: document.body.style.margin,
      height: document.body.style.height,
      backgroundColor: document.body.style.backgroundColor,
      overflow: document.body.style.overflow,
    };

    document.body.style.margin = "0";
    document.body.style.height = "100%";
    document.body.style.backgroundColor = "rgb(14, 14, 14)";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.margin = originalStyles.margin;
      document.body.style.height = originalStyles.height;
      document.body.style.backgroundColor = originalStyles.backgroundColor;
      document.body.style.overflow = originalStyles.overflow;
    };
  }, []);

  if (!imageUrl) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgb(14, 14, 14)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Image not found
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgb(14, 14, 14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <img
        src={imageUrl}
        alt="Street Haven"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: "block",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "zoom-in",
          backgroundColor: "hsl(0, 0%, 90%)",
          transition: "background-color 300ms",
        }}
      />
    </div>
  );
};

export default ImageViewer;
