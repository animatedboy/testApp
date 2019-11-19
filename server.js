const express = require('express');
const Multiparty = require('multiparty');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const url = require('url');

var voiceit = require("./voiceit.js");
var azure = require("./azure.js");

var userArray = {
    'users': [{
        ani: '9976702548',
        userid: 'usr_d22154e4a8be43e7ad601decf18bbced',
        active: 'y'
    }, {
        ani: "9600860640",
        userid: "usr_d22154e4a8be43e7ad601decf18be091",
        active: "y"
    }]
}

function addUser(ani, userid) {
    var userobj = {
        ani: ani,
        userid: userid,
        active: 'y'
    }
    userArray.users.push(userobj);
    console.log('addUser - Available users in User Array. Array :' + JSON.stringify(userArray));
}

function getUser(ani) {
    console.log('getUser - Available users in User Array. Array :' + JSON.stringify(userArray));
    var result;
    userArray.users.forEach((item) => {
        console.log(`Loop: ${item}`);
        if (item.ani == ani) {
            result = item;
        }
    });
    return result;
}

var recordingDirectory = './recordings';
if (!fs.existsSync(recordingDirectory)) {
    fs.mkdirSync(recordingDirectory);
}

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({
    limit: '10mb',
    type: ['application/json', 'application/csp-report']
}));

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

    // var us = await props.getUser(reqbody.ani);
    var us = getUser(reqbody.ani);
    var userid;
    if (us) {
        console.log('User available.' + us.ani);
        userid = us.userid;
    } else {
        console.log('User not available. Creating new User.');
        var userResponse = await voiceit.createUser();
        userid = userResponse.userId;
        // insert ani and user id mapping to mongo db.
        // props.addUsers(reqbody.ani, userid, reqbody.phrase);
        addUser(reqbody.ani, userid);
    }

    if (reqbody.recordfile) {

        var file = reqbody.recordfile.filename;
        file = file.replace('/tmp/', '').replace('.dat', '.wav');

        // write the file to a local directory.
        var filename = recordingDirectory + '/' + file;
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
        // var user = await props.getUser(reqbody.ani);
        var user = getUser(reqbody.ani);

        // console.log('Request: ' + JSON.stringify(reqbody));
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

        res.status(200).send(resp);
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


var userData = [{
    device_id: 'iot_001_samqwe',
    username: 'vamshi',
    firstName: "Vamshi",
    LastName: "patel",
    phoneNumber: "16503971085"
}, {
    device_id: 'iot_002_samrty',
    username: 'ragusizzles',
    firstName: "Raguram",
    LastName: "Mohandas",
    phoneNumber: "16503971085"
}]

app.get('/iot/userdata', async (req, res) => {
    var device_id = req.query.device_id;
    if (!device_id) {
        res.status(400).send({ error: "no device_id is given" });
    }
    var result = userData.filter((user) => {
        return user.device_id === device_id;
    });

    res.status(200).send(result[0])
});


// ----------- Code for Azure -----------------

var azureUserArray = {
    'users': [{
        ani: '9600860640',
        userid: 'cc54d1c4-57c3-42f4-971c-46db201a3fd0',
        active: 'y'
    }]
}

function addAzureUser(ani, userid) {
    var userobj = {
        ani: ani,
        userid: userid,
        active: 'y'
    }
    azureUserArray.users.push(userobj);
    console.log('addAzureUser - Available users in User Array. Array :' + JSON.stringify(azureUserArray));
}

function getAzureUser(ani) {
    console.log('getAzureUser - Available users in User Array. Array :' + JSON.stringify(azureUserArray));
    var result;
    azureUserArray.users.forEach((item) => {
        console.log(`Loop: ${item}`);
        if (item.ani == ani) {
            result = item;
        }
    });
    return result;
}

var azureRecordingDirectory = './azurerecordings';
if (!fs.existsSync(azureRecordingDirectory)) {
    fs.mkdirSync(azureRecordingDirectory);
}

app.post('/azureEnrollVoice', async (request, response) => {
    let reqbody = await getFormData(req, {});

    // var us = await props.getUser(reqbody.ani);
    var us = getAzureUser(reqbody.ani);
    var userid;
    if (us) {
        console.log('User available.' + us.ani);
        userid = us.userid;
    } else {
        console.log('User not available. Creating new User.');
        var userResponse = await azure.createProfile();
        userid = userResponse.identificationProfileId;
        // insert ani and user id mapping to mongo db.
        // props.addUsers(reqbody.ani, userid, reqbody.phrase);
        addAzureUser(reqbody.ani, userid);
    }

    if (reqbody.recordfile) {

        var file = reqbody.recordfile.filename;
        file = file.replace('/tmp/', '').replace('.dat', '.wav');

        // write the file to a local directory.
        var filename = azureRecordingDirectory + '/' + file;
        fs.writeFileSync(filename, reqbody.recordfile.data);

        // call voiceit api to enroll voice.
        var resp = await azure.createEnrollment(userid, filename);
        console.log("Response:" + JSON.stringify(resp));
    }

    res.status(200).send(resp);
    console.log("-- Write Completed --");
});

app.post('/azureVoiceAuth', async (req, res) => {
    try {
        let reqbody = await getFormData(req, {});

        // find the userid for the given ani.
        // var user = await props.getUser(reqbody.ani);
        var user = getAzureUser(reqbody.ani);
        user = 'cc54d1c4-57c3-42f4-971c-46db201a3fd0';
        // console.log('Request: ' + JSON.stringify(reqbody));
        if (reqbody.recordfile) {

            var file = reqbody.recordfile.filename;
            file = file.replace('/tmp/', '').replace('.dat', '.wav');

            // write the file to a local directory.
            var filename = azureRecordingDirectory + '/' + file;
            fs.writeFileSync(filename, reqbody.recordfile.data);

            // call voiceit api to verfiy voice.
            var resp = await azure.verifyVoiceContent(user, filename);
            console.log("Server Response:" + JSON.stringify(resp));
        }

        res.status(200).send(resp);
    } catch (e) {
        res.status(400).send('Error');
    }
    console.log("-- Write Completed --");
});





var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, () => console.log(`Example app listening on port ${server_port} ${server_ip_address}!`));