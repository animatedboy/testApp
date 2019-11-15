var mongo = require('mongodb');

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/dbst";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("voiceit");
    dbo.createCollection("customers", function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
});

var insertUser = (ani, user, userPhrase) => {
    return new Promise((resolve, reject) => {
        try {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("voiceit");
                var myobj = { ani: ani, userid: user, phrase: userPhrase };
                dbo.collection("customers").insertOne(myobj, function (err, res) {
                    if (err) throw err;

                    console.log(`Inserted Record. ani ${ani}, user:${user}`);
                    resolve(`Inserted Record. ani ${ani}, user:${user}`);
                    db.close();
                });
            });
        } catch (ex) {
            console.log(`Error in inserting record. ani ${ani}, user:${user}, Trace: ${ex}`);
            reject(`Error in inserting record. ani ${ani}, user:${user}`);
        }
    });
}

var findUser = (ani) => {
    return new Promise((resolve, reject) => {
        try {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;

                var dbo = db.db("voiceit");
                var query = { ani: ani };

                dbo.collection("customers").findOne(query, (err, result) => {
                    if (err) throw err;

                    resolve(result);
                    db.close();
                });
            });
        } catch (ex) {
            console.log(`Error in finding record. ani ${ani}, Trace: ${ex}`);
            reject(`Error in finding record. ani ${ani}`);
        }
    });
}

async function testDB() {

    var user = await insertUser('9500730510', 'sibi', 'this is my identity');
    console.log(`Inserted User ${user}`);

    var finduser = await findUser('9600860640');
    console.log(`Found User` + JSON.stringify(finduser));
}

module.exports = {
    insertUser,
    findUser
}