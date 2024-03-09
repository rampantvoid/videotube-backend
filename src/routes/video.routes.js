import { Router } from "express";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { toggleVideoLike } from "../controllers/like.controller.js";

const router = new Router();

router.route("/getAllVideos").get(getAllVideos);

router.route("/get-video/:videoId").get(getVideoById);

// private routes
router.route("/publishVideo").post(
  verifyJWT,
  upload.fields([
    {
      name: "uploadVideo",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router
  .route("/update-video")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router
  .route("/update-video")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle-publish-status").patch(verifyJWT, togglePublishStatus);

router.route("/delete-video").delete(verifyJWT, deleteVideo);

router.route("/toggle-like/:videoId").post(verifyJWT, toggleVideoLike);

export default router;
