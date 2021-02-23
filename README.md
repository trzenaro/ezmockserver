TODO

Mount folder containing mockserver.json to "/app/mockserver"
```sh
docker run --rm \
  -v $(pwd)/mockserver:/app/mockserver \
  -p 3000:3000 \
  -p 3050:3050 \
  trzenaro/ezmockserver:0.0.2
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
    "recordingDirectory": "./proxy",
    "prefix": [
      { "path": "/path-one", "proxyPass": "https://server-one.com" },
      { "path": "/path-two", "proxyPass": "https://server-two.com" },
      { "path": "/path-three", "proxyPass": "https://server-three.com", "rewrite": "/" }
    ]
  }
}
```

sessionsDirectory -> relative to where the command was run
proxy.recordingDirectory -> relative to where the command was run