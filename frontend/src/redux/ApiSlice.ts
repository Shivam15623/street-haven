import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // ✅ use /react here
import { setLoggedIn, setLoggedOut } from "./AuthSlice";
import type { RootState } from "./store";
import type { LoginVerifyTotpResponseData } from "../interfaces/AuthInterfaces";

const environment = import.meta.env;

const baseQuery = fetchBaseQuery({
  baseUrl: environment.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Accept", "application/json");
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      const { accessToken, user } =
        refreshResult.data as LoginVerifyTotpResponseData;
      const payload = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        profilePic: user.profilePic,
        role: user.role,
        slug: user.slug,
        createdAt: user.createdAt,
        title: user.title || "",
        hireDate: new Date(user.hireDate),
      };
      api.dispatch(
        setLoggedIn({
          accessToken,
          UserData: payload,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(setLoggedOut());
    }
  }

  return result;
};

// ✅ Create the API with endpoints directly
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Event",
    "Ticket",
    "Manual",
    "Meetings",
    "HrUpdates",
    "StaffFeedBack",
    "IncidentReport",
    "Profile",
    "FAQ",
    "EmergencyContact",
    "Employees",
    "OrgNode",
    "Notification",
    "Announcement",
    "Agreement",
  ],
  endpoints: () => ({}),
});

// ✅ Export hooks directly from api
export const {} = api;
