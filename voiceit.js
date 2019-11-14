// use voice it api
const voiceit2 = require('voiceit2-nodejs');

// Initialize voiceit 
let myVoiceIt = new voiceit2("key_264913c946354c3f9243abf5ac2b15a1", "tok_53da855ff3f748248f87e160784ffdd3");

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
      reject("Failure");
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
      reject("Failure");
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
      reject("Failure");
    }
  });
}

module.exports = {
  listphrases,
  enrollVoice,
  verifyVoice
}