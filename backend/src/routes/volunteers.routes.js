// import { Router } from "express";
// import {
//   AddVolunteer,
//   AllVolunteers,
//   EditVolunteer,
//   EditVolunteerPassword,
//   VolunteerActiveInactiveToggle,
//   volunteerSuperviserForm,
//   getVolunteerById,
//   RemoveVolunteer,
//   resetVolunteerTotp,
// } from "../controllers/volunteers.controller.js";
// import { upload } from "../middleware/multer.js";
// import { authorizePermissions } from "../middleware/AuthRole.js";
// import passport from "passport";
// import { PERMISSIONS } from "../auth/permissions.js";
// import { validateRequest } from "../middleware/validate.js";
// import {
//   createVolunteerSchema,
//   editVolunteerSchema,
//   viewVolunteers,
// } from "../validations/volunteer.js";
// import { idParamSchema } from "../validations/common.js";
// import { checkActiveUser } from "../middleware/checkActiveUsers.js";

// const router = Router();
// router.use(passport.authenticate("jwt", { session: false }));
// router.use(checkActiveUser);

// router
//   .route("/view")
//   .get(
//     authorizePermissions({ action: PERMISSIONS.VIEW_VOLUNTEERS }),
//     validateRequest(viewVolunteers, "query"),
//     AllVolunteers,
//   );

// router
//   .route("/edit/:id")
//   .patch(
//     upload.single("profilePic"),
//     validateRequest(editVolunteerSchema, "body"),
//     authorizePermissions({ action: PERMISSIONS.EDIT_VOLUNTEER }),
//     EditVolunteer,
//   );

// router
//   .route("/changePassword/:id")
//   .patch(
//     authorizePermissions({ action: PERMISSIONS.RESET_PASSWORD }),
//     validateRequest(idParamSchema, "params"),
//     EditVolunteerPassword,
//   );

// router
//   .route("/delete/:id")
//   .delete(
//     authorizePermissions({ action: PERMISSIONS.DELETE_VOLUNTEER }),
//     validateRequest(idParamSchema, "params"),
//     RemoveVolunteer,
//   );

// router
//   .route("/add")
//   .post(
//     authorizePermissions({ action: PERMISSIONS.CREATE_VOLUNTEER }),
//     validateRequest(createVolunteerSchema, "body"),
//     AddVolunteer,
//   );

// router
//   .route("/resetTotp/:id")
//   .patch(
//     authorizePermissions({ action: PERMISSIONS.CREATE_VOLUNTEER }),
//     resetVolunteerTotp,
//   );

// router.patch(
//   "/status-toggle/:id",
//   authorizePermissions({ action: PERMISSIONS.VOLUNTEER_STATUS_CHANGE }),
//   VolunteerActiveInactiveToggle,
// );

// router
//   .route("/form-superviser")
//   .get(
//     authorizePermissions({ action: PERMISSIONS.VIEW_VOLUNTEERS }),
//     volunteerSuperviserForm,
//   );

// router
//   .route("/:id")
//   .get(
//     authorizePermissions({ action: PERMISSIONS.VIEW_VOLUNTEERS }),
//     getVolunteerById,
//   );

// export default router;