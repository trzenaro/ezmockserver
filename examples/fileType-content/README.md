```sh
curl --location --request GET 'localhost:3000/path/to/resource1'
curl --location --request POST 'localhost:3000/path/to/resource2' --header 'Content-Type: application/json' --data-raw '{ "foo":"bar" }'
curl --location --request DELETE 'localhost:3000/path/to/resource3' --header 'Content-Type: application/json' --data-raw '{ "foo":"bar" }'
```