'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

function getChallengeResponse(crc_token, consumer_secret) {
        return crypto.createHmac('sha256', consumer_secret).update(crc_token).digest('base64')
}

exports.animalbot = async (event) => {

    if(event.queryStringParameters !== null event.queryStringParameters !== undefined) {
	    if(event.queryStringParameters.crc_token !== undefined &&
		    event.queryStringParameters.crc_token !== null &&
		    event.queryStringParameters.crc_token != "" ) {

		const challenge = getChallengeResponse(event.queryStringParameters.crc_token,"");

		const response = {
                    statusCode: 200,
                    body: {
			    response_token: challenge
		    }
        	};

	    }

    } else {
	const response = {
                    statusCode: 400,
                    body: JSON.stringify('No CRC token present')
        };

	return response;
    }
};
