#!/bin/bash

cd $(dirname $0)

./sass-compile.sh
./stylelint.sh
