import React from "react";

export const LazyLoader = React.lazy(() => import("../components/Loader"));

export const LazyLogin = React.lazy(
  () => import("../pages/Authentication/Login")
);
export const LazyForgotPassword = React.lazy(
  () => import("../pages/Authentication/ForgotPassword")
);
export const LazyResetPassword = React.lazy(
  () => import("../pages/Authentication/ResetPassword")
);
export const LazyGenereateTotp = React.lazy(
  () => import("../pages/Authentication/GenerateTotp")
);
export const LazyVerifyTotp = React.lazy(
  () => import("../pages/Authentication/VerifyTotp")
);
export const LazyRootLayout = React.lazy(
  () => import("../layouts/rootLayout")
);
export const LazyInActiveUser=React.lazy(()=> import("../pages/Authentication/Forbidden"))
export const LazyEmployeedashboard = React.lazy(
  () => import("../pages/Employee/Dashboard")
);
export const LazyAdminDashboard = React.lazy(
  () => import("../pages/Admin/Dashboard")
);

export const LazyProgramManuals = React.lazy(
  () => import("../pages/Common/DocumentsPolicy")
);

export const LazyHelpDesk = React.lazy(
  () => import("../pages/Common/ItNFacility")
);

export const LazyAgencyInfo = React.lazy(
  () => import("../pages/Common/AgencyInformation")
);
export const LazyEmployees = React.lazy(
  () => import("../pages/Admin/Employees")
);
export const LazyTasks=React.lazy(()=>import("../pages/Common/Task"))
export const LazyProfile = React.lazy(() => import("../pages/Common/Profile"));
export const LazyAdminCertificationsPage=React.lazy(()=>import("../pages/Common/AdminCertificationsPage"))