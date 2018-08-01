'use strict';
var config = require('./config');
var gcloud = require('google-cloud');

var datastore = gcloud.datastore({
    projectId: process.env.GOOPROJID,
    keyFilename: process.env.KEYFILELOCATION
});


var videoFilesMonitor = require('./videoFilesMonitor.js');
videoFilesMonitor.startMonitoring(datastore);

var currentReadings = require('./currentReadings.js').getInstance();
var doorOpenEventReceiver = require('./doorOpenEventReceiver.js');
doorOpenEventReceiver.monitor("amqp://mslgcpgp:n5Ya32JaLtoYt7Qu0uemu7SFNPpGw8T5@puma.rmq.cloudamqp.com/mslgcpgp", function (newReading, onSuceeded) {
    currentReadings.reportSensorReading(datastore, newReading, onSuceeded);
});