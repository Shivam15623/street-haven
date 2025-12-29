import { api } from "../redux/ApiSlice";
import type { ApiGeneralResponse } from "../interfaces/Response";
import { setLoggedIn, setLoggedOut } from "../redux/AuthSlice";
import type {
  ForgotPasswordcredential,
  GenerateTotpCredentials,
  GenerateTotpResponse,
  LoginCredentials,
  LoginResponse,
  LoginVerifyTotpcredentials,
  LoginVerifyTotpResponse,
  RequestResetPasswordcredential,
  SetUpTotpResponseCredentials,
} from "../interfaces/AuthInterfaces";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    logout: builder.mutation<ApiGeneralResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    forgotPassword: builder.mutation<
      ApiGeneralResponse,
      RequestResetPasswordcredential
    >({
      query: (credentials) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation<
      ApiGeneralResponse,
      ForgotPasswordcredential
    >({
      query: (credentials) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: credentials,
      }),
    }),
    verifyTotp: builder.mutation<
      LoginVerifyTotpResponse,
      LoginVerifyTotpcredentials
    >({
      query: (credentials) => ({
        url: "/auth/verify-totp",
        method: "POST",
        body: credentials,
      }),
    }),
    generateTotp: builder.mutation<
      GenerateTotpResponse,
      GenerateTotpCredentials
    >({
      query: (credentials) => ({
        url: "/auth/generate-totp",
        method: "POST",
        body: credentials,
      }),
    }),
    setupTotp: builder.mutation<
      ApiGeneralResponse,
      SetUpTotpResponseCredentials
    >({
      query: (credentials) => ({
        url: "/auth/setup-totp",
        method: "POST",
        body: credentials,
      }),
    }),
    silentAuth: builder.query<LoginVerifyTotpResponse, void>({
      query: () => ({
        url: "/auth/silent-auth",
        method: "GET",
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const { user } = data.data;
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
            hireDate: new Date(user.hireDate).toISOString(),
            customPermissions: user.customPermissions || [],
          };
          if (data?.data.accessToken) {
            dispatch(
              setLoggedIn({
                accessToken: data.data.accessToken,
                UserData: payload,
              })
            );
          }
        } catch {
          dispatch(setLoggedOut());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,

  useSilentAuthQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyTotpMutation,
  useGenerateTotpMutation,
  useSetupTotpMutation,
} = authApi;
