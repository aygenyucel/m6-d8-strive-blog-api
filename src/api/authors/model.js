import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["User", "Me"], default: "User" },
  },
  { timestamps: true }
);

//before saving the new author, we convert the password to hash and then save:
authorsSchema.pre("save", async function (next) {
  const currentAuthor = this;

  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;

    const hash = await bcrypt.hash(plainPW, 10);
    currentAuthor.password = hash;
  }
  next();
});

//when we get posts if we don't want to see some values we can change the default behaviour of .toJSON method
//instead of using projection for every endpoint that we want to apply
authorsSchema.methods.toJSON = function () {
  const authorDocument = this;

  const author = authorDocument.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  return author;
};

//creates new method for checkng Credentials for author login
//usage: await AuthorModel.checkCredentials("example@email.com", "1234pswrd")

authorsSchema.static("checkCredentials", async function (email, password) {
  const author = await this.findOne({ email });

  if (author) {
    const passwordMatch = await bcrypt.compare(password, author.password);

    if (passwordMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

authorsSchema.static("checkEmail", async function (email) {
  const author = await this.findOne({ email });
  if (author) {
    return email;
  } else {
    return null;
  }
});

export default model("Author", authorsSchema);
