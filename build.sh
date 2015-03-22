#!/bin/sh
mkdir ./lib
./node_modules/coffee-script/bin/coffee -bc -o ./lib ./src
./node_modules/LiveScript/bin/lsc -bc -o lib src
./node_modules/haxe/bin/haxe-cli.js -main Control -js ./lib/client/control.js -cp ./src/client
./node_modules/typescript/bin/tsc --outDir lib/client src/client/socket.ts
./node_modules/babel/bin/babel/index.js ./src/client/ --out-dir ./lib/client
cp ./src/client/*.html ./lib/client/