
# Compile and run (development)

>npm start

# Deploy

## Go to path:
>cd ~/discord-bot

## Compile:
>npx tsc

## Run (if using `forever` daemon):
>forever start compiled/index.js

## Stop:
>forever stop compiled/index.js


# Install and start BsPoolMakerAPI

Install:
>pip install flask
>pip install aiohttp

Run:
>python BsPoolMakerAPI/app.py
