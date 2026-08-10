import {
  LazyProgramManuals,
  LazyEmployeedashboard,
  LazyForgotPassword,
  LazyHelpDesk,
  LazyLogin,
  LazyProfile,
  LazyAgencyInfo,
  LazyResetPassword,
  LazyEmployees,
  LazyVerifyTotp,
  LazyGenereateTotp,
  LazyRootLayout,
  LazyTasks,
  LazyAdminCertificationsPage,
  LazyInActiveUser,
} from "../Lazy Components";
import { Navigate, type RouteObject } from "react-router-dom";
import RouteGuard from "../Routeguard";
import { ROLES } from "../interfaces/AuthInterfaces";
import { Suspense } from "react";
import Loader from "../components/Loader";
const withSuspense = (Component: React.ReactElement) => (
  <Suspense fallback={<Loader />}>{Component}</Suspense>
);

export const AllRoutes: RouteObject[] = [
  { path: "", element: <Navigate to="/login" replace /> },

  {
    path: "login",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyLogin />
      </RouteGuard>,
    ),
  },

  {
    path: "forgot-password",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyForgotPassword />
      </RouteGuard>,
    ),
  },

  {
    path: "reset-password",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyResetPassword />
      </RouteGuard>,
    ),
  },

  {
    path: "connect-Authenticator",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyGenereateTotp />
      </RouteGuard>,
    ),
  },

  {
    path: "otp-verify",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyVerifyTotp />
      </RouteGuard>,
    ),
  },
  {
    path: "/account-inactive",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyInActiveUser />
      </RouteGuard>,
    ),
  },
  {
    path: "/",
    element: withSuspense(
      <RouteGuard isPublic={false}>
        <LazyRootLayout />
      </RouteGuard>,
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
        path: "volunteer-training",
        element: (
          <RouteGuard isPublic={false}>
            <LazyProgramManuals />
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
      {
        path: "tasks",
        element: (
          <RouteGuard
            isPublic={false}
            requireRole={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.VOLUNTEER]}
          >
            <LazyTasks />
          </RouteGuard>
        ),
      },
      {
        path: "tasks/:slug",
        element: (
          <RouteGuard
            isPublic={false}
            requireRole={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.VOLUNTEER]}
          >
            <LazyTasks />
          </RouteGuard>
        ),
      },
      {
        path: "certificates",
        element: (
          <RouteGuard
            isPublic={false}
            requireRole={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
          >
            <LazyAdminCertificationsPage />
          </RouteGuard>
        ),
      },
    ],
  },
];
