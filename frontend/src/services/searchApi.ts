import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
interface searchResultEvent {
  _id: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "update" | null;
}
interface searchResultMeeting {
  _id: string;
  title: string;
  meetingDate: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "update" | null;
}
interface searchResulthrUpdate {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "update" | null;
}
interface searchResultMannual {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: "new" | "update" | null;
}

type SearchResultResponse = ApiResponse<{
  isEmpty?: true;
  events: searchResultEvent[];
  hrUpdates: searchResulthrUpdate[];
  programManuals: searchResultMannual[];
  meetingMinutes: searchResultMeeting[];
}>;
export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchAllContent: builder.query<SearchResultResponse, string>({
      query: (q) => ({
        url: `/search?query=${encodeURIComponent(q)}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useSearchAllContentQuery } = searchApi;
