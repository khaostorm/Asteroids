#!/bin/bash

mkdir ./build/

yarn install
yarn tsc
cp -r ./node_modules/ ./build/node_modules

