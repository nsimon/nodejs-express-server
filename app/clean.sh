#!/bin/bash

# Module ... clean.sh
# Desc ..... Remove client and server temporary log files

printf "clean.sh.\n"
printf "\n"

# remove log files
rm _client.log > /dev/null 2>&1
rm _server.log > /dev/null 2>&1

