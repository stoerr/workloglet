# Example actions you can have triggered from the `chatgpt` script

The main script chatgpt from my [ChatGPT Tool suite](https://github.com/stoerr/chatGPTtools) 
can execute prompts using AI triggered actions or execute a chat where you
tell the AI to trigger actions. In this directory you have several actions that give the AI the possibility to 
list, read and write files to improve the application, taken from the toolsuite.

1. fetchurl.sh
   - Description: Fetches the text content of a given URL.

2. listfiles.sh
   - Description: Lists the contents of the given directory, either recursively or not.

3. readfile.sh
   - Description: Reads the contents of a given file from the current directory or below (truncated if larger than 10,000 bytes).

4. writefile.sh
   - Description: Overwrites the specified file with content from stdin.
