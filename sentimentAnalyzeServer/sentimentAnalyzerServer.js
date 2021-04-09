const express = require('express');
const app = new express();
const dotenv = require('dotenv');
dotenv.config();

function getNLUInstances() {
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;

    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth')

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl: api_url,
    });
    return naturalLanguageUnderstanding;
}

function getEmotion(data,analysistype,datatype,res) {
    naturalLanguageUnderstanding = new getNLUInstance();
    let analyzeParams = {
            'html': '',
            'features': {
                'emotion': {
                'targets': [
                    '1',
                    '2'
                ]
                }
            }
            };
    if(datatype=='text') {
        if(analysistype=='emotion') {
            analyzeParams = {
                'features': {
                'emotion': {}
                },
            'text': data
            }
        }
        else {
            analyzeParams = {
                'features': {
                'sentiment': {}
                },
            'text': data
            }
        }
    }
    else
        if(analysistype=='emotion') {
            analyzeParams = {
                'features': {
                'emotion': {}
                },
            'url': data
            }
        }
        else {
            analyzeParams = {
                'features': {
                'sentiment': {}
                },
            'url': data
            }
        }
    
    naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
        if(analysistype=='emotion') 
            res.send(JSON.stringify(analysisResults, null, 2));
        else
            res.send(JSON.stringify(analysisResults.result.sentiment.document.label, null, 2));
        })
        .catch(err => {
            console.log('error:', err.statusText);
        });
};
app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

app.get("/",(req,res)=>{
    res.render('index.html');
  });

app.post("/url/emotion", (req,res) => {
    getEmotion(req.query.url,'emotion','url',res);
});

app.get("/url/sentiment", (req,res) => {
    getEmotion(req.query.url,'sentiment','url',res);
});

app.get("/text/emotion", (req,res) => {
    getEmotion(req.query.text,'emotion','text',res);
});

app.get("/text/sentiment", (req,res) => {
    getEmotion(req.query.text,'sentiment','text',res);
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

