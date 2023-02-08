import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { verifyAccessToken } from "../jwt-tools.js";

export const JWTAuthorization = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      next(
        createHttpError(
          401,
          "Please provide Bearer Token in the authorization header!"
        )
      );
    } else {
      try {
        const accessToken = req.headers.authorization.replace("Bearer ", "");

        const payload = await verifyAccessToken(accessToken);

        req.author = { _id: payload._id, role: payload.role };
        next();
      } catch (err) {
        next(createHttpError(401, "Token is not valid!"));
      }
    }
  } catch (error) {
    next(error);
  }
};
