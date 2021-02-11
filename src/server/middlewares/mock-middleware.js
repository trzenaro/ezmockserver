const { promises: fsPromises } = require("fs");
const path = require("path");
const { sessionsDirectory } = require("../../config/config");
const { createDirectoryIfNotExists, createEmptyFiles } = require("../../utils/fs");
const session = require("../../shared/session");
const sleep = require("../../utils/sleep");

const SLASH_SEPARATOR = "-";

const mockMiddleware = async (ctx) => {
  const { originalUrl } = ctx;
  let parsedUrl = originalUrl.substring(1).replace(/\//g, SLASH_SEPARATOR) || SLASH_SEPARATOR;

  const requestDirectory = path.join(sessionsDirectory, session.name, parsedUrl, ctx.method.toLocaleLowerCase());

  if (session.sticky) {
    session.requests[requestDirectory] = 0;
  } else {
    if (requestDirectory in session.requests) {
      session.requests[requestDirectory]++;
    } else {
      session.requests[requestDirectory] = 0;
    }
  }

  const requestCounter = session.requests[requestDirectory];

  const response = { status: 500, headers: {}, body: "", delay: 0 };

  const filePrefix = path.join(requestDirectory, requestCounter.toString());
  const jsFilename = `${filePrefix}.js`;
  const responseOptionsFile = `${filePrefix}.json`;
  const responseDataFile = `${filePrefix}.content`;

  if (session.logRequest) await logRequest(ctx, { requestDirectory, filePrefix });

  try {
    if (session.fileType == "js") {
      const jsFile = require(jsFilename);
      session.requiredFiles.push(jsFilename);
      Object.assign(response, jsFile.execute(ctx));
    } else {
      const [responseOptionsBuffer, responseDataBuffer] = await Promise.all([
        fsPromises.readFile(responseOptionsFile),
        fsPromises.readFile(responseDataFile),
      ]);

      const responseOptions = JSON.parse(responseOptionsBuffer);
      Object.assign(response, responseOptions, { body: responseDataBuffer });
    }
  } catch (error) {
    if (error.code === "ENOENT" || error.code == "MODULE_NOT_FOUND") {
      await createDirectoryIfNotExists(requestDirectory);
      if (error.code === "ENOENT") {
        await createEmptyFiles([responseOptionsFile, responseDataFile]);
      }

      if (error.code === "MODULE_NOT_FOUND") {
        await createEmptyFiles([jsFilename]);
      }
    } else {
      throw error;
    }
  }

  ctx.status = response.status;
  Object.entries(response.headers || {}).forEach(([header, headerValue]) => {
    ctx.set(header, headerValue);
  });
  ctx.body = response.body;
  if (response.delay) await sleep(response.delay);
};

const logRequest = async (ctx, { requestDirectory, filePrefix }) => {
  await createDirectoryIfNotExists(requestDirectory);
  const requestFilePath = `${filePrefix}-request.json`;
  await fsPromises.writeFile(
    requestFilePath,
    JSON.stringify({
      href: ctx.request.href,
      host: ctx.request.host,
      ip: ctx.request.ip,
      url: ctx.originalUrl,
      headers: ctx.headers,
      body: ctx.request.body,
    }, null, 2),
  );
};

module.exports = mockMiddleware;
