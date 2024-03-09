import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";

const getAllTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const aggregateQuery = [
    {
      $facet: {
        tweets: [
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Tweet.aggregate(aggregateQuery);
  const tweets = result[0].tweets;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets, totalCount },
        "Tweets fetched successfully"
      )
    );
});

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(401, "Invlid Request");

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  const savedTweet = await Tweet.findById(tweet.id);
  if (!savedTweet) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedTweet, "Tweet created successfully"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) throw new ApiError(401, "Invalid request");

  const result = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $facet: {
        tweets: [
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const tweets = result[0].tweets;
  const totalCount =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets, totalCount },
        "Tweets fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId, updatedTweet } = req.body;

  if (!tweetId || !updatedTweet) throw new ApiError(401, "Invalid request");

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content: updatedTweet },
    },
    { new: true }
  );
  if (!tweet) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(401, "Invalid request");

  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
});

export { getAllTweets, createTweet, getUserTweet, updateTweet, deleteTweet };
