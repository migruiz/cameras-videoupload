const { interval,Observable } = require('rxjs');
const { throttleTime,map,groupBy,mergeMap,scan,filter } = require('rxjs/operators');
const path = require('path');




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


const videoStream = videoFileStream.pipe(
    map(v => (
        {
            fileName:v.format.filename,
            startTime:parseInt(path.basename(v.format.filename,'.mp4')),            
            length:Math.round(parseFloat(v.format.duration)), 
        }
    )),
    map(v => Object.assign({endTime:v.startTime+v.length}, v)),
    scan((acc, curr) => (
        {
            previous:acc.current,
            current:curr,  
        }
    ), {}),
    filter( v => v.previous!=null),
    map ( v => ({
        startTime:v.previous.startTime,
        endTime:v.current.endTime,
        filesToJoin: [v.previous.fileName, v.current.fileName]
    }))
)



const throttledReadingsStreams = sensorsReadingStream.pipe(
    groupBy(r => r.data, r => r),    
    mergeMap(s => s.pipe(throttleTime(4000))),        
)


videoStream.subscribe(val => {
    console.log(JSON.stringify(val));
    console.log(Math.round((new Date).getTime()/1000));
});   
throttledReadingsStreams.subscribe(reading => console.log(JSON.stringify(reading)));   
console.log("running");





