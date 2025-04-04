#!/bin/bash
# Script to run the debug login server

cd /var/www/app/odocs/odrs
export DEBUG_PORT=5002
node server/src/debug-login.js