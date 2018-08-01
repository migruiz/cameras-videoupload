const CLIENT_ID = process.env.YOUTUBECLIENTID;
const CLIENT_SECRET = process.env.YOUTUBECLIENTSECRET;


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
          file:process.env.YOUTUBETOKEN

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




