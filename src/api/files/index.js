import express from "express";
import { pipeline } from "stream";
import {
  getAuthorsJsonReadableStream,
  getBlogPostsJsonReadableStream,
} from "../lib/fs-tools.js";
import { getPdfReadableStream } from "../lib/pdf-tools.js";

import json2csv from "json2csv";

const filesRouter = express.Router();

filesRouter.get("/pdf", (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=blogPost.pdf");

  const source = getPdfReadableStream();
  const destination = res;
  pipeline(source, destination, (err) => {
    console.log(err);
  });
});

filesRouter.get("/blogPostsCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogPosts.csv");
    const source = getBlogPostsJsonReadableStream();
    const transform = new json2csv.Transform();
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/authorsCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    const source = getAuthorsJsonReadableStream();
    console.log(source);
    const transform = new json2csv.Transform();
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default filesRouter;
