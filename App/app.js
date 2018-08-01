'use strict';
var gcloud = require('google-cloud');

const fs = require('fs');
let dataStoreSecretsJson = fs.readFileSync(process.env.GOOGLESTORAGEKEY);
let dataStoreSecrets = JSON.parse(clientSecretsjson); 

var datastore = gcloud.datastore({
    projectId: dataStoreSecrets.project_id,
    keyFilename: process.env.GOOGLESTORAGEKEY
});


var videoFilesMonitor = require('./videoFilesMonitor.js');
videoFilesMonitor.startMonitoring(datastore);

var currentReadings = require('./currentReadings.js').getInstance();
var doorOpenEventReceiver = require('./doorOpenEventReceiver.js');
doorOpenEventReceiver.monitor("amqp://mslgcpgp:n5Ya32JaLtoYt7Qu0uemu7SFNPpGw8T5@puma.rmq.cloudamqp.com/mslgcpgp", function (newReading, onSuceeded) {
    currentReadings.reportSensorReading(datastore, newReading, onSuceeded);
});