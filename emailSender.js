var nodemailer = require('nodemailer');

exports.sendMail = function (subject,body) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'entrancecamera123@gmail.com',
            pass: 'hackol37'
        }
    });

    var mailOptions = {
        from: 'Entrance Door <entrancecamera123@gmail.com?',
        to: 'mig.ruiz@gmail.com,soniacarolina.blanco@gmail.com',
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