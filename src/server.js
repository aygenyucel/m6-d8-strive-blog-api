import express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import filesRouter from "./api/files/index.js";
import mongoose from "mongoose";
import meRouter from "./api/me/index.js";

const server = express();
// server waits for request

const port = process.env.PORT;

// ************************* MIDDLEWARES ****************************
//order matters
//global middlewares needs to be displaying before endpoints
const loggerMiddleWare = (req, res, next) => {
  // console.log("req.header:", req.headers);
  console.log(
    `Request method ${req.method} -- url ${req.url} -- ${new Date()}`
  );
  // console.log("req.user:", req.user);

  // req.user = "Riccardo";
  // console.log("req.user:", req.user);
  // console.log("xxxxxxxxxx", req);
  next(); //gives the control to whom is coming next (either another middleware or route handler)
};

// const policeOfficerMiddleware = (req, res, next) => {
//   console.log("Current user:", req.user);
//   if (req.user === "Riccardo") {
//     res.status(403).send({ message: "Riccardos are not allowed" });
//   } else {
//     next();
//   }
// };

server.use(loggerMiddleWare);

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (origin, corsNext) => {
      // console.log("ORIGIN: ", origin);

      if (!origin || whitelist.indexOf(origin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Cors Error! Your origin ${origin} is not in the list!`
          )
        );
      }
    },
  })
);
// If you do not add this line here BEFORE the endpoints, all req.body will be UNDEFINED
server.use(express.json());

// ************************** ENDPOINTS *****************************
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/files", filesRouter);
server.use("/me", meRouter);

// ************************** ERROR HANDLERS ************************
server.use(notFoundHandler); //404
server.use(badRequestHandler);
server.use(genericErrorHandler);

// **************************************************

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("Server is running on port:", port);
  });
});
