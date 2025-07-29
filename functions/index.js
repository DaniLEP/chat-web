{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "main": "index.js",
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-admin": "^11.10.1",
    "firebase-functions": "^4.4.1"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-config-google": "^0.14.0"
  },
  "private": true
}
