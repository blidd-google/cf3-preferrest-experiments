import functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFunctions} from "firebase-admin/functions";
import {GoogleAuth} from "google-auth-library";
import fetch from "node-fetch";

initializeApp();

let auth;
const origin = "https://cloudfunctions.googleapis.com";

/**
 * Get the URL of a cold start test function.
 *
 * @param {boolean} preferRest the function's name
 * @param {string} version the function's name
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
async function getFunctionUrl(preferRest, version, location="us-central1") {
  if (!auth) {
    auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
  }

  const projectId = await auth.getProjectId();
  const name = preferRest ? "preferreston" : "preferrestoff";
  const apiUrl = `${origin}/${version}/` +
      `projects/${projectId}/locations/${location}/functions/${name}${version}`;

  const client = await auth.getClient();
  const res = await client.request({url: apiUrl});

  if (version === "v1") {
    return res.data.httpsTrigger.url;
  } else {
    return res.data.serviceConfig.uri;
  }
}

// This HTTPS function triggers the cold start benchmarking experiment.
const runexperiment = functions.https.onRequest(async (req, res) => {
  const sampleSize = req.query.sampleSize; // number
  const preferRest = req.query.preferRest === "true"; // "true" or "false"
  const version = req.query.version; // string: v1 or v2

  const functionUrl = await getFunctionUrl(preferRest, version);

  const queue = getFunctions().taskQueue("triggercoldstart");
  const enqueues = [];
  for (let i = 0; i <= sampleSize; i++) {
    enqueues.push(
        queue.enqueue(
            {
              id: `coldstart-${i}`,
              url: functionUrl,
            },
            {dispatchDeadlineSeconds: 60 * 5},
        ),
    );
  }
  await Promise.all(enqueues);
  res.send(
      `Experiment started for function at ${functionUrl}! ` +
      "Watch for the results in your function logs.",
  );
});


// const testgeturl = functions.https.onRequest(async (req, res) => {
//   const preferRest = req.query.preferRest === "true"; // boolean
//   const version = req.query.version; // string: v1 or v2
//   functions.logger.debug(`preferRest: ${preferRest}, version: ${version}`);

//   const url = await getFunctionUrl(preferRest, version);
//   res.send({url, message: "hello"});
// });

// This task simulates a single HTTP request to the function we are testing
// for cold start performance.
const triggercoldstart = functions.tasks.taskQueue({
  rateLimits: {
    maxConcurrentDispatches: 100,
  },
}).onDispatch(async (data) => {
  // We don't care about the response. We know it's going to crash
  functions.logger.debug(`fetching from url ${data.url}`);
  await fetch(data.url);
});

export {
  runexperiment,
  triggercoldstart,
};
