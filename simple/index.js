const functions = require("firebase-functions");
const functionsV2 = require("firebase-functions/v2");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.simple = functions.https.onRequest((request, response) => {
  process.exit(1);
});

exports.simplev2 = functionsV2.https.onRequest(
    {concurrency: 1, invoker: "public"},
    (request, response) => {
      process.exit(1);
    });
