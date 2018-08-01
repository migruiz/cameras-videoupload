var nodemailer = require('nodemailer');

exports.sendMail = function (subject,body) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPWD
        }
    });

    var mailOptions = {
        from: 'Entrance Door <entrancecamera123@gmail.com?',
        to: process.env.TARGETEMAILS,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}