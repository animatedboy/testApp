const fs = require('fs');

var userDirectory = './users';
var fileName = 'user.json';
var file = userDirectory + '/' + fileName;

var createFile = () => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(userDirectory)) {
                fs.mkdirSync(userDirectory);
                fs.open(file, 'w', function (err, file) {
                    if (err) throw err;

                    console.log(`Created File:` + file);
                });
            }
            resolve(`Success ...`);
        } catch (ex) {
            reject(`Error creating file. Error:${ex}`);
        }
    });
}

var addUsers = async (ani, userid, phrase) => {

    console.log(`Method: addUsers, ani:${ani}, userid:${userid}`);

    var result = await createFile();
    console.log(result);

    var userDetail = {
        "ani": ani,
        "userid": userid,
        "phrase": phrase
    }

    var users = fs.readFileSync(file);

    if (users.length) {
        var userArray = JSON.parse(users);
        userArray.users.push(userDetail);
        fs.writeFileSync(file, JSON.stringify(userArray));
    } else {
        var obj = {
            "users": []
        };
        obj.users.push(userDetail);
        fs.writeFileSync(file, JSON.stringify(obj));
    }

};


var getUser = (ani) => {

    return new Promise((resolve, reject) => {
        try {
            console.log(`Method: getUser, ani:${ani}`);
            var obj = JSON.parse(fs.readFileSync(file));
            obj.users.forEach((item) => {
                if (item.ani == ani) {
                    console.log('ANI:' + JSON.stringify(item));
                    resolve(item);
                }
            });
        } catch (ex) {
            reject(`Error reading file. Error:${ex}`);
        }
    });
}

// addUsers('8667076180', 'asdfaeqaf765sf9da7s6dfoasgo76');
// addUsers('9976702323', 'sdfsv23fsd34kksdflssdfwerwerq');
// getUser('9976702323');

module.exports = {
    addUsers,
    getUser
}