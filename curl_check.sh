#!/bin/bash

BASE_URL="localhost:4000"

cookie="token=1"
while IFS= read -r line; do
    method=$(echo "$line" | awk '{print $1}')
    route=$(echo "$line" | awk '{print $2}')

    echo $method $route
    curl -X "$method" "$BASE_URL/$route"
    printf "\n"
    echo "$method $route with token=$token --cookie $cookie" 
    curl -X "$method" "$BASE_URL/$route" --cookie $cookie
    printf "\n\n"

done < routes.txt
