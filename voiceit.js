// use voice it api
const voiceit2 = require('voiceit2-nodejs');

// Initialize voiceit 
let myVoiceIt = new voiceit2("key_4021b35a5b5a463abceca8cf473f2d57", "tok_172374c191da4469915e8e3e31132878");

var deleteUser = (userId) => {
  console.log('Method: deleteUser');
  return new Promise((resolve, reject) => {
    try {
      myVoiceIt.deleteUser({
        userId: userId
      }, (jsonResponse) => {
        resolve(jsonResponse);
      });
    } catch (ex) {
      reject('API call Failed.');
    }
  });
}

var createUser = () => {
  console.log('Method: createUser');
  return new Promise((resolve, reject) => {
    try {
      myVoiceIt.createUser((jsonResponse) => {
        resolve(jsonResponse);
      });
    } catch (ex) {
      reject('API call Failed.');
    }
  });
}

// To list the phrases available in the VoiceIt API.
var listphrases = (contentLanguage) => {
  console.log(`Method:listphrases, Language:${contentLanguage}`);
  return new Promise((resolve, reject) => {
    try {
      myVoiceIt.getPhrases({ contentLanguage: contentLanguage }, (jsonResponse) => {
        //handle response
        resolve(jsonResponse);
      });
    } catch (ex) {
      console.log('Method: listphrases. ' + ex);
      reject('API call Failed.');
    }
  });
}

// To enroll a voice
var enrollVoice = (user, content, phrase, audioFilePath) => {
  console.log(`Method:enrollVoice, User:${user}, Phrase:${phrase}`);
  return new Promise((resolve, reject) => {
    try {
      myVoiceIt.createVoiceEnrollment({
        userId: user,
        contentLanguage: content,
        phrase: phrase,
        audioFilePath: audioFilePath
      }, (jsonResponse) => {
        //handle response        
        resolve(jsonResponse);
      });
    } catch (ex) {
      console.log('Method: enrollVoice. ' + ex);
      reject('API call Failed.');
    }
  });
}

// To verify a voice
var verifyVoice = (user, content, phrase, audioFilePath) => {
  console.log(`Method:verifyVoice, User:${user}, Phrase:${phrase}`);

  return new Promise((resolve, reject) => {
    try {
      myVoiceIt.voiceVerification({
        userId: user,
        contentLanguage: content,
        phrase: phrase,
        audioFilePath: audioFilePath
      }, (jsonResponse) => {
        //handle response      
        resolve(jsonResponse);
      });
    } catch (ex) {
      console.log('Method: verifyVoice. ' + ex);
      reject('API call Failed.');
    }
  });
}

module.exports = {
  listphrases,
  enrollVoice,
  verifyVoice,
  createUser,
  deleteUser
}