import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(401, "Provide a video id");

  const video = await Video.findById(videoId);
  if (!(video && video.isPublished))
    throw new ApiError(401, "Unable to find video");

  const existingLike = await Like.findOne({
    $and: [{ video: videoId }, { likedBy: req.user?._id }],
  });

  if (existingLike) {
    const deletedLike = await Like.findOneAndDelete(existingLike._id);
    if (!deletedLike) throw new ApiError(500, "Something went wrong");
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like toggled successfully"));
  }

  const likedVideo = await Like.create({
    video: video._id,
    likedBy: req.user?._id,
  });

  const savedLike = await Like.findOne(likedVideo._id);
  if (!savedLike) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedLike, "Like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(401, "Provide a comment id");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(401, "Unable to find comment");

  const existingLike = await Like.findOne({
    $and: [{ comment: commentId }, { likedBy: req.user?._id }],
  });

  if (existingLike) {
    const deletedLike = await Like.findOneAndDelete(existingLike._id);
    if (!deletedLike) throw new ApiError(500, "Something went wrong");
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like toggled successfully"));
  }

  const likedComment = await Like.create({
    comment: comment._id,
    likedBy: req.user?._id,
  });

  const savedLike = await Like.findOne(likedComment._id);
  if (!savedLike) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedLike, "Like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(401, "Provide a tweet id");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(401, "Unable to find tweet");

  const existingLike = await Like.findOne({
    $and: [{ tweet: tweetId }, { likedBy: req.user?._id }],
  });

  if (existingLike) {
    const deletedLike = await Like.findOneAndDelete(existingLike._id);
    if (!deletedLike) throw new ApiError(500, "Something went wrong");
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like toggled successfully"));
  }

  const likedTweet = await Like.create({
    tweet: tweet._id,
    likedBy: req.user?._id,
  });

  const savedLike = await Like.findOne(likedTweet._id);
  if (!savedLike) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedLike, "Like toggled successfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike };
