
# Installaling and running

```sh
npm i -g ezmockserver

cd /path/to/my/mock/directory

# create the ezmockserver.json configuration file

ezmockserver
```
# Configuration file

```jsonc
// ezmockserver.json
{
  "sessionsDirectory": "./sessions",
  "api": { // one of httpPort|httpsPort must be provided
    "httpPort": 3050,
    "httpsPort": 3051,
  },
  "server": { // one of httpPort|httpsPort must be provided
    "httpPort": 3000,
    "httpsPort": 3001,
  },
  "proxy": { // optional
    "prefix": [
      { "path": "/path-one", "proxyPass": "https://server-one.com" },
      { "path": "/path-two", "proxyPass": "https://server-two.com" },
      { "path": "/path-three", "proxyPass": "https://server-three.com", "rewrite": "/" }
    ]
  },
  "defaultSession": { // optional
    "name": "my-session",
    "fileType": "content",
    "logRequest": true,
    "countMode": "COUNT_ALL",
    "groupResponsesByIp": true,
    "matchers": [ // optional
      {
        "name": "users-with-id-route",
        "method": "^GET$", // regex
        "url": "/users/\\d+" // regex
      },
      {
        "name": "any-other-routes",
        "method": "^(GET|POST|PUT|DELETE)$",
        "url": "/.*"
      }
    ]
  },
  "defaultMatchers": [
    {
      "name": "users-with-id-route",
      "method": "^GET$", // regex
      "url": "/users/\\d+" // regex
    },
    {
      "name": "any-other-routes",
      "method": "^(GET|POST|PUT|DELETE)$",
      "url": "/.*"
    }
  ]
}
```
## [Session schema:](#session-schema)

**name**: \
Session name to be activated. Required


**fileType**: [*script|content*]\
Set if mockserver should load "js" files or "content" files for response. Optional\
Default: **content**

If *script* is selected, then the file should have the following syntax:

```js
// my-mock.js
module.exports = {
  execute: (ctx) => {
    // do some logic here with request context
    return {
      status: 200,
      delay: 0, // delay in millis
      body: "response body here... it also can be a buffer",
      headers: {
        "custom-header-1":"custom-header-1-value",
        "set-cookie": [
          "cookie1=cookie1-value; domain=my-domain.com; path=/; Max-Age=3600; HttpOnly",
          "cookie2=cookie2-value; domain=my-domain.com; path=/; Max-Age=3600; HttpOnly"
        ]
      }
    }
  }
}
```

Mockserver will call *execute* function to any received request passing *ctx* variable as argument.
This configuration make sense when you want to simulate differente values and timings for the requested route.

**logRequest**:\
Set if a file should be created with all incoming request data. Optional\
Default: **true**
Output file: `<session-directory>/<session-name>/[<counter>.]<method>.<url>.req.json`\

Example:

```sh
curl --location --request GET 'localhost:3000/path/to/resource1'
curl --location --request POST 'localhost:3000/path/to/resource2'
curl --location --request DELETE 'localhost:3000/path/to/resource3'
```

The incoming requests will generate the following files:
```
./sessions/my-session/1.get.path-to-resource1.req.json
./sessions/my-session/2.post.path-to-resource2.req.json
./sessions/my-session/3.delete.path-to-resource3.req.json
```


**countMode**: [*NO_COUNT|COUNT_BY_REQUEST_URL|COUNT_ALL*]. Optional\
Set how mockserver will behave towards the counter on each request received.\
Default: **COUNT_ALL**

To explain better what these options means, let's suppose the mockserver receives the following requests in order:

```sh
curl --location --request GET 'localhost:3000/path/to/resource1'
curl --location --request GET 'localhost:3000/path/to/resource1'
curl --location --request GET 'localhost:3000/path/to/resource2'
curl --location --request GET 'localhost:3000/path/to/resource2'
curl --location --request GET 'localhost:3000/path/to/resource3'
curl --location --request GET 'localhost:3000/path/to/resource3'
```

When this parameter is set to **NO_COUNT**, the server will not increment any counter, and it will look to the following file prefix:
```
get.path-to-resource1
get.path-to-resource2
get.path-to-resource3
```

When this parameter is set to **COUNT_BY_REQUEST_URL**, the server will increment the counter grouping by their URLs and it will look to the following file prefix:
```
1.get.path-to-resource1
2.get.path-to-resource1
1.get.path-to-resource2
2.get.path-to-resource2
1.get.path-to-resource3
2.get.path-to-resource3
```

When this parameter is set to **COUNT_ALL**, the server will increment the counter at any request received and it will look to the following file prefix:
```
1.get.path-to-resource1
2.get.path-to-resource1
3.get.path-to-resource2
4.get.path-to-resource2
5.get.path-to-resource3
6.get.path-to-resource3
```

**groupResponsesByIp**:\
Set if mockserver will group counter (set in **countMode**) by incoming IP address. Optional\
Default: **true**

**matchers**:\
Matchers is an easy way of intercepting/responding to requests applying regex patterns on http method and url\
Optional\
default: **[]**

Any matcher should follow this object
```jsonc
{
  "name": "matcher-for-my-regex",
  "method": "(GET|POST)", // regex to apply to the http method
  "url": "/my/url/\\d+/regex/.*" // regex to apply to the path
}
```

If **matcher** is not provided, the server will use **defaultMatchers** from configuration file.



## Checkout examples [here](./examples).

## Starting a session

There are two ways to start a session
- Setting **defaultSession** at startup configuration file (*ezmockserver.json*)
- Through the [API server](#api-server)

If a file named *.config.json* is found at session directory, then the session will be merged with it. This file should follow [Session schema](#session-schema)

# [API Server](#api-server)

## Starting a session

```sh
# data-raw should follow Session schema
curl --location --request POST 'http://localhost:3050/sessions/current' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "my-session",
    "countMode": "NO_COUNT",
    "fileType": "script",
    "logRequest": false
  }'
```

## Uploading a session

```sh
# session.zip should be a zip file performed at session directory
curl --location --request POST 'http://localhost:3050/sessions' --form 'file=@"/path/to/my-session.zip"'
```

## Listing available sessions

```sh
curl --location --request GET 'http://localhost:3050/sessions'
```



# Running with Docker

Mount folder containing ezmockserver.json to "/ezmockserver"

```sh
docker run --rm \
  -v $(pwd)/ezmockserver:/ezmockserver \
  -p 3000:3000 \
  -p 3050:3050 \
  trzenaro/ezmockserver:latest
```

# HTTPS support

ezmockserver has a built-in self-signed certificate to respond to HTTPS connections for localhost

```sh
openssl req \
  -newkey rsa:4096 \
  -x509 \
  -sha256 \
  -days 3650 \
  -nodes \
  -out certs/localhost.crt \
  -keyout certs/localhost.key \
  -subj "/C=BR/ST=Sao Paulo/L=Sao Jose do Rio Preto/O=ezmockserver/OU=development/CN=localhost"
```
