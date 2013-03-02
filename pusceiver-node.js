var util = require('util');
var url = require('url');

var Firebase = require('./firebase-node');
var rootRef = new Firebase('https://pusceiver.firebaseIO.com/');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_APP_SECRET);
var token = tokenGenerator.createToken({}, {admin: true, debug: true});

var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);

function push_notification(itemSnapshot) {
    var notification = {
        //channels: [''],
        where: { "deviceType": "ios" },
        data: {
            p: url.parse(itemSnapshot.ref().toString()).path,
            alert: itemSnapshot.val()
        }
    };
    kaiseki.sendPushNotification(notification, function(err, res, body, success) {
        if (success) {
            console.log('Push notification successfully sent:', body);
        } else {
            console.log('Could not send push notification:', err, body);
        }
    });
}

util.debug("pusceiver-node will start");
rootRef.auth(token);
rootRef.child("users").on('child_added', function(userSnapshot) {
    userSnapshot.ref().child('items').startAt(Date.now()).on('child_added', function(itemSnapshot) {
        push_notification(itemSnapshot);
    });
});
