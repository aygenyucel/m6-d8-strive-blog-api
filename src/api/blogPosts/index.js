import express from "express";
import BlogPostsModel from "./model.js";
import createHttpError from "http-errors";
// import basicAuthentication from "../lib/auth/basicAuth.js";

const blogPostsRouter = express.Router();

blogPostsRouter.get("/", JWTAuthorization, async (req, res, next) => {
  try {
    const blogPosts = await BlogPostsModel.find();
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/", JWTAuthorization, async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostsModel(req.body);
    await newBlogPost.save();
    res.status(201).send(newBlogPost._id);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get(
  "/:blogPostId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(
        req.params.blogPostId
      ).populate({
        path: "authors",
        select: "firstName lastName",
      });

      if (blogPost) {
        res.send(blogPost);
      } else {
        next(NotFound(`Blog post with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.put(
  "/:blogPostId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
        req.params.blogPostId,
        req.body,
        { new: true, runValidators: true }
        //if you want to get back the newly updated record, you need to set new: true)
        //By default validation is off here --> set runValidators:true
      );

      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(NotFound(`Blog post with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);
blogPostsRouter.delete(
  "/:blogPostId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const deletedBlogPost = await BlogPostsModel.findByIdAndDelete(
        req.params.blogPostId
      );
      if (deletedBlogPost) {
        res.status(204).end();
      } else {
        next(NotFound(`Blog post with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//*********************************************************************************/

//adds a new comment for the specified blog post
blogPostsRouter.post(
  "/:blogPostId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const blogPost = BlogPostsModel.findById(req.params.blogPostId);

      if (blogPost) {
        const newComment = new CommentsModel(req.body);

        const newCommentToInsert = {
          ...newComment.toObject(),
          commentDate: new Date(),
        };
        console.log("newComment:", newComment);
        console.log("comment object to insert:", newCommentToInsert);

        const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
          req.params.blogPostId,
          { $push: { comments: newCommentToInsert } },
          { new: true, runValidators: true }
        );
        res.send(updatedBlogPost);
      } else {
        next(NotFound(`BlogPost with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//returns all the comments for the specified blog post
blogPostsRouter.get(
  "/:blogPostId/comments",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);

      if (blogPost) {
        res.send(blogPost.comments);
      } else {
        next(NotFound(`BlogPost with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//returns a single comment for the specified blog post
blogPostsRouter.get(
  "/:blogPostId/comments/:commentId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
      if (blogPost) {
        const comment = blogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (comment) {
          res.send(comment);
        } else {
          next(NotFound(`Comment with id ${req.params.commentId} not found!`));
        }
      } else {
        next(NotFound(`BlogPost with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//edit the comment belonging to the specified blog post
blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  JWTAuthorization,
  async (req, res, next) => {
    const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
    if (blogPost) {
      const index = blogPost.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        blogPost.comments[index] = {
          ...blogPost.comments[index].toObject(),
          ...req.body,
        };
      } else {
        next(NotFound(`Comment with id ${req.params.commentId} not found!`));
      }

      await blogPost.save();
      res.send(blogPost);
    } else {
      next(NotFound(`BlogPost with id ${req.params.blogPostId} not found!`));
    }
    try {
    } catch (error) {
      next(error);
    }
  }
);

//delete the comment belonging to the specified blog post
blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      );

      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(NotFound(`BlogPost with id ${req.params.blogPostId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.post(
  "/:blogPostId/like",
  JWTAuthorization,
  async (req, res, next) => {
    try {
      const { authorId } = req.body;

      const blogPost = await BlogPostsModel.findById(req.params.blogPostId);
      console.log("blogPost:", blogPost);
      if (!blogPost)
        return next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );

      const isAuthorThere = blogPost.likes.find(
        (like) => like.authorId === authorId
      );

      if (!isAuthorThere) {
        const modifiedBlogPost = await BlogPostsModel.findByIdAndUpdate(
          req.params.blogPostId,
          { $push: { likes: { authorId: authorId } } },
          { new: true, runValidator: true, upsert: true }
        );

        res.send(modifiedBlogPost);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
