'use strict';

const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();
const fetch = require('node-fetch');
const Twitter = require('twitter');

const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const getData = async url => {
    try {
        const response = await fetch(url);
        const data = await response.buffer();
        return data;
    } catch (error) {
        console.log(error);
    }
};

const getAnimalAsync = async imageData => {

    const params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 100,
        MinConfidence: 90,
    };

    const data = await rek.detectLabels(params);

    if (data.Labels.length > 0
        && data.Labels.some(label => label.Name === 'Animal')) {

        console.log('Found an animal - trying to now find the most specific match');

        let maxSize = 0;
        let result = '';

        data.Labels.forEach((label) => {
            if (label.Parents.length > maxSize) {
                maxSize = label.Parents.length;
                result = label.Name;
            }
        });

        console.log('Most specific match is : ' + result);

        const response = {
            statusCode: 200,
            body: JSON.stringify(`I can see ${matchingLabel.Name} in that image`)
        };

        return response;

    } else {

        console.log('Cannot find an animal in the image');

        const response = {
            statusCode: 200,
            body: JSON.stringify('Sorry that picture does not appear to contain an animal')
        };

        return response;
    }
};

function getAnimalFromRekognitionService(imageData) {

    const params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 100,
        MinConfidence: 90,
    };

    return new Promise((resolve, reject) => {
        rek.detectLabels(params, (err, data) => {
            if (err) {
                return reject(new Error(err));
            }

            //need to check it is an animal
            if (data.Labels.some(label => label.Name === 'Animal')) {

                let maxSize = 0;
                let result = '';

                data.Labels.forEach((label) => {
                    if (label.Parents.length > maxSize) {
                        maxSize = label.Parents.length;
                        result = label.Name;
                    }
                });

                console.log(maxSize + ' ' + result);

                const matchingLabel = data.Labels.find(label => label.Name === result);

                console.log(matchingLabel.Name + ' ' + matchingLabel.Parents);

                const response = {
                    statusCode: 200,
                    body: JSON.stringify(matchingLabel.Name)
                };

                console.log(JSON.stringify(data));
                return resolve(response);

            } else {
                const response = {
                    statusCode: 200,
                    body: JSON.stringify('Sorry that picture is not of an animal')
                };

                console.log(JSON.stringify(data));
                return resolve(response);
            }
        });
    });
}

function getAnimalFromRekognitionService(imageData) {

    const params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 100,
        MinConfidence: 90,
    };

    return new Promise((resolve, reject) => {
        rek.detectLabels(params, (err, data) => {
            if (err) {
                return reject(new Error(err));
            }

            //need to check it is an animal
            if (data.Labels.some(label => label.Name === 'Animal')) {

                let maxSize = 0;
                let result = '';

                data.Labels.forEach((label) => {
                    if (label.Parents.length > maxSize) {
                        maxSize = label.Parents.length;
                        result = label.Name;
                    }
                });

                console.log(maxSize + ' ' + result);

                const matchingLabel = data.Labels.find(label => label.Name === result);

                console.log(matchingLabel.Name + ' ' + matchingLabel.Parents);

                return resolve(`I can see a : ${matchingLabel.Name}`);

            } else {
                return resolve('Sorry that picture is not of an animal');
            }
        });
    });
}

async function sendReplyToTweet(text, replytoid,screenname) {
	const payload = {
		status: `@${screenname} ${text}`,
		in_reply_to_status_id: replytoid
	};

	console.log(payload);

	const tweet = await client.post('statuses/update', payload);
	return tweet;
}

exports.animalbot = async (event) => {

    const jsonBody = JSON.parse(event.body);

    console.log(event);
    console.log(JSON.stringify(jsonBody));

    console.log('tweet id : ' + jsonBody.tweet_create_events[0].id_str);
    console.log('pic URL : ' + jsonBody.tweet_create_events[0].entities.urls[0].url);
    console.log('screen name: ' + jsonBody.tweet_create_events[0].user.screen_name);

    const imageData = await getData(jsonBody.tweet_create_events[0].entities.urls[0].url);
    const rekognitionResponse = await getAnimalFromRekognitionService(imageData);
    console.log('JNM ' + rekognitionResponse);

    const tweet = await sendReplyToTweet(rekognitionResponse,jsonBody.tweet_create_events[0].id_str,jsonBody.tweet_create_events[0].user.screen_name);
    
    const response = {
	statusCode: 200,
   	body: JSON.stringify('OK')
    };

    return response;
};
