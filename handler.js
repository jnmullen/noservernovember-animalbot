'use strict';

const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();
const fetch = require('node-fetch');
const Twitter = require('twitter');
const ramda = require('ramda');

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const getUrlFromEntities = ramda.path(['tweet_create_events', 0, 'entities', 'urls', 0, 'urls']);
const getUrlFromExtendedEntities = ramda.path(['tweet_create_events', 0, 'extended_entities', 'media', 0, 'media_url']);

const getData = async url => {
    try {
        const response = await fetch(url);
        return await response.buffer();
    } catch (error) {
        console.log(error);
    }
};

const getAnimalFromRekognitionService = async imageData => {

    const params = {
        Image: {
            Bytes: imageData
        },
        MaxLabels: 100,
        MinConfidence: 90,
    };

    const data = await rek.detectLabels(params).promise();

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
};

async function sendReplyToTweet(text, replytoid, screenname) {
    const payload = {
        status: `@${screenname} ${text}`,
        in_reply_to_status_id: replytoid
    };

    console.log(payload);

    return await client.post('statuses/update', payload);
}

function getUrlFromTweetData(tweetData) {

    const urlFromEntities = getUrlFromEntities(tweetData);
    const urlFromExtendedEntities = getUrlFromExtendedEntities(tweetData);

    if (urlFromEntities == null && urlFromExtendedEntities == null) {
        return null;
    } else {
        return urlFromEntities == null ? urlFromExtendedEntities : urlFromEntities;
    }
}

exports.animalbot = async (event) => {

    const jsonBody = JSON.parse(event.body);

    console.log(JSON.stringify(event));
    console.log(JSON.stringify(jsonBody));

    const tweetId = jsonBody.tweet_create_events[0].id_str;
    const pictureUrl = jsonBody.tweet_create_events[0].entities.urls[0].url;
    const screenName = jsonBody.tweet_create_events[0].user.screen_name;

    const picUrl = getUrlFromTweetData(jsonBody);

    console.log('tweet id : ' + tweetId);
    console.log('pictureUrl : ' + pictureUrl);
    console.log('screen name : ' + screenName);
    console.log('picUrl : ' + picUrl);

    const imageData = await getData(pictureUrl);

    const rekognitionResponse = await getAnimalFromRekognitionService(imageData);

    console.log(rekognitionResponse);

    await sendReplyToTweet(rekognitionResponse, tweetId, screenName);

    return {
        statusCode: 200,
        body: JSON.stringify('OK')
    };
};
