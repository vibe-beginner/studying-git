#!/bin/bash

cd $(dirname $0)/..

CSS_DIR="public/assets/css"
SCSS_DIR="public/assets/scss"

npx sass --watch --no-source-map "${SCSS_DIR}:${CSS_DIR}"
