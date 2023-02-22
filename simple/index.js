const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.simple = functions.https.onRequest((request, response) => {
  process.exit(1);
});
