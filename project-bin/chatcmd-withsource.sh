#!/usr/bin/env bash
echo start chat for working on this, transmitting the files in this directory to the chatgpt.

exec chatgpt -m o3-mini -o reasoning_effort=high -ff *.html *.js *.css -ocf project-bin/exampleactions/chatgptpmcodev.cfg -cr "$@"
