var util = require('util');

var Firebase = require('./firebase-node');
var myRootRef = new Firebase('https://pusceiver.firebaseIO.com/');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_APP_SECRET);
var token = tokenGenerator.createToken({}, {admin: true, debug: true});
myRootRef.auth(token);

var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);


util.debug("pusceiver-node will start");
// myRootRef.push('Hello from heroku!');
myRootRef.startAt(Date.now()).on('child_added', function(snapshot) {
    util.debug(snapshot.getPriority() + ":" + snapshot.val());
    var notification = {
        //channels: [''],
        where: { "deviceType": "ios" },
        data: {
            p: "/" + snapshot.name(),
            alert: snapshot.val()
        }
    };
    kaiseki.sendPushNotification(notification, function(err, res, body, success) {
        if (success) {
            console.log('Push notification successfully sent:', body);
        } else {
            console.log('Could not send push notification:', err, body);
        }
    });
});
