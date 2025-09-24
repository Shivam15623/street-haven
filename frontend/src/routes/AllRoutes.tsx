import { Suspense } from "react";
import {
  LazyProgramManuals,
  LazyEmployeedashboard,
  LazyEmployeeRoot,
  LazyEvents,
  LazyForgotPassword,
  LazyFormReports,
  LazyHelpDesk,
  LazyLoader,
  LazyLogin,
  LazyProfile,
  LazySignUp,
  LazyAgencyInfo,
  LazyResetPassword,
  LazyAdminRoot,
  LazyAdminDashboard,
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
    path: "signup",
    element: withSuspense(
      <RouteGuard isPublic={true}>
        <LazySignUp />
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
    path: "/employee",
    element: withSuspense(
      <RouteGuard requireRole="employee">
        <LazyEmployeeRoot />
      </RouteGuard>
    ),
    children: [
      { index: true, element: withSuspense(<LazyEmployeedashboard />) },
      // { path: "announcement", element: withSuspense(<LazyAnnouncements />) },
      {
        path: "programs&manuals",
        element: withSuspense(<LazyProgramManuals />),
      },
      { path: "events", element: withSuspense(<LazyEvents />) },
      { path: "agency_info", element: withSuspense(<LazyAgencyInfo />) },
      // { path: "tickets", element: withSuspense(<LazyTickets />) },
      { path: "it_facility", element: withSuspense(<LazyHelpDesk />) },
      { path: "forms", element: withSuspense(<LazyFormReports />) },
      { path: "profile", element: withSuspense(<LazyProfile />) },
    ],
  },
  {
    path: "/admin",
    element: withSuspense(
      <RouteGuard requireRole="admin">
        <LazyAdminRoot />
      </RouteGuard>
    ),
    children: [
      { index: true, element: withSuspense(<LazyAdminDashboard />) },
      {
        path: "programs&manuals",
        element: withSuspense(<LazyProgramManuals />),
      },
      { path: "events", element: withSuspense(<LazyEvents />) },
      { path: "agency_info", element: withSuspense(<LazyAgencyInfo />) },
      { path: "it_facility", element: withSuspense(<LazyHelpDesk />) },
      { path: "forms", element: withSuspense(<LazyFormReports />) },
      { path: "profile", element: withSuspense(<LazyProfile />) },
    ],
  },
];
