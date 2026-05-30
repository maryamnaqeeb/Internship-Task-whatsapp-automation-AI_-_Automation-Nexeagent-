Project: WhatsApp Automation Bot

Packages used in this project:
1. whatsapp-web.js (For connecting and controlling WhatsApp via web scraping)
2. qrcode-terminal (For displaying the login QR Code directly in the terminal)
3. firebase-admin (For connecting and logging chat data into Firebase Firestore)
4. express (For future backend APIs and webhook scaling)

Note: firebase-key.json and session cache are ignored for security reasons.


npm install
How this works: This command reads your package.json file and automatically downloads all the required packages (whatsapp-web.js, firebase-admin, etc.) into the project folder.

Add Your Secret Firebase Key
Since your secret key was not uploaded to GitHub, you need to add it manually:

Copy your firebase-key.json file (using a USB drive, Google Drive, or email).

Paste it directly into the main project folder on the new computer.

That's it! Everything is ready. Now you can type node index.js in the terminal, scan the QR code, and your WhatsApp bot will start saving logs to Firebase just like before.
