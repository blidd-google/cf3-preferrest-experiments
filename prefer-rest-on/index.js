const functions = require("firebase-functions");
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
