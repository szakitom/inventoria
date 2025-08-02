#!/bin/bash
# Shell script to build while ignoring TypeScript errors
export TSC_COMPILE_ON_ERROR=true
export VITE_TSCONFIG=tsconfig.prod.json
echo "Building without TypeScript error checking..."
npm run build:force
