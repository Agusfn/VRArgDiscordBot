
# Compile and run (development)

## Compile in watch mode

>tsc -w

## Compile once + run app

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