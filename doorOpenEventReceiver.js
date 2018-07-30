var amqp = require('amqplib');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
var queueListener = require('./rabbitQueueListenerConnector.js')

exports.monitor=function(amqpURI,onNewReading) {

    queueListener.listenToQueue(amqpURI, 'doorOpenEvents', { durable: true, noAck: false }, function (ch, msg) {
        var content = msg.content.toString();
        onNewReading(content, function () {
            ch.ack(msg);            
        });
        
    });
}
