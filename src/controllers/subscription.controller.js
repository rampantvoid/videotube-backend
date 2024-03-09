import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) throw new ApiError(401, "Invalid request");

  const exisitingSubscription = await Subscription.findOne({
    $and: [{ channel: channelId }, { subscriber: req.user?._id }],
  });
  if (exisitingSubscription) {
    const deletedSubscription = await Subscription.findByIdAndDelete(
      exisitingSubscription.id
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedSubscription, "Unsubscribed Successfully")
      );
  }

  const subscription = await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });

  const savedSubscription = await Subscription.findById(subscription.id);
  if (!savedSubscription) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedSubscription, "Subscribed Successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const result = await Subscription.aggregate([
    {
      $facet: {
        subscribers: [
          {
            $match: { channel: new mongoose.Types.ObjectId(req.user?._id) },
          },
        ],
        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const subscribers = result[0].subscribers;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, totalCount },
        "Subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const result = await Subscription.aggregate([
    {
      $facet: {
        channels: [
          {
            $match: { subscriber: new mongoose.Types.ObjectId(req.user?._id) },
          },
        ],
        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const channels = result[0].channels;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channels, totalCount },
        "Channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
