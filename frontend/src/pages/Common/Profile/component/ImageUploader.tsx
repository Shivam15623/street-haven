import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Button, Form } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useEditProfileMutation } from "../../../../services/UserApi";
import { showSuccess, showWarning } from "../../../../utills/toastutills";
import { useDispatch } from "react-redux";
import { UpdateUserDetails } from "../../../../redux/AuthSlice";

// ✅ Main Component
const ImageUploader = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAvatar, { isLoading }] = useEditProfileMutation();
  const dispatch = useDispatch();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 📌 Select image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showWarning("Please upload JPG, PNG, or WEBP images only");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  // 📌 Track crop
  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 📌 Generate cropped blob
  const getCroppedImg = async () => {
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

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  // 📌 Save cropped image
  const handleSave = async () => {
    const croppedBlob = await getCroppedImg();
    if (!croppedBlob) return;

    const formData = new FormData();
    // 👇 backend should expect "avatar" or update to match your API
    formData.append("profilePic", croppedBlob, "cropped.jpg");

    try {
      const res = await editAvatar(formData).unwrap();
      if (res.success) {
        showSuccess(res.message || "Profile image updated successfully!");

        const payload = {
          profilePic: res.data.profilePic,
        };
        dispatch(UpdateUserDetails(payload));
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to upload profile image:", error);
    }
  };

  return (
    <>
      {/* Upload button */}
      <div
        onClick={() => document.getElementById("fileInput")?.click()}
        className="w-32-px h-32-px border-3 d-flex align-items-center justify-content-center position-absolute rounded-circle border-base top-0 end-0 bg-street-primary cursor-pointer"
      >
        <Icon icon="mdi:camera" color="white" className="text-md" />
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
            <Button
              className="btn-street-neutral btn-street-lg d-none d-sm-flex"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="btn-street-primary btn-street-lg"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        {imageSrc && (
          <div className="d-flex flex-column gap-3 align-items-center">
            {/* Cropper */}
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
                aspect={1} // square avatar
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
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
    </>
  );
};

// 📌 Helper: Load image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous"); // to avoid CORS issues
    image.src = url;
  });

export default ImageUploader;
