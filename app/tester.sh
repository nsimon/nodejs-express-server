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
    #DIRECTORS_JSON="[{ \"name\": \"McDonagh\" }, { \"name\": \"Peele\" }, { \"name\": \"Quentin\" }, { \"name\": \"Reitman\" }, { \"name\": \"Scorsese\" }, { \"name\": \"Stokeley\" }]"
    #JSON_OUT="{ \"rc\": null, \"message\": null, \"data\": { \"directors\": $DIRECTORS_JSON }}"
    #printf "JSON_OUT ......... $JSON_OUT\n"
    #printf "\n"
    #printf "curl: PUT: /v1/directors.json\n"
    #printf "\n"
    #curl --request PUT --header  "Content-Type: application/json" --data "${JSON_OUT}" http://localhost:8080/v1/directors.json
    #printf "\n"
    #printf "\n"
    #printf "***********************************************************************************\n"
    #printf "\n"

    // {"rc":0,"message":"",
    //  "data":{"director_data":{"director":"Quentin",
    //  "movies":[{"moviename":"Jackie_Brown_1997",
    //             "moviejpg":"Jackie_Brown_1997.jpg",
    //             "moviejson":"Jackie_Brown_1997.json"},
    //            {"moviename":"Kill_Bill_V1_2003",
    //             "moviejpg":"Kill_Bill_V1_2003.jpg",
    //             "moviejson":"Kill_Bill_V1_2003.json"},
    //            {"moviename":"Kill_Bill_V2_2004",
    //             "moviejpg":"Kill_Bill_V2_2004.jpg",
    //             "moviejson":"Kill_Bill_V2_2004.json"},
    //            {"moviename":"Pulp_Fiction_1994",
    //             "moviejpg":"Pulp_Fiction_1994.jpg",
    //             "moviejson":"Pulp_Fiction_1994.json"},
    //            {"moviename":"Reservoir_Dogs_1992",
    //             "moviejpg":"Reservoir_Dogs_1992.jpg",
    //             "moviejson":"Reservoir_Dogs_1992.json"}]}}}

    JSON_OUT="{ \"rc\": null, \"message\": null, \"data\": { \"new_director\": \"Ephron\" }}"
    printf "JSON_OUT ......... $JSON_OUT\n"
    printf "\n"
    printf "curl: PUT: /v1/directors/Ephron.json\n"
    printf "\n"
    curl --request PUT --header  "Content-Type: application/json" --data "${JSON_OUT}" http://localhost:8080/v1/Ephron.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    }

restapi_posts ()
    {
    #printf "curl: POST: /v1/directors/Quentin.json
    #printf "\n"
    #curl --request POST --header 'Content-Type: application/json' --data "${JSON_OUT}" http://localhost:8080/v1/directors/Quentin.json
    #printf "\n"
    #printf "\n"

    #printf "curl: POST: /v1/directors/Quentin/movies.json
    #printf "\n"
    #curl --request POST --header 'Content-Type: application/json' --data "${JSON_OUT}" http://localhost:8080/v1/directors/Quentin/movies.json
    #printf "\n"
    printf "\n"
    }

restapi_deletes ()
    {
    #printf "curl: DELETE: /v1/directors/Quentin.json
    #printf "\n"
    #curl --request DELETE --header 'Content-Type: application/json' --data "${JSON_OUT}" http://localhost:8080/v1/directors/Quentin.json
    #printf "\n"
    #printf "\n"

    #printf "curl: DELETE: /v1/directors/Quentin/movies.json
    #printf "\n"
    #curl --request DELETE --header 'Content-Type: application/json' --data "${JSON_OUT}" http://localhost:8080/v1/directors/Quentin/movies.json
    #printf "\n"
    printf "\n"
    }

###########
# main () #
###########

main ()
    {
    printf "tester.sh.\n"
    printf "\n"

    #browser_gets
    restapi_gets
    #restapi_puts
    #restapi_posts
    #restapi_deletes

    printf "Done.\n"
    printf "\n"
    }

main

