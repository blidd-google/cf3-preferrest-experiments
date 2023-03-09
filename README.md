# Cloud Functions for Firebase - preferRest Cold Start Experiments

## Background

The Firebase Admin SDK recently introduced a `preferRest` option that can be set when initializing Firestore. While it's a simple setting, it comes with big benefits: Cloud Functions that initialize Firestore with the `preferRest` setting turned on will see significantly faster cold start times.

This repository contains code for running informal experiments on functions cold starts. See for yourself how the preferRest option will reduce cold start times for your functions that use Firestore!

## Instructions

1. Run `firebase deploy --only functions`. This will deploy:

- `runexperiment` - an HTTP function that kicks off experiments, given a few parameters that you specify via URL query params.
- `triggercoldstart` - this function is queued up by `runexperiment` and will measure and log the time it takes to run a function.
- `simple`/`simplev2` - basic HTTP functions to serve as a baseline for cold start numbers. `simple` is a 1st gen function, `simplev2` a 2nd gen function.
- `preferrestoffv1`/`preferrestoffv2` - HTTP functions that load and initialize a Firestore instance, with the `preferRest` option disabled.
- `preferrestonv1`/`preferrestonv2` - HTTP functions that load and initialize a Firestore instance, with the `preferRest` option enabled.

2. Send a HTTP GET request to `runexperiment`. You can find the URL of your function in the Functions dashboard of the Firebase console. The URL query parameters are as follows:

- `name` - the name of the function (`simple`, `preferrestoffv1`, etc.). Feel free to run the experiments on your own functions as well!
- `version` - `v1` to run the experiment on a 1st gen function, or `v2` for a 2nd gen function
- `sampleSize` - the number of times you want to trigger the function

3. Navigate to the Firebase console to view the logs for your `triggercoldstart` function. Data about each cold start measurement should be logged.

4. This repository includes a Jupyter Notebook compiling and displaying the results of my own preferRets cold start experiments in a couple of graphs. Download those log entries from the Log Explorer as csv file, then use my Jupyter Notebook as a template to analyze your own experiment's results!
