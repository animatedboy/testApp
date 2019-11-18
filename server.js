const express = require('express');
const Multiparty = require('multiparty');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const url = require('url');

var voiceit = require("./voiceit");
const props = require('./userprops');

var recordingDirectory = './recordings';
if (!fs.existsSync(recordingDirectory)) {
    fs.mkdirSync(recordingDirectory);
}

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));


// To Create an User.
app.get('/createUser', async (req, res) => {
    var userResponse = await voiceit.createUser();
    console.log(JSON.stringify(userResponse));
    console.log(userResponse.userId);
    res.send(userResponse);
});

// To delete an user.
app.get('/deleteUser', async (req, res) => {
    var query = url.parse(req.url, true).query;

    var userResponse = await voiceit.deleteUser(query.user);
    console.log(userResponse);
    console.log(JSON.stringify(userResponse));
    res.send(userResponse);
});

app.post('/enrollVoice', async (req, res) => {

    let reqbody = await getFormData(req, {});

    var us = await props.getUser(reqbody.ani);
    var userid;
    if (us) {
        console.log('User available.' + us.ani);
        userid = us.userid;
    } else {
        console.log('User not available. Creating new User.');
        var userResponse = await voiceit.createUser();
        userid = userResponse.userId;
    }

    // insert ani and user id mapping to mongo db.
    props.addUsers(reqbody.ani, userid, reqbody.phrase);

    if (reqbody.recordfile) {
        // write the file to a local directory.
        var filename = recordingDirectory + '/' + reqbody.recordfile.filename;
        fs.writeFileSync(filename, reqbody.recordfile.data);

        // call voiceit api to enroll voice.
        var resp = await voiceit.enrollVoice(userid, reqbody.contentLanguage, reqbody.phrase, filename).then(console.log("Returns Promise"));
        console.log("Response:" + JSON.stringify(resp));
    }

    res.send(resp);
    console.log("-- Write Completed --");
});

app.post('/voiceAuth', async (req, res) => {
    try {
        let reqbody = await getFormData(req, {});

        // find the userid for the given ani.
        var user = await props.getUser(reqbody.ani);

        console.log('Request: ' + JSON.stringify(reqbody));
        if (reqbody.recordfile) {

            var file = reqbody.recordfile.filename;
            file = file.replace('/tmp/', '').replace('.dat', '.wav');

            // write the file to a local directory.
            var filename = recordingDirectory + '/' + file;
            fs.writeFileSync(filename, reqbody.recordfile.data);

            // call voiceit api to verfiy voice.
            var resp = await voiceit.verifyVoice(user.userid, reqbody.contentLanguage, reqbody.phrase, filename).then(console.log("Returns Promise"));
            console.log("Response:" + JSON.stringify(resp));
        }

        res.send(resp);
    } catch (e) {
        res.status(400).send('Error');
    }
    console.log("-- Write Completed --");
});


// function to receive the stream of data.

let getFormData = function (req, reqBody) {
    // console.log('------- req -------');
    // console.log(req);
    return new Promise((resolve, reject) => {
        let form = new Multiparty.Form();

        form.on('part', (part) => {
            var chunks = [];
            part.on('data', chunks.push.bind(chunks));

            part.on('end', function (data) {
                var data = Buffer.concat(chunks);
                if (part.filename) {
                    reqBody[part.name] = {
                        filename: part.filename,
                        data: data
                    };
                } else {
                    reqBody[part.name] = data.toString('utf8');
                }
            });
            part.on('error', function (err) {
                //logger.error( "Error in getformdata >> " + err);
                console.log("Error in getformdata >> " + err);

                return reject({
                    code: 400,
                    message: "Invalid data in post form"
                });
            });
        });

        form.on('close', function () {
            return resolve(reqBody);
        });

        form.on('error', function (err) {
            // logger.error( "Error in getformdata >> " + err);
            console.log("Error in getformdata >> " + err);

            return reject({
                code: 400,
                message: "Invalid data in post form"
            });
        });

        form.parse(req);
    });
};


var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, () => console.log(`Example app listening on port ${server_port} ${server_ip_address}!`));