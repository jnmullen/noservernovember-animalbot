'use strict';

const crypto = require('crypto');
const ramda = require('ramda');

const getCrcToken = ramda.path(['queryStringParameters', 'crc_token']);

function getChallengeResponse(crc_token, consumer_secret) {
    return 'sha256=' + crypto.createHmac('sha256', consumer_secret).update(crc_token).digest('base64')
}

exports.crc = async (event) => {

    console.log(event);

    const crc_token = getCrcToken(event);

    if (crc_token != null) {

        console.log('got crc_token ' + crc_token);

        const challenge = getChallengeResponse(crc_token, process.env.TWITTER_CONSUMER_SECRET);

        console.log('challenge ' + challenge);

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                response_token: challenge
            })
        };

        console.log(response);

        return response;

    } else {

        const response = {
            statusCode: 400,
            body: JSON.stringify('No CRC token present')
        };

        console.log(response);

        return response;
    }
};
