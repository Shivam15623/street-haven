import { Router } from "express";
import passport from "passport";

import {
  AddTaskComment,
  createTask,
  deleteTask,
  editTask,
  ExportTasksReport,
  FetchTaskComments,
  getAllTasks,
  getTaskBySlug,
  getTaskDetails,
  GetTaskTimeline,
  updateTaskStatus,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/multer.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { getTaskMentionableUsers } from "../controllers/comments.controller.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router
  .route("/")
  .get(
    authorizePermissions({ action: PERMISSIONS.TASK_VIEW_SELF }),
    getAllTasks,
  )
  .post(authorizePermissions({ action: PERMISSIONS.TASK_CREATE }), createTask);
router.get("/slug/:slug", getTaskBySlug);
router.get("/:slug/mentionable-users", getTaskMentionableUsers);
router
  .route("/:taskId")
  .get(
    authorizePermissions({ action: PERMISSIONS.TASK_VIEW_SELF }),
    getTaskDetails,
  )
  .patch(authorizePermissions({ action: PERMISSIONS.TASK_EDIT }), editTask)
  .delete(
    authorizePermissions({ action: PERMISSIONS.TASK_DELETE }),
    deleteTask,
  );

router.patch("/:taskId/status", updateTaskStatus);
router.get(
  "/report/export",
  authorizePermissions({ action: PERMISSIONS.TASK_REPORT_EXPORT }),
  ExportTasksReport,
);
router.get("/:entityId/comments", GetTaskTimeline);
router.post("/:entityId/comments", upload.array("files"), AddTaskComment);
export default router;
