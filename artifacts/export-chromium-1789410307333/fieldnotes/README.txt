Paperbound exported flipbook

This folder is a read-only snapshot, not an editable project backup.
The index.html file is a complete single-file flipbook. Send that one file when you want the recipient to open the book directly; it opens in Chrome or Edge without Node, a terminal, or an internet connection.
The other files are included for ordinary static-server hosting. If your browser blocks local files, open a terminal in this folder and run the included dependency-free Node server:
node serve.mjs . 8080
Then open http://127.0.0.1:8080/ and press Ctrl+C to stop.
You can also serve the entire folder with any static server or static host.
External document links need a network only when you choose to follow them.
The original PDF is included only when selected during export.
