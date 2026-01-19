import {
  LazyProgramManuals,
  LazyEmployeedashboard,
  LazyEvents,
  LazyForgotPassword,
  LazyFormReports,
  LazyHelpDesk,
  LazyLogin,
  LazyProfile,
  LazyAgencyInfo,
  LazyResetPassword,
  LazyEmployees,
  LazyVerifyTotp,
  LazyGenereateTotp,
  LazyRootLayout,
} from "../Lazy Components";
import { Navigate, type RouteObject } from "react-router-dom";
import RouteGuard from "../Routeguard";
import { ROLES } from "../interfaces/AuthInterfaces";

export const AllRoutes: RouteObject[] = [
  { path: "", element: <Navigate to="/login" replace /> },

  {
    path: "login",
    element: (
      <RouteGuard isPublic>
        <LazyLogin />
      </RouteGuard>
    ),
  },

  {
    path: "forgot-password",
    element: (
      <RouteGuard isPublic>
        <LazyForgotPassword />
      </RouteGuard>
    ),
  },

  {
    path: "reset-password",
    element: (
      <RouteGuard isPublic>
        <LazyResetPassword />
      </RouteGuard>
    ),
  },

  {
    path: "connect-Authenticator",
    element: (
      <RouteGuard isPublic>
        <LazyGenereateTotp />
      </RouteGuard>
    ),
  },

  {
    path: "otp-verify",
    element: (
      <RouteGuard isPublic>
        <LazyVerifyTotp />
      </RouteGuard>
    ),
  },

  {
    path: "/",
    element: (
      <RouteGuard isPublic={false}>
        <LazyRootLayout />
      </RouteGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteGuard isPublic={false}>
            <LazyEmployeedashboard />
          </RouteGuard>
        ),
      },

      {
        path: "programs&manuals",
        element: (
          <RouteGuard isPublic={false}>
            <LazyProgramManuals />
          </RouteGuard>
        ),
      },

      {
        path: "events",
        element: (
          <RouteGuard isPublic={false}>
            <LazyEvents />
          </RouteGuard>
        ),
      },

      {
        path: "agency_info",
        element: (
          <RouteGuard isPublic={false}>
            <LazyAgencyInfo />
          </RouteGuard>
        ),
      },

      {
        path: "it_facility",
        element: (
          <RouteGuard isPublic={false}>
            <LazyHelpDesk />
          </RouteGuard>
        ),
      },

      {
        path: "forms",
        element: (
          <RouteGuard isPublic={false}>
            <LazyFormReports />
          </RouteGuard>
        ),
      },

      {
        path: "profile",
        element: (
          <RouteGuard isPublic={false}>
            <LazyProfile />
          </RouteGuard>
        ),
      },

      {
        path: "employees",
        element: (
          <RouteGuard
            isPublic={false}
            requireRole={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
          >
            <LazyEmployees />
          </RouteGuard>
        ),
      },
    ],
  },
];
