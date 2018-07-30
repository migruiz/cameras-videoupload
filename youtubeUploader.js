const CLIENT_ID = '904380772485-8unv33sc1k4jqlsapp7idrab25kbvngp.apps.googleusercontent.com';
const CLIENT_SECRET = 'Q3Im63YkToxDseiw4L4Mentx';


var Youtube = require('youtube-video-api')


function getParams(title, description) {
    var params = {
        resource: {
            snippet: {
                title: title,
                description: description
            },
            status: {
                privacyStatus: 'unlisted'
            }
        }
    }
    return params;
}
exports.uploadToYoutube=function(fileInfo, onComplete){
  var youtube = Youtube({
      video: {
          part: 'status,snippet'
      },
          file:'/home/pi/DoorSensorTrigger/.google-oauth2-credentials.json'

  })
    youtube.authenticate(CLIENT_ID, CLIENT_SECRET, function (err, tokens) {
        if (err) return console.error('Cannot authenticate:', err)
        uploadVideo(youtube,fileInfo, onComplete);
    })
}



function uploadVideo(youtube,fileInfo, onComplete) {
    var params = getParams(fileInfo.title, fileInfo.description);
        youtube.upload(fileInfo.file, params, function (err, video) {
        // 'path/to/video.mp4' can be replaced with readable stream. 
        // When passing stream adding mediaType to params is advised.
        if (err) {
            return console.error('Cannot upload video:', err)
        }

        console.log('Video was uploaded with ID:', video.id)
        onComplete(video.id);

    })
}




