TODO

Mount folder containing ezmockserver.json to "/ezmockserver"

```sh
docker run --rm \
  -v $(pwd)/ezmockserver:/ezmockserver \
  -p 3000:3000 \
  -p 3050:3050 \
  trzenaro/ezmockserver:latest
```


mockserver.json
```json
{
  "sessionsDirectory": "./sessions",
  "api": {
    "port": 3050
  },
  "server": {
    "port": 3000
  },
  "proxy": {
    "prefix": [
      { "path": "/path-one", "proxyPass": "https://server-one.com" },
      { "path": "/path-two", "proxyPass": "https://server-two.com" },
      { "path": "/path-three", "proxyPass": "https://server-three.com", "rewrite": "/" }
    ]
  }
}
```

Activate session:
```sh
curl --location --request POST 'http://localhost:3050/sessions/current' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name":"session-name",
    "fileType": "content",
    "logRequest": true,
    "repeat":true,
    "groupResponsesByIp": true
}'
```

**name**: session name to be activated\
**fileType**: [*script|content*] - set if mockserver should load "js" files or "content" files for response\
  default: content\
**logRequest**: set if a file should be created with request information\
  default: true\
**repeat**: set if mockserver will increment a counter on each request or will write always to the same file\
  default: false\
**groupResponsesByIp**: set if mockserver will group counter by IP address\
  default: false

