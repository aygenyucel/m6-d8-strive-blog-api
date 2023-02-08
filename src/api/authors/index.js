import express from "express"; // 3RD PARTY MODULE (npm i express)
import fs from "fs"; //CORE MODULE
import { fileURLToPath } from "url"; // CORE MODULE
import { dirname, join } from "path"; //CORE MODULE

import uniqid from "uniqid"; // 3RD PARTY MODULE (npm i uniqid)
import { authorsJSONPath } from "../lib/fs-tools.js";
import createHttpError from "http-errors";
import AuthorsModel from "./model.js";
import { createAccessToken } from "../lib/jwt-tools.js";

const authorsRouter = express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId);

    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", async (req, res, next) => {
  const author = await AuthorsModel.findByIdAndUpdate(
    req.params.authorId,
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (author) {
    await author.save();
    res.send(author);
  } else {
    next(NotFound(`author with id ${req.params.authorId} not found!`));
  }
  try {
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    );

    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorsModel.checkCredentials(email, password);
    console.log("author", author);
    if (author) {
      const payload = { _id: author._id, role: author.role };

      const accessToken = await createAccessToken(payload);

      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const author = req.body;
    const email = await AuthorsModel.checkEmail(author.email);
    if (email) {
      next(createHttpError(409, "Author with that email already exist!"));
    } else {
      const newAuthor = new AuthorsModel(author);
      const { _id } = await newAuthor.save();
      const payload = { _id };
      const accessToken = await createAccessToken(payload);
      res.status(201).send({ accessToken });
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
