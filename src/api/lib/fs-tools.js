import fs from "fs-extra";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

export const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");
export const authorsJSONPath = join(dataFolderPath, "authors.json");

export const getAuthors = fs.readJSON(authorsJSONPath);

export const getBlogPostsJsonReadableStream = () => {
  return fs.createReadStream(blogPostsJSONPath);
};

export const getAuthorsJsonReadableStream = () => {
  return fs.createReadStream(authorsJSONPath);
};
