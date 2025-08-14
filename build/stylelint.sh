#!/bin/bash

cd $(dirname $0)/..

npx stylelint "public/assets/css/**/*.css"
