'use strict';
var gcloud = require('google-cloud');

var datastore = gcloud.datastore({
    projectId: process.env.GOOGLEPROJID,
    keyFilename: process.env.GOOGLESTORAGEKEY
});


var videoFilesMonitor = require('./videoFilesMonitor.js');
videoFilesMonitor.startMonitoring(datastore);

var currentReadings = require('./currentReadings.js').getInstance();
var doorOpenEventReceiver = require('./doorOpenEventReceiver.js');
doorOpenEventReceiver.monitor("amqp://mslgcpgp:n5Ya32JaLtoYt7Qu0uemu7SFNPpGw8T5@puma.rmq.cloudamqp.com/mslgcpgp", function (newReading, onSuceeded) {
    currentReadings.reportSensorReading(datastore, newReading, onSuceeded);
});