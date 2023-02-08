//creates middleware for endpoints that we want to apply autharization

import createHttpError from "http-errors";
import atob from "atob";
import AuthorsModel from "../../authors/model.js";

const basicAuthentication = async (req, res, next) => {
  console.log("req.header.authorization:", req.headers.authorization);

  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide credentials in the Authorization header!"
      )
    );
  } else {
    console.log(
      `Auth header-> req.headers.authorization.split(" ")[1] :`,
      req.headers.authorization.split(" ")[1]
    );
    const encodedCredentials = req.headers.authorization.split(" ")[1];

    const credentials = atob(encodedCredentials); //atob converts encodedCredentials into something like "exp@gmail.com:1234psw"

    console.log("credentials: ", credentials);

    const [email, password] = credentials.split(":");

    const author = await AuthorsModel.checkCredentials(email, password);

    console.log("***Author:", author);

    if (author) {
      req.author = author; //adding the current user to the req object is going to unlock a number of possibilites like
      //using some subsequent middlewares to check the role of the user for instance (Authorization)
      next();
    } else {
      next(createHttpError(401, "Credentials not ok!"));
    }
  }
};

export default basicAuthentication;
