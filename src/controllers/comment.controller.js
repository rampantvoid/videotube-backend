import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) throw new ApiError(401, "Invalid request");

  const aggregateQuery = [];

  const matchStage = {
    video: new mongoose.Types.ObjectId(videoId),
  };

  aggregateQuery.push({ $match: matchStage });

  aggregateQuery.push({
    $facet: {
      comments: [
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Comment.aggregate(aggregateQuery);
  const comments = result[0].comments;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, totalCount },
        "Comments fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId, content } = req.body;
  if (!videoId || !content) throw new ApiError(401, "Invalid request");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(401, "Video not found");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  const savedComment = await Comment.findById(comment.id);
  if (!savedComment) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedComment, "Comment added successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(401, "Invalid request");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(401, "Comment not found");

  const deletedComment = await Comment.findOneAndDelete(comment.id);
  if (!deletedComment) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId, updatedContent } = req.body;
  if (!commentId || !updatedContent) throw new ApiError(401, "Invalid request");

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content: updatedContent } },
    { new: true }
  );
  if (!comment) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export { getVideoComments, addComment, deleteComment, updateComment };
