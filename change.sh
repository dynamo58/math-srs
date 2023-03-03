#!/usr/bin/zsh

npm run tauri build
rm ~/Desktop/math-srs
cp ./src-tauri/target/release/math-srs ~/Desktop/