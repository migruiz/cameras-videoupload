const { interval,Observable } = require('rxjs');
const { throttleTime,map,groupBy,mergeMap } = require('rxjs/operators');
 

if (process.env.MQTTLOCAL==null)
    process.env.MQTTLOCAL='mqtt://localhost:1884'


'use strict';
var mqtt = require('./mqttCluster.js');
global.mtqqLocalPath = process.env.MQTTLOCAL;
global.videoSegmentTopic = 'videoSegmentTopic';
global.sensorReadingTopic = 'sensorReadingTopic';


const videoFileStream = new Observable(async subscriber => {  
    var mqttCluster=await mqtt.getClusterAsync()   
    mqttCluster.subscribeData(global.videoSegmentTopic, function(content){
        subscriber.next(content)
    });
});
const sensorsReadingStream = new Observable(async subscriber => {  
    var mqttCluster=await mqtt.getClusterAsync()   
    mqttCluster.subscribeData(global.sensorReadingTopic, function(content){
        subscriber.next(content)
    });
});


const filteredStream = videoFileStream.pipe(map(val => ({fileLocation :val.format.filename})))

const throttledReadingsStreams = sensorsReadingStream.pipe(
    groupBy(p => p.data, p => p),    
    mergeMap(s => s.pipe(throttleTime(4000))),        
)


filteredStream.subscribe(val => console.log(JSON.stringify(val)));   
throttledReadingsStreams.subscribe(reading => console.log(JSON.stringify(reading)));   
console.log("running");





