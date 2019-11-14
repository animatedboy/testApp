const express = require('express');
const Multiparty = require('multiparty');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

var voiceit = require("./voiceit");

var recordingDirectory = './recordings';
if (!fs.existsSync(recordingDirectory)) {
    fs.mkdirSync(recordingDirectory);
}

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/enrollVoice', async (req, res) => {
    let reqbody = await getFormData(req, {});
    if (reqbody.recording) {
        var filename = recordingDirectory + '/' + reqbody.recording.filename;
        fs.writeFileSync(filename, reqbody.recording.data);
        var resp = await voiceit.enrollVoice(reqbody.userId, reqbody.contentLanguage, reqbody.phrase, filename).then(console.log("Returns Promise"));
        console.log("Response:" + JSON.stringify(resp));
    }
    res.send(resp);
    console.log("-- Write Completed --");
});

app.post('/voiceAuth', async (req, res) => {
    let reqbody = await getFormData(req, {});
    if (reqbody.recording) {
        var filename = recordingDirectory + '/' + reqbody.recording.filename;
        fs.writeFileSync(filename, reqbody.recording.data);
        var resp = await voiceit.verifyVoice(reqbody.userId, reqbody.contentLanguage, reqbody.phrase, filename).then(console.log("Returns Promise"));
        console.log("Response:" + JSON.stringify(resp));
    }
    res.send(resp);
    console.log("-- Write Completed --");
});


// function to receive the stream of data.

let getFormData = function (req, reqBody) {
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