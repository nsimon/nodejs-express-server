#!/bin/bash

# Module ... tester.sh
# Desc ..... Test script to run client cURL calls to the nodejs/express server.

printf "tester.sh.\n"
printf "\n"

#######################
# BROWSER ROUTES: GET #
#######################

#printf "curl --silent --request GET http://localhost:8080/pages/home\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/pages/home
#printf "\n"

#printf "curl --silent --request GET http://localhost:8080/pages/director/Quentin\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/pages/director/Quentin
#printf "\n"

#printf "curl --silent --request GET http://localhost:8080/pages/director/Quentin/Pulp_Fiction_1994\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/pages/director/Quentin/Pulp_Fiction_1994
#printf "\n"

###################
# API ROUTES: GET #
###################

#printf "curl --silent --request GET http://localhost:8080/v1/directors.json\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors.json
#printf "\n"
#printf "\n"

#printf "curl --silent --request GET http://localhost:8080/v1/directors/Quentin.json\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors/Quentin.json
#printf "\n"
#printf "\n"

#printf "curl --silent --request GET http://localhost:8080/v1/directors/Quentin/movies/Pulp_Fiction_1994.json\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors/Quentin/movies/Pulp_Fiction_1994.json
#printf "\n"
#printf "\n"

# TODO NEXT:
printf "curl --silent --request GET http://localhost:8080/v1/directors/Quentin/movies.json\n"
printf "\n"
curl --silent --request GET http://localhost:8080/v1/directors/Quentin/movies.json
printf "\n"
printf "\n"

####################
# API ROUTES: TODO #
####################

#printf "=======================================================================\n"
#printf "03. curl --silent --request GET http://localhost:8080/v1/directors.json\n"
#printf "=======================================================================\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors.json
#printf "\n"
#sleep 1

#printf "====================================================================================================\n"
#printf "04. curl --silent --request GET http://localhost:8080/v1/directors.json?directors_from=New_York_City\n"
#printf "====================================================================================================\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors.json?directors_from=New_York_City
#printf "\n"
#sleep 1

#printf "====================================================================================\n"
#printf "05. curl --silent --request GET http://localhost:8080/v1/directors/Peele/movies.json\n"
#printf "====================================================================================\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors/Peele/movies.json
#printf "\n"
#sleep 1
#
#printf "========================================================================================================\n"
#printf "06. curl --silent --request GET http://localhost:8080/v1/directors/Peele/movies.json?page=1&page_size=25\n"
#printf "========================================================================================================\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors/Peele/movies.json?page=1&page_size=25
#printf "\n"
#sleep 1
#
#printf "================================================================================================\n"
#printf "07. curl --silent --request GET http://localhost:8080/v1/directors/Peele/movie/Get_Out_2018.json\n"
#printf "================================================================================================\n"
#printf "\n"
#curl --silent --request GET http://localhost:8080/v1/directors/Peele/movie/Get_Out_2018.json
#printf "\n"
#sleep 1
#
########
## PUT #
########
#
#printf "========================================================================================================================================================\n"
#printf "08. curl --silent --request PUT --header 'Content-Type: application/json' --data '{ \"updatedFrom\": \"England\" }' http://localhost:8080/v1/directors/Peele\n"
#printf "========================================================================================================================================================\n"
#printf "\n"
#curl --silent --request PUT --header 'Content-Type: application/json' --data '{ "updatedFrom": "England" }' http://localhost:8080/v1/directors/Peele
#printf "\n"
#printf "\n"
#sleep 1
#
#printf "==============================================================================================================================================================\n"
#printf "09. curl --silent --request PUT --header 'Content-Type: application/json' --data '{ \"updatedLength\": \"120\" }' http://localhost:8080/v1/directors/Peele/Us_2019\n"
#printf "==============================================================================================================================================================\n"
#printf "\n"
#curl --silent --request PUT --header 'Content-Type: application/json' --data '{ "updatedLength": "120" }' http://localhost:8080/v1/directors/Peele/Us_2019
#printf "\n"
#printf "\n"
#sleep 1
#
#########
## POST #
#########
#
#printf "=====================================================================================================================================================\n"
#printf "10. curl --silent --request POST --header 'Content-Type: application/json' --data '{ \"newName\": \"Mr. Bojangles\" }' http://localhost:8080/v1/directors\n"
#printf "=====================================================================================================================================================\n"
#printf "\n"
#curl --silent --request POST --header 'Content-Type: application/json' --data '{ "newName": "Mr. Bojangles" }' http://localhost:8080/v1/directors
#printf "\n"
#printf "\n"
#sleep 1
#
#printf "==========================================================================================================================================================\n"
#printf "11. curl --silent --request POST --header 'Content-Type: application/json' --data '{ \"newName\": \"My Fair Lady\" }' http://localhost:8080/v1/directors/Peele\n"
#printf "==========================================================================================================================================================\n"
#printf "\n"
#curl --silent --request POST --header 'Content-Type: application/json' --data '{ "newMovie": "My Fair Lady" }' http://localhost:8080/v1/directors/Peele
#printf "\n"
#printf "\n"
#sleep 1
#
###########
## DELETE #
###########
#
#printf "==================================================================================\n"
#printf "12. curl --silent --request DELETE http://localhost:8080/v1/directors/Peele/movies\n"
#printf "==================================================================================\n"
#printf "\n"
#curl --silent --request DELETE http://localhost:8080/v1/directors/Peele/movies
#printf "\n"
#printf "\n"
#sleep 1
#
#printf "=========================================================================================\n"
#printf "14. curl --silent --request DELETE http://localhost:8080/v1/directors/Peele/movie/Us_2019\n"
#printf "=========================================================================================\n"
#printf "\n"
#curl --silent --request DELETE http://localhost:8080/v1/directors/Peele/movie/Us_2019
#printf "\n"
#printf "\n"
#sleep 1

printf "===\n"
printf "end\n"
printf "===\n"
printf "\n"

