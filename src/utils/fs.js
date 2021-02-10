const { promises: fsPromises } = require("fs");

const createDirectoryIfNotExists = async (directory) => {
  try {
    await fsPromises.access(directory);
  } catch (error) {
    await fsPromises.mkdir(directory, { recursive: true });
  }
};

const createEmptyFiles = (files) => {
  return Promise.all(files.map((file) => fsPromises.writeFile(file, "")));
};

module.exports = {
  createDirectoryIfNotExists,
  createEmptyFiles,
};
