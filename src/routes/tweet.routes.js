import { Router } from "express";
import {
  createTweet,
  getAllTweets,
  getUserTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleTweetLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/get-all-tweets").get(getAllTweets);

router.route("/get-user-tweets/:userId").get(getUserTweet);

// private routes

router.route("/create-tweet").post(verifyJWT, createTweet);

router.route("/update-tweet").patch(verifyJWT, updateTweet);

router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet);

router.route("/toggle-like/:tweetId").patch(verifyJWT, toggleTweetLike);

export default router;
