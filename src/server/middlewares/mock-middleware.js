const { promises: fsPromises } = require("fs");
const path = require("path");
const axios = require("axios").default;
const config = require("../../config/config");
const { createDirectoryIfNotExists, createFiles } = require("../../utils/fs");
const session = require("../../shared/session");
const sleep = require("../../utils/sleep");

const SLASH_SEPARATOR = "-";
const { proxy } = config;

const mockMiddleware = async (ctx) => {
  const response = { status: 500, headers: {}, body: "", delay: 0 };

  if (session.name) {
    const { originalUrl } = ctx;
    const parsedUrl = originalUrl.substring(1).replace(/\//g, SLASH_SEPARATOR) || SLASH_SEPARATOR;

    if (!session.repeat) session.requestCounter++;

    let requestDirectory = session.proxy ? proxy.recordingDirectory : config.sessionsDirectory;
    requestDirectory = path.join(requestDirectory, session.name);
    await createDirectoryIfNotExists(requestDirectory);

    const filePrefix = path.join(
      requestDirectory,
      `${!session.repeat ? `${session.requestCounter}.` : ""}${ctx.method.toLocaleLowerCase()}.${parsedUrl}`,
    );
    const files = {
      request: `${filePrefix}.request.json`,
      js: `${filePrefix}.js`,
      options: `${filePrefix}.json`,
      content: `${filePrefix}.content`,
    };

    if (session.logRequest) await logRequest(ctx, files);

    try {
      if (session.proxy) {
        const proxyResponse = await handleProxyRequest(ctx, files);
        Object.assign(response, proxyResponse);
      } else {
        const mockResponse = await handleMockRequest(ctx, files);
        Object.assign(response, mockResponse);
      }
    } catch (error) {
      if (error.code === "ENOENT" || error.code == "MODULE_NOT_FOUND") {
        if (error.code === "ENOENT") {
          await createFiles([{ name: files.options }, { name: files.content }]);
        }

        if (error.code === "MODULE_NOT_FOUND") {
          await createFiles([{ name: files.js }]);
        }
      } else {
        throw error;
      }
    }
  }

  ctx.status = response.status;
  Object.entries(response.headers || {}).forEach(([header, headerValue]) => {
    ctx.set(header, headerValue);
  });
  ctx.body = response.body;
  if (response.delay) await sleep(response.delay);
};

const logRequest = async (ctx, files) => {
  const { request } = files;
  await fsPromises.writeFile(
    request,
    JSON.stringify(
      {
        date: new Date(),
        ip: ctx.request.ip,
        host: ctx.request.host,
        href: ctx.request.href,
        method: ctx.method,
        url: ctx.originalUrl,
        headers: ctx.headers,
        body: ctx.request.body,
      },
      null,
      2,
    ),
  );
};

const handleProxyRequest = async (ctx, files) => {
  const response = {};

  for (const route of proxy.prefix) {
    if (ctx.originalUrl.startsWith(route.path)) {
      const proxyHeaders = { ...ctx.headers };
      delete proxyHeaders.host;

      try {
        let url = ctx.originalUrl;
        if (route.rewrite) {
          url = url.replace(route.path, route.rewrite);
        }

        const timeStart = new Date();
        const axiosResponse = await axios.request({
          method: ctx.method,
          url: ctx.originalUrl,
          baseURL: route.proxyPass,
          headers: proxyHeaders,
          ...(ctx.body ? { data: ctx.body } : null),
          validateStatus: () => true,
        });
        const timeEnd = new Date();
        await Promise.all([
          createFiles([
            {
              name: files.options,
              data: {
                delay: timeEnd - timeStart,
                status: axiosResponse.status,
                headers: axiosResponse.headers,
              },
            },
            {
              name: files.content,
              data: axiosResponse.data,
            },
          ]),
        ]);

        response.status = axiosResponse.status;
        response.body = axiosResponse.data;
        response.headers = axiosResponse.headers;
      } catch (error) {
        console.log(error);
      }

      break;
    }
  }

  return response;
};

const handleMockRequest = async (ctx, files) => {
  const response = {};

  if (session.fileType == "js") {
    const jsFile = require(files.js);
    session.requiredFiles.push(files.js);
    Object.assign(response, jsFile.execute(ctx));
  } else {
    const [responseOptionsBuffer, responseDataBuffer] = await Promise.all([fsPromises.readFile(files.options), fsPromises.readFile(files.content)]);

    const responseOptions = JSON.parse(responseOptionsBuffer);
    Object.assign(response, responseOptions, { body: responseDataBuffer });
  }

  return response;
};

module.exports = mockMiddleware;
