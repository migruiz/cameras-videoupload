function CurrentReadings() {

    var lastReportedTimeStamp;

    this.reportSensorReading = function (datastore, reading, onSuceeded) {
        var msg = JSON.parse(reading);
        if (!msg.data.localeCompare("233945") == 0) {
            onSuceeded();
            return;
        }
        var newReadingTimeStamp = Math.round(parseInt(msg.fileName) / 1000);
        if (lastReportedTimeStamp == null) {
            handleNewDoorOpenEvent(datastore, newReadingTimeStamp, onSuceeded);
            return;
        }
        else {
            var delta = newReadingTimeStamp - lastReportedTimeStamp;
            if (Math.abs(delta) < 20) {
                onSuceeded();
                return;
            }
            else {
                handleNewDoorOpenEvent(datastore, newReadingTimeStamp, onSuceeded);
            }
        }

    }
    function handleNewDoorOpenEvent(datastore, timestamp, onSuceeded) {
        lastReportedTimeStamp = timestamp;
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
        
    }
}
exports.getInstance = function () {
    var model = new CurrentReadings();
    return model;
};