import type { ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
interface searchResultItem {
  _id: string;
  slug: string;
  title: string;
}
type SearchResultResponse = ApiResponse<{
  isEmpty?: true;
  events: searchResultItem[];
  hrUpdates: searchResultItem[];
  programManuals: searchResultItem[];
  meetingMinutes: searchResultItem[];
  announcements: searchResultItem[];
  collectiveAgreements: searchResultItem[];
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
