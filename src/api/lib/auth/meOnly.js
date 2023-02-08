import createHttpError from "http-errors";

const meOnlyMiddleware = (req, res, next) => {
  if (req.author.role === "Me") {
    next();
  } else {
    next(createHttpError(403, "Only me endpoint!"));
  }
};

export default meOnlyMiddleware;
