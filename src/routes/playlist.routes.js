import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideo,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/delete-playlist/:playlistId").delete(deletePlaylist);

router.route("/get-playlists").get(getUserPlaylists);

router.route("/get-playlist/:playlistId").get(getPlaylistById);

router.route("/add-video-to-playlist").put(addVideoToPlaylist);

router.route("/remove-video-from-playlist").patch(removeVideo);

export default router;
