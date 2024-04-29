import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const regesterUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  // validation - not empty etc
  // check if user is already exist
  // check for img and avtar
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from res
  // check for user creation
  // return res

  const { fullName, username, email, password } = req.body;
  // console.log("Fn", fullName);

  if ([fullName, username, email, password].some((i) => i?.trim() === "")) {
    throw new ApiError(400, "All fields should be required");
  }

  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (isUserExist) {
    throw new ApiError(409, "User is already exist");
  }

  //const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }


  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar img is req");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar img is req");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regester user");
  }

  return res.status(201).json(
   new ApiResponse(200,createdUser,"User created succesed")
  )

});

export default regesterUser;
