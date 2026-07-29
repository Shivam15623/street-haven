import { api } from "../redux/ApiSlice";
export interface Location {
  _id: string;
  name: string;
  managers: string[]; // or Manager[] if populated later
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}
interface locationViewQuery {
  isActive?: boolean;
}
export interface GetLocationsResponse {
  message: string;
  statuscode: number;
  data: Location[];
  success: boolean;
}
export const locationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchLocations: builder.query<GetLocationsResponse, locationViewQuery>({
  query: ({ isActive }) => ({
    url: "/location/view",
    method: "GET",
    params: isActive !== undefined ? { isActive } : {},
  }),
  keepUnusedDataFor: 300,
  providesTags: ["Locations"],
}),
  }),
});

export const { useFetchLocationsQuery } = locationApi;
