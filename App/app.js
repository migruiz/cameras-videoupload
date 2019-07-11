const { interval,Observable } = require('rxjs');
const { throttleTime,map } = require('rxjs/operators');
 
if (process.env.MQTTLOCAL==null)
    process.env.MQTTLOCAL='mqtt://localhost:1884'


'use strict';
var mqtt = require('./mqttCluster.js');
global.mtqqLocalPath = process.env.MQTTLOCAL;
global.videoSegmentTopic = 'videoSegmentTopic';

const videoFileStream = new Observable(async subscriber => {      
    var mqttCluster=await mqtt.getClusterAsync()   
    mqttCluster.subscribeData(global.videoSegmentTopic, function(content){
        subscriber.next(content)
    });
});
const filteredStream = videoFileStream.pipe(map(val => val.format.filename))
filteredStream.subscribe(val => console.log(JSON.stringify(val)));   
console.log("running");





