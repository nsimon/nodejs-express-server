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
    #printf "Creating all directors\n"
    #printf "curl: PUT: /v1/directors.json\n"
    #printf "\n"
    #DIRECTORS_JSON="[{ \"name\": \"McDonagh\" }, { \"name\": \"Peele\" }, { \"name\": \"Quentin\" }, { \"name\": \"Reitman\" }, { \"name\": \"Scorsese\" }, { \"name\": \"Stokeley\" }]"
    #JSON_OUT="{ \"rc\": null, \"message\": null, \"data\": { \"directors\": $DIRECTORS_JSON }}"
    #printf "JSON_OUT ......... $JSON_OUT\n"
    #printf "\n"
    #curl --request PUT --header  "Content-Type: application/json" --data "${JSON_OUT}" http://localhost:8080/v1/directors.json
    #printf "\n"
    #printf "\n"
    #printf "***********************************************************************************\n"
    #printf "\n"

    printf "Creating a new director (folder only)\n"
    printf "curl: PUT: /v1/directors/Landis.json\n"
    printf "\n"
    JSON_OUT="{ \"rc\": null, \"message\": null, \"data\": { \"director\": \"Landis\" }}"
    printf "JSON_OUT ......... $JSON_OUT\n"
    printf "\n"
    curl --request PUT --header  "Content-Type: application/json" --data "${JSON_OUT}" http://localhost:8080/v1/directors/Landis.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"

    printf "Adding a new for a director\n"
    printf "curl: PUT: /v1/directors/Landis/movies.json\n"
    printf "\n"
    curl --request PUT \
         --header "Expect:" \
         --form "moviejpg=@movies_to_upload/Landis/animal_house_1978.jpg"  --form "moviejson=@movies_to_upload/Landis/animal_house_1978.json" \
         http://localhost:8080/v1/directors/Landis/movies.json
    printf "\n"
    printf "\n"
    printf "***********************************************************************************\n"
    printf "\n"
    }

restapi_posts ()
    {
    printf "Updating existing movies for a director\n"
    printf "curl: POST: /v1/directors/Quentin/movies.json\n"
    printf "\n"
    curl --request POST \
         --header "Expect:" \
         --form "moviejpg=@movies_to_upload/Quentin/Jackie_Brown_1997.jpg"   --form "moviejson=@movies_to_upload/Quentin/Jackie_Brown_1997.json" \
         --form "moviejpg=@movies_to_upload/Quentin/Kill_Bill_V1_2003.jpg"   --form "moviejson=@movies_to_upload/Quentin/Kill_Bill_V1_2003.json" \
         --form "moviejpg=@movies_to_upload/Quentin/Kill_Bill_V2_2004.jpg"   --form "moviejson=@movies_to_upload/Quentin/Kill_Bill_V2_2004.json" \
         --form "moviejpg=@movies_to_upload/Quentin/Pulp_Fiction_1994.jpg"   --form "moviejson=@movies_to_upload/Quentin/Pulp_Fiction_1994.json" \
         --form "moviejpg=@movies_to_upload/Quentin/Reservoir_Dogs_1992.jpg" --form "moviejson=@movies_to_upload/Quentin/Reservoir_Dogs_1992.json" \
         http://localhost:8080/v1/directors/Quentin/movies.json
    printf "\n"
    printf "\n"

    printf "Changing a director name (a folder name)\n"
    printf "curl: POST: /v1/directors/Quentin.json\n"
    POST_JSON="{ \"oldDirectorName\": \"Peale\", \"newDirectorName\": \"Peele\" }"
    printf "\n"
    curl --request POST \
         --header 'Content-Type: application/json' \
         --data "${POST_JSON}" \
         http://localhost:8080/v1/directors/Quentin.json
    printf "\n"
    printf "\n"
    }

restapi_deletes ()
    {
    printf "Deleting a director and all of their movies\n"
    printf "curl: DELETE: /v1/directors/Landis.json\n"
    printf "\n"
    DELETE_JSON="{ \"directorName\": \"Landis\" }"
    curl --request DELETE \
         --header 'Content-Type: application/json' \
         --data "$DELETE_JSON" \
         http://localhost:8080/v1/directors/Landis.json
    printf "\n"
    printf "\n"

#   printf "Deleting a movie under a director\n"
#   printf "curl: DELETE: /v1/directors/Landis/movies.json\n"
#   printf "\n"
#   curl --request DELETE --header 'Content-Type: application/json' --data "${JSON_OUT}" http://localhost:8080/v1/directors/Landis/movies.json
#   printf "\n"
#   printf "\n"
    }

###########
# main () #
###########

main ()
    {
    printf "tester.sh.\n"
    printf "\n"

    #browser_gets
    #restapi_gets
    restapi_puts
    #restapi_posts
    restapi_deletes

    printf "Done.\n"
    printf "\n"
    }

main

