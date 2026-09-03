import type { ApiGeneralResponse } from "../interfaces/Response";
import type {
  changePasswordCredentials,
  EditUserProfileResponse,
  UserProfileResponse,
} from "../interfaces/User";
import { api } from "../redux/ApiSlice";

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    FetchUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/users/userProfile",
        method: "GET",
      }),
      providesTags:["Profile"]
    }),
    editProfile: builder.mutation<EditUserProfileResponse, FormData>({
      query: (cradentials) => ({
        url: "/users/edit/Profile",
        method: "PATCH",
        body: cradentials,
      }),
      invalidatesTags:["Profile"]
    }),
    changePassword: builder.mutation<ApiGeneralResponse,changePasswordCredentials>({
      query: (cradentials) => ({
        url: "/users/edit/changePassword",
        method: "PATCH",
        body: cradentials,
      }),
    }),
  }),
});

export const {
  useFetchUserProfileQuery,
  useEditProfileMutation,
  useChangePasswordMutation,
} = userApi;
