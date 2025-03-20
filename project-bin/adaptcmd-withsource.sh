#!/usr/bin/env bash
echo start chat for working on this.

exec chatgpt -m o3-mini -o reasoning_effort=high -ocf project-bin/exampleactions/chatgptpmcodev.cfg -ff *.html *.js Specification.md -- "check Specification.md and compare with the code in this directory and adapt the code to the specification. If you find any errors in the code, please fix them. If you find any errors in the specification, please report them. Take care to only make changes if necessary for this task. Write the files or changes into the directory instead printing them."
