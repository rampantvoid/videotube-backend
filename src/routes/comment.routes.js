import { Router } from "express";
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/get-comments/:videoId").get(getVideoComments);

router.route("/add-comment").post(verifyJWT, addComment);

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

router.route("/update-comment").patch(verifyJWT, updateComment);

router.route("/like-comment/:commentId").patch(verifyJWT, toggleCommentLike);

export default router;
