import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const result = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              likes: {
                $size: {
                  $ifNull: ["$likes", []],
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalLikes: {
                $sum: "$likes",
              },
              totalViews: {
                $sum: "$views",
              },
              totalVideos: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: {
            $ifNull: ["$subscribers", []],
          },
        },
        videoStats: {
          $arrayElemAt: ["$videos", 0],
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        videoStats: 1,
        subscriberCount: 1,
        fullname: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result[0], "Successfully fetched channel stats")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const result = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: { $ifNull: ["$likes", []] },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully fetched videos"));
});

export { getChannelStats, getChannelVideos };
