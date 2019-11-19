let azureKey = '9ee3ab106ad448089a4744faadbca675';
let baseURL = 'speaker-recognition-api.cognitiveservices.azure.com';

var https = require('https');
var url = require('url');
var fs = require('fs');

let getAllPhrasesOptions = {
    hostname: baseURL,
    port: 443,
    path: '/spid/v1.0/verificationPhrases?locale=en-us',
    method: 'GET',
    headers: {
        'Ocp-Apim-Subscription-Key': 'e5df420635d547bcb1e4d6d12efe7dad'
    }
}

var getAllPhrases = () => {
    try {
        https.get(getAllPhrasesOptions, (response) => {
            console.log('Response:');

            response.on('data', (data) => {
                console.log('Resp Data:' + data);
            });

            response.on('error', (error) => {
                console.log('Error Data:' + error);
            });

        });
    } catch (ex) {
        console.log(ex);
    }
}

var postData = {
    "locale": "en-us",
}

let createProfileOptions = {
    hostname: baseURL,
    port: 443,
    path: '/spid/v1.0/identificationProfiles',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // 'Content-Length': postData.length,
        'Ocp-Apim-Subscription-Key': 'e5df420635d547bcb1e4d6d12efe7dad'
    }
}

var createProfile = () => {
    return new Promise((resolve, reject) => {

        try {
            const req = https.request(createProfileOptions, (response) => {
                console.log('Response:');

                response.on('data', (data) => {
                    console.log('Resp Data:' + data);
                    resolve(data);
                });

                response.on('error', (error) => {
                    console.log('Error Data:' + error);
                    reject(error);
                });

                response.on('end', () => {
                    console.log('-- Response Ended --');
                });

            });

            req.on('error', (error) => {
                console.log('Request Error:' + error);
                reject(error);
            });

            req.write(JSON.stringify(postData));
            req.end();

        } catch (ex) {
            console.log(ex);
        }

    });
}

var createEnrollment = (userid, filename) => {
    console.log('Method createEnrollment');
    var createEnrollmentOptions = {
        hostname: baseURL,
        port: 443,
        path: `/spid/v1.0/identificationProfiles/${userid}/enroll`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Ocp-Apim-Subscription-Key': 'e5df420635d547bcb1e4d6d12efe7dad'
        }
    }

    return new Promise((resolve, reject) => {
        try {

            var req = https.request(createEnrollmentOptions, (response) => {

                response.on('data', (data) => {
                    console.log('Resp Data:' + data);
                });

                response.on('error', (error) => {
                    console.log('Error Data:' + error);
                });

                response.on('end', () => {
                    console.log('-- Response Ended --');
                });

            });

            req.on('error', (error) => {
                console.log('Request Error:' + error);
                reject(error);
            });

            // var data = fs.createReadStream('C:/Users/schakara/Desktop/IWC/Phrases/azure/20191119-174911.wav');
            // var data = fs.readFileSync('C:/Users/schakara/Desktop/IWC/Phrases/azure/enrollment.wav');
            var audioData = {
                'data': fs.createReadStream(filename)
            }

            req.write(audioData);
            req.end();

        } catch (ex) {
            console.log('API Exception: ' + ex);
        }
    });
}

var verifyVoiceContent = (userid, filename) => {

    var createEnrollmentOptions = {
        hostname: baseURL,
        port: 443,
        path: `/spid/v1.0/identify?identificationProfileIds=${userid}`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Ocp-Apim-Subscription-Key': 'e5df420635d547bcb1e4d6d12efe7dad'
        }
    }

    return new Promise((resolve, reject) => {
        try {

            var req = https.request(createEnrollmentOptions, (response) => {

                response.on('data', (data) => {
                    console.log('Resp Data:' + data);
                    resolve(data);
                });

                response.on('error', (error) => {
                    console.log('Error Data:' + error);
                    reject(error);
                });

                response.on('end', () => {
                    console.log('-- Response Ended --');
                });

            });

            req.on('error', (error) => {
                console.log('Request Error:' + error);
                reject(error);
            });

            // var data = fs.createReadStream('C:/Users/schakara/Desktop/IWC/Phrases/azure/20191119-174911.wav');
            // var data = fs.readFileSync('C:/Users/schakara/Desktop/IWC/Phrases/azure/enrollment.wav');
            var audioData = {
                'data': fs.readFileSync(filename)
            }

            req.write(audioData);
            req.end();

        } catch (ex) {
            console.log('Exception: ' + ex);
        }
    });
}


module.exports = {
    createProfile,
    createEnrollment,
    verifyVoiceContent
}