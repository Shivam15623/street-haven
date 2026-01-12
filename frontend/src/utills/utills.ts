import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const formatTime12Hour = (time24?: string) => {
  if (!time24) return "--:--";

  return dayjs(time24, "HH:mm").format("hh:mm A");
};
export const getAxiosErrorMessage = (err: any): string => {
  // Check if it's an Axios error with a response
  if (err.response && err.response.data) {
    const data = err.response.data;
    // Check if the response data has a 'message' field
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
    // If no 'message' field, return a generic error message
    return "An error occurred while processing the request.";
  }
  return "An error occurred while processing the request.";
};

export const getErrorMessage = (err: any): string => {
  // Check if it's an Axios error with a response
  if (err && err.data) {
    const data = err.data;
    // Check if the response data has a 'message' field
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
    // If no 'message' field, return a generic error message
    return "An error occurred while processing the request.";
  }
  return "An error occurred while processing the request.";
};

export const getPlainTextFromHTML = (html: string): string => {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.trim() || "";
};