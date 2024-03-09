import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) throw new ApiError(401, "Invalid request");

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  const savedPlaylist = await Playlist.findById(playlist.id);
  if (!savedPlaylist) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, savedPlaylist, "Playlist created successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(401, "Invalid request");

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user?._id });
  if (!playlists) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(401, "Invalid request");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.body;
  if (!videoId || !playlistId) throw new ApiError(401, "Invalid request");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (playlist.videos.includes(video.id)) {
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video already exists"));
  }

  const upatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: video.id },
    },
    { new: true }
  );
  if (!upatedPlaylist) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, upatedPlaylist, "Video added successfully"));
});

const removeVideo = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.body;
  if (!videoId || !playlistId) throw new ApiError(401, "Invalid request");

  // check if video exists in playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (!playlist.videos.includes(videoId))
    throw new ApiError(404, "Video not found");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist.id,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );
  if (!updatedPlaylist) throw new ApiError(500, "Something went wrong");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully"));
});

export {
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideo,
};
