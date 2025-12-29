import { Suspense } from "react";
import {
  LazyProgramManuals,
  LazyEmployeedashboard,
  LazyEvents,
  LazyForgotPassword,
  LazyFormReports,
  LazyHelpDesk,
  LazyLoader,
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


const withSuspense = (Component: React.ReactElement) => (
  <Suspense fallback={<LazyLoader />}>{Component}</Suspense>
);
export const AllRoutes: RouteObject[] = [
  { path: "", element: <Navigate to="/login" replace /> },
  {
    path: "login",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyLogin />
      </RouteGuard>
    ),
  },

  {
    path: "forgot-password",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyForgotPassword />
      </RouteGuard>
    ),
  },
  {
    path: "reset-password",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyResetPassword />
      </RouteGuard>    
    ),
  },
  {
    path: "connect-Authenticator",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyGenereateTotp />
      </RouteGuard>
    ),
  },
  {
    path: "otp-verify",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyVerifyTotp />
      </RouteGuard>
    ),
  },

  {
    path: "/",
    element: withSuspense(<LazyRootLayout />),
    children: [
      {
        index: true,
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyEmployeedashboard />
          </RouteGuard>
        ),
      },

      {
        path: "programs&manuals",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyProgramManuals />
          </RouteGuard>
        ),
      },

      {
        path: "events",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyEvents />
          </RouteGuard>
        ),
      },

      {
        path: "agency_info",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyAgencyInfo />
          </RouteGuard>
        ),
      },

      {
        path: "it_facility",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyHelpDesk />
          </RouteGuard>
        ),
      },

      {
        path: "forms",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyFormReports />
          </RouteGuard>
        ),
      },

      {
        path: "profile",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyProfile />
          </RouteGuard>
        ),
      },
      {
        path: "employees",
        element: withSuspense(
          <RouteGuard isPublic={false}>
            <LazyEmployees />
          </RouteGuard>
        ),
      },
    ],
  },
];
