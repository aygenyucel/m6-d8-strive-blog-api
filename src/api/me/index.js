import express from "express";
import basicAuthentication from "../lib/auth/basicAuth.js";
import BlogPostModel from "../blogPosts/model.js";
import meOnlyMiddleware from "../lib/auth/meOnly.js";

const meRouter = express.Router();

meRouter.get(
  "/stories",
  basicAuthentication,
  meOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorId = req.author._id.toString();
      const blogPosts = await BlogPostModel.find({ authors: authorId });
      res.send(blogPosts);
    } catch (error) {
      next(error);
    }
  }
);

export default meRouter;
