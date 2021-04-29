```sh
curl --location --request GET 'http://localhost:3000/route1'
curl --location --request GET 'http://localhost:3000/route1'
curl --location --request GET 'http://localhost:3000/route2'
curl --location --request GET 'http://localhost:3000/route3'

# activate "my-in-session-config-two" session
# session data will be merged with sessions/my-in-session-config-two/.config.json
curl --location --request POST 'http://localhost:3050/sessions/current' --header 'Content-Type: application/json' --data-raw '{ "name": "my-in-session-config-two" }'

curl --location --request GET 'http://localhost:3000/resource1/id1'
curl --location --request GET 'http://localhost:3000/resource1/id100'
curl --location --request GET 'http://localhost:3000/resource2/id1000'
curl --location --request GET 'http://localhost:3000/resource3/id10000'
```