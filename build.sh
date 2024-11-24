#!/bin/bash

PROJECT_NAME=$1
PROJECT_PATH=$2
DIST_PATH='./*'

if [[ -z $PROJECT_NAME || ! -d $PROJECT_PATH ]]; then
  echo "params empty"
  exit 1
fi

echo $PROJECT_NAME $PROJECT_PATH

if [[ $? != 0 || ! -d $DIST_PATH ]]; then
  echo "build failed, dist dir empty"
  exit 1
fi

PUBLIC_PATH=$PROJECT_PATH$PROJECT_NAME
echo "start moving" $DIST_PATH $PUBLIC_PATH

if [[ -d $PROJECT_PATH && $PROJECT_NAME ]]; then
  rm -rf $PUBLIC_PATH
fi

mv $DIST_PATH $PUBLIC_PATH
