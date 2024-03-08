
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

## Install fonts

If there are custom fonts, remember to install them in the target OS environment.

# Install and start BsPoolMakerAPI

Install:
>pip install flask
>pip install aiohttp

Run:
>python BsPoolMakerAPI/app.py
