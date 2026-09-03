import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";

export interface IManager {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// Canonical location shape as returned from the API (managers/facilityManager populated)
export interface ILocation {
  _id: string;
  name: string;
  slug: string;
  managers: IManager[];
  facilityManager: IManager;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Kept as an alias for backwards compatibility with existing imports
// (e.g. `import { type Location } from "../services/locationApi"`).
// Prefer importing `ILocation` going forward; consider removing this once
// all usages are migrated.
export type Location = ILocation;

interface locationViewQuery {
  isActive?: boolean;
}

export interface GetLocationsResponse {
  message: string;
  statuscode: number;
  data: Location[];
  success: boolean;
}

export interface CreateLocationBody {
  name: string;
  managerIds?: string[];
  facilityManager?: string; // ObjectId of the facility manager, NOT the populated user
}

export interface UpdateLocationBody {
  name?: string;
  managerIds?: string[];
  facilityManager?: string; // ObjectId of the facility manager, NOT the populated user
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

export interface SetFacilityManagerRequest {
  locationId: string;
  facilityManagerId: string;
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

    setFacilityManager: builder.mutation<
      ApiResponse<ILocation>,
      SetFacilityManagerRequest
    >({
      query: ({ locationId, facilityManagerId }) => ({
        url: `/location/${locationId}/facility-manager`,
        method: "PATCH",
        body: { facilityManagerId },
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
  useRemoveManagerFromLocationMutation,
  useSetFacilityManagerMutation,
  useLazyGetLocationDetailsQuery,
} = locationApi;
