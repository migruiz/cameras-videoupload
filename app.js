'use strict';
var config = require('./config');
var gcloud = require('google-cloud');

var datastore = gcloud.datastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
});


var timestamp=434234423;
const taskKey = datastore.key(['DoorOpenEvent',timestamp]);
const entity = {
    key: taskKey,
    data: {
        timestamp: timestamp,
        date: new Date(1000 * timestamp),
        extractedVideo:false,
        emailSent:false
    },
};

datastore.insert(entity).then(() => {
    console.log(" NEW EVENT '%s'", timestamp);
    onSuceeded();
});




return;

var videoFilesMonitor = require('./videoFilesMonitor.js');
videoFilesMonitor.startMonitoring(datastore);

var currentReadings = require('./currentReadings.js').getInstance();
var doorOpenEventReceiver = require('./doorOpenEventReceiver.js');
doorOpenEventReceiver.monitor("amqp://mslgcpgp:n5Ya32JaLtoYt7Qu0uemu7SFNPpGw8T5@puma.rmq.cloudamqp.com/mslgcpgp", function (newReading, onSuceeded) {
    currentReadings.reportSensorReading(datastore, newReading, onSuceeded);
});