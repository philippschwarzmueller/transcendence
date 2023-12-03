#!/bin/bash

BASE_URL="localhost:4000"

echo "Without token"
token=%242b%2410%240rbmVKdbF%2Fgw4UL2Dkb3VOi05ciqz.Ouo8mSvlTQykdHlZBYqc61K
while IFS= read -r line; do
    method=$(echo "$line" | awk '{print $1}')
    route=$(echo "$line" | awk '{print $2}')

    echo $method $route
    curl -X "$method" "$BASE_URL/$route"
    printf "\n"
    echo "$method $route with token=$token"
    curl -X "$method" "$BASE_URL/$route" --cookie "token=$token"
    printf "\n"
    echo "$method $route with token=1"
    curl -X "$method" "$BASE_URL/$route" --cookie "token=1"
    printf "\n\n"

done < routes.txt