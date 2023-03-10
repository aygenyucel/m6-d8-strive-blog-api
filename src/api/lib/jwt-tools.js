import jwt from "jsonwebtoken";

export const createAccessToken = (payload) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" }, //options
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, originalPayload) => {
        if (err) reject(err);
        else resolve(originalPayload);
      }
    );
  });
