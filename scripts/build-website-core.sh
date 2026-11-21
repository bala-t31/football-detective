#!/bin/sh
# Rebuilds website/assets/fd-core.js (the demo's copy of the game data and rules).
npx esbuild scripts/website-core.ts --bundle --minify --format=iife --target=es2019 --alias:@=./src --outfile=website/assets/fd-core.js
