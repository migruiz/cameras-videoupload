var fs = require('mz/fs')
var Inotify = require('inotify').Inotify;
var inotify = new Inotify();
var await = require('asyncawait/await');
var async = require('asyncawait/async');

var moment = require('moment');
var doorOpenVideoExtractor = require('./doorOpenVideoExtractor.js');
var videosFolder = /videos/;

exports.startMonitoring = function (datastore) {
    inotify.addWatch({
        path: videosFolder,
        watch_for: Inotify.IN_ALL_EVENTS,
        callback: onNewFileGenerated
    });
    function onNewFileGenerated(event) {
      var mask = event.mask;
      if (mask & Inotify.IN_CLOSE_WRITE) {
          var fileName = event.name;
          var datetimestring = fileName.slice(0, -4);
          console.log("new snap");
          console.log(datetimestring);
          var epoch = moment.utc(datetimestring, "YYYY-MM-DD_HH-mm-ss").valueOf() / 1000;
          console.log(epoch);

          doorOpenVideoExtractor.extractVideos(epoch, datastore);

    }
}

}




