const crypto = require("crypto");
const { promises: fsPromises } = require("fs");
const qs = require("qs");
const path = require("path");
const fetch = require("node-fetch");
const config = require("../../config/config");
const { createDirectoryIfNotExists, createFiles } = require("../../utils/fs");
const session = require("../../shared/session");
const sleep = require("../../utils/sleep");

const { proxy } = config;
const MAX_URL_FILE_LENGTH = 230;
const INVALID_FILENAME_CHARS = /<|>|:|"|\/|\\|\||\?|\*/g;

const buildFilenames = (fileSettings) => {
  let { directory, counter, method, url } = fileSettings;

  if (url.charAt(0) === "/") {
    url = url.substring(1);
  }

  if (url.length > MAX_URL_FILE_LENGTH) {
    url = crypto.createHash("md5").update(url).digest("hex");
  } else {
    url = url.replace(INVALID_FILENAME_CHARS, "-");
  }

  const filePrefix = path.join(directory, `${counter ? `${counter}.` : ""}${method.toLocaleLowerCase()}.${url}`);
  const files = {
    request: `${filePrefix}.req.json`,
    js: `${filePrefix}.js`,
    options: `${filePrefix}.json`,
    content: `${filePrefix}.content`,
  };

  return files;
};

const getRequestCounter = (ctx) => {
  const requestId = `${ctx.method}|${ctx.originalUrl}`;

  const ip = session.groupResponsesByIp ? ctx.request.ip : "0.0.0.0";
  if (!session._requestCounter[ip]) session._requestCounter[ip] = { total: 0, requests: {} };

  requestsAggregator = session._requestCounter[ip];

  session._requestCounter[ip].total++;
  if (session._requestCounter[ip].requests[requestId] == undefined) session._requestCounter[ip].requests[requestId] = 0;

  session._requestCounter[ip].requests[requestId]++;

  if (session.countMode === "NO_COUNT") return null;
  if (session.countMode === "COUNT_ALL") return session._requestCounter[ip].total;
  if (session.countMode === "COUNT_BY_REQUEST_URL") return session._requestCounter[ip].requests[requestId];
};

const mockMiddleware = async (ctx) => {
  const response = { status: 500, headers: {}, body: "", delay: 0 };

  if (session.name) {
    const { originalUrl } = ctx;

    const requestCounter = getRequestCounter(ctx);

    requestDirectory = path.join(config.sessionsDirectory, session.name);
    await createDirectoryIfNotExists(requestDirectory);

    const files = buildFilenames({
      counter: requestCounter,
      directory: requestDirectory,
      method: ctx.method,
      url: originalUrl,
    });

    if (session.logRequest) await logRequest(ctx, files);

    try {
      const mockResponse = await handleMockRequest(ctx, files);
      Object.assign(response, mockResponse);
    } catch (error) {
      if (error.code === "ENOENT" || error.code == "MODULE_NOT_FOUND") {
        const destinationResponse = await handleRequestAsProxy(ctx, files);
        Object.assign(response, destinationResponse);
      } else {
        throw error;
      }
    }
  } else {
    console.warn("No session started");
  }

  ctx.status = response.status;
  ctx.body = response.body;
  ctx.remove("Content-Length"); // remove content-length set by ctx.body to avoid conflicting with proxied headers;
  Object.entries(response.headers || {}).forEach(([header, headerValue]) => {
    ctx.set(header, headerValue);
  });
  ctx.remove("Content-Encoding"); // remove content-encoding since node-fetch already does the job

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

const handleRequestAsProxy = async (ctx, files) => {
  const response = {};
  try {
    const destinationRequest = {
      url: ctx.originalUrl,
      method: ctx.method,
      headers: {},
      body: ctx.method !== "GET" ? ctx.request.body : null,
    };

    const destinationHeaders = { ...ctx.headers };
    delete destinationHeaders.host;
    destinationRequest.headers = destinationHeaders;

    if (ctx.is("urlencoded")) {
      destinationRequest.body = qs.stringify(ctx.request.body);
    } else if (ctx.is("json")) {
      destinationRequest.body = JSON.stringify(ctx.request.body);
    }

    let performRequest = false;
    if (ctx.originalUrl.charAt(0) === "/") {
      if (proxy.prefix) {
        // It is a path based proxy request
        for (const route of proxy.prefix) {
          if (ctx.originalUrl.startsWith(route.path)) {
            let url = ctx.originalUrl;
            if (route.rewrite) {
              url = url.replace(route.path, route.rewrite);
            }

            destinationRequest.url = `${route.proxyPass}${ctx.url}`;
            performRequest = true;
            break;
          }
        }
      }
    } else {
      // It is a FQDN request
      performRequest = true;
    }

    if (!performRequest) throw new Error("No routes found to proxy the request");

    const destinationResponse = await requestDestinationServer(destinationRequest, files);
    response.status = destinationResponse.status;
    response.body = destinationResponse.body;
    response.headers = destinationResponse.headers;
  } catch (error) {
    console.log(error);
  }

  return response;
};

const handleMockRequest = async (ctx, files) => {
  const response = {};

  if (session.fileType == "script") {
    const jsFile = require(files.js);
    session._requiredFiles.push(files.js);
    Object.assign(response, jsFile.execute(ctx));
  } else {
    const [responseOptionsBuffer, responseDataBuffer] = await Promise.all([
      fsPromises.readFile(files.options),
      fsPromises.readFile(files.content),
    ]);

    const responseOptions = JSON.parse(responseOptionsBuffer);
    Object.assign(response, responseOptions, { body: responseDataBuffer });
  }

  return response;
};

const requestDestinationServer = async (destinationRequest, files) => {
  const { url, ...fetchRequest } = destinationRequest;

  const timeStart = new Date();
  const fetchResponse = await fetch(url, { ...fetchRequest, redirect: "manual" });
  const timeEnd = new Date();

  const response = {
    status: fetchResponse.status,
    headers: fetchResponse.headers.raw(),
    body: await fetchResponse.buffer(),
  };

  await Promise.all([
    createFiles([
      {
        name: files.options,
        data: {
          delay: timeEnd - timeStart,
          status: response.status,
          headers: response.headers,
        },
      },
      {
        name: files.content,
        data: response.body,
      },
    ]),
  ]);

  return response;
};

module.exports = mockMiddleware;
