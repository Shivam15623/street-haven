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
  LazyUnauthorized,
} from "../Lazy Components";
import { Navigate, type RouteObject } from "react-router-dom";
import RouteGuard from "../Routeguard";
import { Suspense } from "react";
import Loader from "../components/Loader";
import { PERMISSIONS } from "../utills/auth/permissions";
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
    path: "/unauthorized",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazyUnauthorized />
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
          <RouteGuard
            isPublic={false}
            requirePermission={[PERMISSIONS.VIEW_PROGRAM_MANUALS]}
          >
            <LazyProgramManuals />
          </RouteGuard>
        ),
      },

      {
        path: "agency_info",
        element: (
          <RouteGuard
            isPublic={false}
            requirePermission={[
              PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
              PERMISSIONS.VIEW_ANNOUNCEMENTS,
            ]}
          >
            <LazyAgencyInfo />
          </RouteGuard>
        ),
      },

      {
        path: "it_facility",
        element: (
          <RouteGuard
            isPublic={false}
            requirePermission={[
              PERMISSIONS.TICKET_VIEW_SELF,
              PERMISSIONS.TICKET_REPORT_ALL,
              PERMISSIONS.TICKET_REPORT_SELF_MANAGED,
              PERMISSIONS.VIEW_FAQS,
              PERMISSIONS.VIEW_EMERGENCY_CONTACTS,
              PERMISSIONS.TICKET_CREATE,
              PERMISSIONS.LOCATION_VIEW,
            ]}
          >
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
        path: "users",
        element: (
          <RouteGuard
            isPublic={false}
            requirePermission={[PERMISSIONS.VIEW_EMPLOYEES]}
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
            requirePermission={[
              PERMISSIONS.TASK_VIEW_ALL,
              PERMISSIONS.TASK_VIEW_SELF,
            ]}
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
            requirePermission={[
              PERMISSIONS.TASK_VIEW_ALL,
              PERMISSIONS.TASK_VIEW_SELF,
            ]}
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
            requirePermission={[PERMISSIONS.TRAINING_CERTIFICATE_VIEW_ALL]}
          >
            <LazyAdminCertificationsPage />
          </RouteGuard>
        ),
      },
    ],
  },
];
