import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Server's own local IANA timezone, resolved once at module load —
// same API Intl.DateTimeFormat().resolvedOptions().timeZone gives in the browser,
// just read from the Node process instead.
export const SERVER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatDate = (date, tz = SERVER_TZ) =>
  date ? dayjs(date).tz(tz).format("DD/MM/YYYY hh:mm A") : "-";