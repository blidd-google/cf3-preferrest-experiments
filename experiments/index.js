import functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFunctions} from "firebase-admin/functions";
import {GoogleAuth} from "google-auth-library";

initializeApp();

let auth;
const origin = "https://cloudfunctions.googleapis.com";

/**
 * Get the URL of a cold start test function.
 *
 * @param {boolean} name the function's name
 * @param {string} version the function's version
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
async function getFunctionUrl(name, version, location="us-central1") {
  if (!auth) {
    auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
  }

  const projectId = await auth.getProjectId();
  const apiUrl = `${origin}/${version}/` +
      `projects/${projectId}/locations/${location}/functions/${name}`;

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
  const name = req.query.name;
  const version = req.query.version; // string: v1 or v2
  const delay = Number(req.query.delay ?? 0);

  const functionUrl = await getFunctionUrl(name, version);

  const queue = getFunctions().taskQueue("triggercoldstart");
  const enqueues = [];
  for (let i = 0; i <= sampleSize; i++) {
    enqueues.push(
        queue.enqueue(
            {
              id: `coldstart-${i}`,
              url: functionUrl,
              name,
            },
            {
              dispatchDeadlineSeconds: 60 * 5,
              scheduleDelaySeconds: i * delay,
            },
        ),
    );
  }
  await Promise.all(enqueues);
  res.send(
      `Experiment started for function at ${functionUrl}! ` +
      "Watch for the results in your function logs.",
  );
});

/* global BigInt */

// This task simulates a single HTTP request to the function we are testing
// for cold start performance.
const triggercoldstart = functions.tasks.taskQueue({
  rateLimits: {
    maxConcurrentDispatches: 100,
  },
}).onDispatch(async (data) => {
  const start = process.hrtime.bigint();
  const client = await new GoogleAuth().getIdTokenClient(data.url);
  try {
    await client.request({
      url: data.url,
    });
  } catch (err) {
    console.log("error expected");
  }
  const stop = process.hrtime.bigint();

  functions.logger.log(`Cold start experiment data for ${data.name}:`, {
    name: data.name,
    elapsedMs: Number((stop - start) / BigInt(1000000)),
  });
});

export {
  runexperiment,
  triggercoldstart,
};
