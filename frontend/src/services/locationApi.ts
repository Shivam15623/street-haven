import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
export interface Location {
  _id: string;
  name: string;
  managers: IManager[]; // or Manager[] if populated later
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

export interface IManager {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface ILocation {
  _id: string;
  name: string;
  slug: string;
  managers: IManager[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationBody {
  name: string;
  managerIds?: string[];
}

export interface UpdateLocationBody {
  name?: string;
  managerIds?: string[];
  isActive?: boolean;
}

export interface EditLocationRequest {
  locationId: string;
  body: UpdateLocationBody;
}

export interface FetchLocationsParams {
  isActive?: boolean;
}

export interface ManagerActionRequest {
  locationId: string;
  managerId: string;
}
export const locationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createLocation: builder.mutation<
      ApiResponse<ILocation>,
      CreateLocationBody
    >({
      query: (body) => ({
        url: "/location/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Locations"],
    }),
    fetchLocations: builder.query<GetLocationsResponse, locationViewQuery>({
      query: ({ isActive }) => ({
        url: "/location/view",
        method: "GET",
        params: isActive !== undefined ? { isActive } : {},
      }),
      keepUnusedDataFor: 300,
      providesTags: ["Locations"],
    }),
    getLocationDetails: builder.query<ApiResponse<ILocation>, string>({
      query: (locationId) => `/location/${locationId}`,
      providesTags: (_result, _error, id) => [{ type: "Locations", id }],
    }),

    editLocation: builder.mutation<ApiResponse<ILocation>, EditLocationRequest>(
      {
        query: ({ locationId, body }) => ({
          url: `/location/edit/${locationId}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (_result, _error, { locationId }) => [
          "Locations",
          { type: "Locations", id: locationId },
        ],
      },
    ),

    deleteLocation: builder.mutation<ApiGeneralResponse, string>({
      query: (locationId) => ({
        url: `/location/delete/${locationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Locations"],
    }),

    addManagerToLocation: builder.mutation<
      ApiResponse<ILocation>,
      ManagerActionRequest
    >({
      query: ({ locationId, managerId }) => ({
        url: `/location/${locationId}/managers`,
        method: "POST",
        body: { managerId },
      }),
      invalidatesTags: (_result, _error, { locationId }) => [
        "Locations",
        { type: "Locations", id: locationId },
      ],
    }),

    removeManagerFromLocation: builder.mutation<
      ApiResponse<ILocation>,
      ManagerActionRequest
    >({
      query: ({ locationId, managerId }) => ({
        url: `/location/${locationId}/managers`,
        method: "DELETE",
        body: { managerId },
      }),
      invalidatesTags: (_result, _error, { locationId }) => [
        "Locations",
        { type: "Locations", id: locationId },
      ],
    }),
  }),
});

export const {
  useFetchLocationsQuery,
  useCreateLocationMutation,
  useDeleteLocationMutation,
  useEditLocationMutation,
  useGetLocationDetailsQuery,
  useAddManagerToLocationMutation,
  useLazyGetLocationDetailsQuery,
} = locationApi;
