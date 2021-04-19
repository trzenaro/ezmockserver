const fs = require("fs");
const archiver = require("archiver");
const _ = require("lodash");

const fsPromises = fs.promises;

const createDirectoryIfNotExists = async (directory) => {
  try {
    await fsPromises.access(directory);
  } catch (error) {
    await fsPromises.mkdir(directory, { recursive: true });
  }
};

const createFiles = (files) => {
  return Promise.all(
    files.map((file) => {
      let data = file.data || "";
      if (!(data instanceof Buffer) && _.isObject(data)) {
        data = JSON.stringify(data, null, 2);
      }
      return fsPromises.writeFile(file.name, data);
    }),
  );
};

const deleteFile = async (file) => {
  await fsPromises.unlink(file);
};

const listSubdirectories = async (directory) => {
  const directoryItems = await fsPromises.readdir(directory, {
    withFileTypes: true,
  });
  return directoryItems.filter((directoryItem) => directoryItem.isDirectory()).map((directoryItem) => directoryItem.name);
};

const zipDirectory = (directory) => {
  const archive = archiver("zip");
  archive.directory(directory, false);
  archive.finalize();
  return archive;
};

module.exports = {
  createDirectoryIfNotExists,
  createFiles,
  deleteFile,
  listSubdirectories,
  zipDirectory,
};
