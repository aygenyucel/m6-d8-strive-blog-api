import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const commentsSchema = new Schema(
  {
    comment: { type: String, required: true },
    user: { type: String, required: false },
    commentDate: { type: Date, required: false },
  },
  { timestamps: true }
);

const blogPostsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number },
      unit: { type: String },
    },
    content: { type: String },
    comments: [commentsSchema],
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    likes: [
      {
        authorId: {
          type: mongoose.Types.ObjectId,
          ref: "Author",
        },
      },
    ],
  },
  {
    timestamps: true, //for creating automatically createdAt & updatedAt fields
  }
);
export default model("BlogPost", blogPostsSchema);
//this model now automatically linked to the "blogPosts" collection
//if collection is not there, it will be created
