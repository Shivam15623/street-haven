import { Router } from "express";
import passport from "passport";

import {
  AddTaskComment,
  createTask,
  deleteTask,
  editTask,
  FetchTaskComments,
  getAllTasks,
  getTaskDetails,
  updateTaskStatus,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/multer.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);
router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId").get(getTaskDetails).patch(editTask).delete(deleteTask);

router.patch("/:taskId/status", updateTaskStatus);

router.get("/:entityId/comments", FetchTaskComments);
router.post("/:entityId/comments", upload.array("files"), AddTaskComment);
export default router;
