#!/usr/bin/env bash
echo start chat for working on this.

set -x
exec chatgpt -m o3-mini -o reasoning_effort=high -ff *.html *.js Specification.md -ocf project-bin/exampleactions/chatgptpmcodev.cfg "$@" "check Specification.md and compare with the retrieved files from this directory and adapt the code to the specification. If you find any errors in the code, please fix them. If you find any errors in the specification, please report them. Take care to only make changes if necessary for this task. Write the files or changes into this directory instead printing them."
