var fs = require('mz/fs');
var moment = require('moment');
var execP = require('child_process');
var youtubeAPI = require('./youtubeUploader.js');
var emailSender = require('./emailSender.js');
exports.extractVideos = function (ignoreVideosAfterTimestamp, datastore) {

    const ffmpegFolderLocation = process.env.FFMPEGPATH;
    const cameraVideosFolderLocation = process.env.VIDEOSPATH;
    const videoLenght = 30;
    const query = datastore
        .createQuery('DoorOpenEvent')
        .filter('extractedVideo', '=', false);

    datastore.runQuery(query).then(results => {
        const doorEvents = results[0];
        doorEvents.forEach(doorEvent => {
            getFilesToMerge(ignoreVideosAfterTimestamp,doorEvent, function (files) {
                processffmpeg(doorEvent, files);
            });
        });
    });
    function markDone(doorEvent,youtubeId) {
    const transaction = datastore.transaction();
        transaction
            .run()
            .then(() => {
                doorEvent.youtubeId = youtubeId;
                doorEvent.extractedVideo=true;
                transaction.save({
                    key: doorEvent[datastore.KEY],
                    data: doorEvent,
                });
                return transaction.commit();
            })
            .then(() => {
                // The transaction completed successfully.
                console.log('updated successfully.');
            })
            .catch(() => transaction.rollback());
    }



    function processffmpeg(doorEvent, files) {

        var firstVideoStartTime = files[0].timestamp;
        var delta = doorEvent.timestamp - firstVideoStartTime;
        var startPosition = delta - videoLenght / 2;
        var videosTojoinContent = files.map(v => 'file ' + cameraVideosFolderLocation + v.file).join('\r\n');
        var videosToJoinFilePath = cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '.txt';
        var ffmpegCommandJoin = ffmpegFolderLocation + 'ffmpeg -y -f concat -safe 0 -i ' + videosToJoinFilePath + ' -c copy ' + cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '.mp4';
        var ffmpegCommandExtract = ffmpegFolderLocation + 'ffmpeg -y -ss 00:00:' + ("0" + startPosition).slice(-2) + ' -i ' + cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '.mp4  -t 00:00:' + ("0" + videoLenght).slice(-2) + ' -vcodec copy -acodec copy ' + cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '_trim.mp4';

        fs.writeFile(videosToJoinFilePath, videosTojoinContent, function (err) {
            if (err) throw err;
            execP.execSync(ffmpegCommandJoin, { stdio: [0, 1, 2] });
            execP.execSync(ffmpegCommandExtract, { stdio: [0, 1, 2] });
            fs.unlinkSync(videosToJoinFilePath);
            fs.unlinkSync(cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '.mp4');
            var params = {
                title:moment.utc(doorEvent.timestamp*1000).utcOffset(60).format('YYYY MMMM DD hh:mm a'),
                description: '',
                file: cameraVideosFolderLocation + 'doorvideos/' + doorEvent.timestamp + '_trim.mp4'
            };
            youtubeAPI.uploadToYoutube(params, function (youtubeId) {
                fs.unlinkSync(params.file);
                markDone(doorEvent, youtubeId);
                emailSender.sendMail("Door Open " + params.title, "https://www.youtube.com/watch?v=" + youtubeId);
            });
        });



    }


    function getFilesToMerge(ignoreVideosAfterTimestamp,doorEvent, onResult) {
        getCurrentFilesInfo(ignoreVideosAfterTimestamp,function (filesInfo) {
            var filesToUse = [];
            for (var index = 0; index < filesInfo.length; ++index) {
                var videoStartTime = filesInfo[index].timestamp;
                var delta = doorEvent.timestamp - videoStartTime;
                if (delta > videoLenght / 2) {
                    filesToUse.push(filesInfo[index]);
		    if (index>1){
	                    filesToUse.push(filesInfo[index - 1]);
			}
                    break;
                }
            }
            if (filesToUse.length > 1) {
                onResult(filesToUse);
            }
        });
    }
    function getCurrentFilesInfo(ignoreVideosAfterTimestamp,onResult) {
        fs.readdir(cameraVideosFolderLocation, (err, files) => {
            var filesInfo = [];
            files.forEach(file => {
                var datetimestring = file.slice(0, -4);
                var epoch = moment.utc(datetimestring, "YYYY-MM-DD_HH-mm-ss").valueOf() / 1000;
                if (ignoreVideosAfterTimestamp >= epoch) {
                    filesInfo.push({
                        file: file,
                        timestamp: epoch
                    });
                }
            });
            filesInfo.sort(function (a, b) { return (a.timestamp > b.timestamp) ? -1 : ((b.timestamp > a.timestamp) ? 1 : 0); });
            onResult(filesInfo);
        })
    }
}