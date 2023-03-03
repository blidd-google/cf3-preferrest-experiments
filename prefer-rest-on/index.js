const functions = require("firebase-functions");
const functionsV2 = require("firebase-functions/v2");
const admin = require("firebase-admin");
const {
  getFirestore,
  initializeFirestore,
} = require("firebase-admin/firestore");

const app = admin.initializeApp();
initializeFirestore(app, {preferRest: true});

exports.preferrestonv1 = functions.https.onRequest(async (req, res) => {
  const text = "hello";
  await getFirestore()
      .collection("messages")
      .add({original: text});

  process.exit(1);
});

exports.preferrestonv2 = functionsV2.https.onRequest(
    {concurrency: 1, invoker: "public"},
    async (req, res) => {
      const text = "hello";
      await getFirestore()
          .collection("messages")
          .add({original: text});

      process.exit(1);
    });
