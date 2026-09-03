import axios from "axios";
import { store } from "../redux/store";

export const uploadWithProgress =
  (endpoint: string, method: "POST" | "PATCH" = "POST") =>
  async ({
    data,
    onProgress,
  }: {
    data: FormData;
    onProgress?: (p: number) => void;
  }) => {
    try {
      const token = store.getState().auth.accessToken;
      const response = await axios.request({
        url: `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        method,
        data,
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded / event.total!) * 100);
          onProgress?.(percent);
        },
      });

      return { data: response.data };
    } catch (error: any) {
      return {
        error: error,
      };
    }
  };
