const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  getFirestore,
  initializeFirestore,
} = require("firebase-admin/firestore");

const app = admin.initializeApp();
initializeFirestore(app, {preferRest: true});
// initializeFirestore(app);

// const count = 0;

exports.v1preferrest = functions.https.onRequest(async (req, res) => {
  /*
  count++;
  if (count >= 3) {
    count = 0;
    process.exit(1);
    // throw new Error(
    //     "triggered on purpose to force shutdown and subsequent cold start");
  }
  */
  const text = "hello";
  await getFirestore()
      .collection("messages")
      .add({original: text});

  // throw new Error(
  //     "triggered on purpose to force shutdown and subsequent cold start");

  process.exit(1);

  // res.json({nInvocations: count});
});

exports.v1preferresttrue = functions.https.onRequest(async (req, res) => {
  const text = "hello";
  await getFirestore()
      .collection("messages")
      .add({original: text});

  process.exit(1);
});

// exports.v1nopreferrest = functions.https.onRequest(async (req, res) => {
// });
