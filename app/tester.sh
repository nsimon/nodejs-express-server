#!/bin/bash

# Module ... tester.sh
# Desc ..... Test script to run client cURL calls to the nodejs/express server.


browser_gets ()
    {
    printf "curl: GET: /pages/home\n"
    printf "\n"
    curl --request GET http://localhost:8080/pages/home
    printf "***********************************************************************************\n"
    printf "\n"

    printf "curl: GET: /pages/director/Quentin\n"
    printf "\n"
    curl --request GET http://localhost:8080/pages/director/Quentin
    printf "***********************************************************************************\n"
    printf "\n"

    printf "curl: GET: /pages/director/Quentin/Pulp_Fiction_1994\n"
    printf "\n"
    curl --request GET http://localhost:8080/pages/director/Quentin/Pulp_Fiction_1994
    printf "***********************************************************************************\n"
    printf "\n"
    }


restapi_gets ()
    {
    printf "curl: GET: /v1\n"
    printf "\n"
    curl --request GET http://localhost:8080/v1/
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"

    printf "curl: GET: /v2\n"
    printf "\n"
    curl --request GET http://localhost:8080/v2/
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"

    printf "curl: GET: /v1/directors.json\n"
    printf "\n"
    curl --request GET http://localhost:8080/v1/directors.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"

    printf "curl: GET: /v1/directors/Quentin.json\n"
    printf "\n"
    curl --request GET http://localhost:8080/v1/directors/Quentin.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    
    printf "curl: GET: /v1/directors/Quentin/movies/Pulp_Fiction_1994.json\n"
    printf "\n"
    curl --request GET http://localhost:8080/v1/directors/Quentin/movies/Pulp_Fiction_1994.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    
    printf "curl: GET: /v1/directors/Quentin/movies.json\n"
    printf "\n"
    curl --request GET http://localhost:8080/v1/directors/Quentin/movies.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    }

restapi_puts ()
    {
    DIRECTORS_JSON="[{ "name": "McDonagh" }, { "name": "Peele" }, { "name": "Quentin" }, { "name": "Reitman" }, { "name": "Scorsese" }]"

    JSON_OUT="{ "rc": null, "message": null, "data": { "directors": $DIRECTORS_JSON }}"

    printf "DIRECTORS_JSON ... $DIRECTORS_JSON\n"
    printf "JSON_OUT ......... $JSON_OUT\n"
    printf "\n"

    printf "curl: PUT: /v1/directors.json\n"
    printf "\n"
    #curl --request PUT --header  'Content-Type: application/json' --data '$JSON_OUT' http://localhost:8080/v1/directors.json
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    }

    
#########
## POST #
#########

#printf "=====================================================================================================================================================\n"
#printf "10. curl --request POST --header 'Content-Type: application/json' --data '{ \"newName\": \"Mr. Bojangles\" }' http://localhost:8080/v1/directors\n"
#printf "=====================================================================================================================================================\n"
#printf "\n"
#curl --request POST --header 'Content-Type: application/json' --data '{ "newName": "Mr. Bojangles" }' http://localhost:8080/v1/directors
#printf "\n"
#printf "\n"
#sleep 1

#printf "==========================================================================================================================================================\n"
#printf "11. curl --request POST --header 'Content-Type: application/json' --data '{ \"newName\": \"My Fair Lady\" }' http://localhost:8080/v1/directors/Peele\n"
#printf "==========================================================================================================================================================\n"
#printf "\n"
#curl --request POST --header 'Content-Type: application/json' --data '{ "newMovie": "My Fair Lady" }' http://localhost:8080/v1/directors/Peele
#printf "\n"
#printf "\n"
#sleep 1

###########
## DELETE #
###########

#printf "==================================================================================\n"
#printf "12. curl --request DELETE http://localhost:8080/v1/directors/Peele/movies\n"
#printf "==================================================================================\n"
#printf "\n"
#curl --request DELETE http://localhost:8080/v1/directors/Peele/movies
#printf "\n"
#printf "\n"
#sleep 1

#printf "=========================================================================================\n"
#printf "14. curl --request DELETE http://localhost:8080/v1/directors/Peele/movie/Us_2019\n"
#printf "=========================================================================================\n"
#printf "\n"
#curl --request DELETE http://localhost:8080/v1/directors/Peele/movie/Us_2019
#printf "\n"
#printf "\n"
#sleep 1


main ()
    {
    printf "tester.sh.\n"
    printf "\n"

    browser_gets
    restapi_gets
    restapi_puts

    printf "Done.\n"
    printf "\n"
    }

main

