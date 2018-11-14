'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

function getChallengeResponse(crc_token, consumer_secret) {
        return crypto.createHmac('sha256', consumer_secret).update(crc_token).digest('base64')
}

exports.crc = async (event) => {

    console.log(event);

    if(event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
	    if(event.queryStringParameters.crc_token !== undefined &&
		    event.queryStringParameters.crc_token !== null &&
		    event.queryStringParameters.crc_token != "" ) {

		console.log('got crc_token ' + event.queryStringParameters.crc_token );

		const challenge = getChallengeResponse(event.queryStringParameters.crc_token,process.env.TWITTER_CONSUMER_SECRET);

		console.log('challenge ' + challenge);

		const response = {
                    statusCode: 200,
                    body: JSON.stringify({
			    response_token: 'sha256=' + challenge
		    })
        	};

		console.log(response);

		return response;

	    }

    } else {
	const response = {
                    statusCode: 400,
                    body: JSON.stringify('No CRC token present')
        };

	console.log(response);

	return response;
    }
};
