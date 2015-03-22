#!/bin/sh
mkdir ./lib
./node_modules/coffee-script/bin/coffee -bc -o ./lib ./src
./node_modules/LiveScript/bin/lsc -bc -o lib src
./node_modules/haxe/bin/haxe-cli.js -main Control -js ./lib/client/control.js -cp ./src/client
./node_modules/typescript/bin/tsc --outDir lib/client src/client/socket.ts
cat ./node_modules/babel/browser-polyfill.js > ./lib/client/api.js
./node_modules/babel/bin/babel/index.js ./src/client/api.es6 >> ./lib/client/api.js
cp ./src/client/*.html ./lib/client/