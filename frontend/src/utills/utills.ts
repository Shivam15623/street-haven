import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const formatTime12Hour = (time24?: string) => {
  if (!time24) return "--:--";

  return dayjs(time24, "HH:mm").format("hh:mm A");
};
