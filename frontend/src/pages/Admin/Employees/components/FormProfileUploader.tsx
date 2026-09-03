import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Form } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";

type Props = {
  setFieldValue: (field: string, value: File) => void;
  value?: File | null; // Formik value (new file)
  imageUrl?: string | null; // Existing image URL
};

const FormImageUploader: React.FC<Props> = ({
  setFieldValue,
  value,
  imageUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Show preview if file changes
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  // Select file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowModal(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg();
    if (!croppedBlob) return;

    const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setFieldValue("profilePic", file);

    setShowModal(false);
  };

  return (
    <div className="d-flex flex-column gap-2">
      {/* Preview image */}
      <div className="position-relative" style={{ width: 120, height: 120 }}>
        <img
          src={previewUrl || "assets/images/userlogo.png"}
          alt="Profile Preview"
          className="rounded-circle"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Upload button overlay */}
        <div
          onClick={() => document.getElementById("fileInput")?.click()}
          className="w-32-px h-32-px border-3 d-flex align-items-center justify-content-center position-absolute rounded-circle border-base top-0 end-0 bg-street-primary cursor-pointer"
        >
          <Icon icon="mdi:camera" color="white" />
        </div>
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Cropper Modal */}
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Crop your image"
        size="lg"
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-street-neutral btn-street-lg d-none d-sm-flex align-items-center justify-content-center gap-2 radius-12"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg d-flex align-items-center justify-content-center gap-2 radius-12"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        }
      >
        {imageSrc && (
          <div className="d-flex flex-column gap-3 align-items-center">
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                background: "#333",
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <Form.Range
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "80%" }}
            />
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

// Helper
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export default FormImageUploader;
