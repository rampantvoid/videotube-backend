import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { getVideoDurationInSeconds } from "get-video-duration";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const aggregteQuery = [];

  const matchStage = {};

  if (userId) {
    matchStage._id = new mongoose.Types.ObjectId(userId);
  }
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (Object.keys(matchStage).length > 0) {
    aggregteQuery.push({ $match: matchStage });
  }

  const sortStage = {};

  sortStage[sortBy || "createdAt"] = sortType === "asc" ? 1 : -1;
  aggregteQuery.push({ $sort: sortStage });

  aggregteQuery.push({
    $facet: {
      videos: [
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Video.aggregate(aggregteQuery);
  console.log(result);
  const videos = result[0].videos;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalCount },
        "Videos fetched successfully"
      )
    );
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const localVideoPath = req.files?.uploadVideo[0]?.path;
  const localThumbnailPath = req.files?.thumbnail[0]?.path;

  if (!localVideoPath || !localThumbnailPath) {
    throw new ApiError(400, "Files not found");
  }

  const video = await uploadOnCloudinary(localVideoPath);
  const thumbnail = await uploadOnCloudinary(localThumbnailPath);
  if (!video || !thumbnail) {
    throw new ApiError(500, "Something went wrong uploading");
  }

  console.log(video);

  const duration = await getVideoDurationInSeconds(video.url);
  const user = await User.findByIdAndUpdate(req.user?._id);
  if (!user) {
    throw new ApiError(404, "Unauthozied access");
  }

  const uploadedVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration,
    owner: user._id,
  });

  if (!uploadedVideo) {
    throw new ApiError(500, "Somethig went wrong uploading video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Provide a video id");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description, videoId } = req.body;
  console.log(req.body);

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "Unauthorized Access");
  }

  const localThumbnailPath = req.file?.path;
  if (!localThumbnailPath) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnail = await uploadOnCloudinary(localThumbnailPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error uploading thumbnail");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { thumbnail: thumbnail.url, title, description } },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Error saving thumbnail");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(401, "Unauthorized access");

  const video = await Video.findOneAndDelete(videoId);
  if (!video) throw new ApiError(400, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  console.log(req.body);

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "Unauthorized access");
  }
  console.log(videoId);
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;

  const savedVideo = await video.save();
  if (!savedVideo) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, savedVideo, "Publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
};
