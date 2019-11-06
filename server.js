const express = require('express');
const Multiparty = require('multiparty');
const bodyParser = require('body-parser');
const app = express();
const port = 3000
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.get('/hai', (req, res) => res.send('Hello World!'));

app.post('/voiceAuth',async (req,res)=>{
   let reqbody = await getFormData(req,{});
   console.log(reqbody);
})


let getFormData = function(req,reqBody){
    return new Promise((resolve,reject)=>{
        let form =  new Multiparty.Form();

        form.on('part',(part)=>{
            var chunks = [];
            part.on('data', chunks.push.bind(chunks));
        
            part.on('end', function(data) {
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
            part.on('error', function(err) {
                logger.error( "Error in getformdata >> " + err);
                return reject({
                    code: 400,
                    message: "Invalid data in post form"
                }); 
            });
        });

        form.on('close', function() {
            return resolve(reqBody);
        });
        form.on('error', function(err) {
            logger.error( "Error in getformdata >> " + err);
            return reject({
                code: 400,
                message: "Invalid data in post form"
            }); 
        });

        form.parse(req);
    });  
};
app.listen(port, () => console.log(`Example app listening on port ${port}!`))