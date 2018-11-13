'use strict';

const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();
const fetch = require('node-fetch');

const getData = async url => {
  try {
    const response = await fetch(url);
    const data = await response.buffer();
    return data;
  } catch (error) {
    console.log(error);
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
	if (data.Labels.some( label => label.Name === 'Animal')) {

	let maxSize = 0;
	let result;

	data.Labels.forEach((label,index) => {
		if(label.Parents.length > maxSize ) {
			maxSize = label.Parents.length;
			result = label.Name;
		}
	});

	console.log( maxSize + ' ' + result );

	const matchingLabel = data.Labels.find( label => label.Name === result );

        console.log(matchingLabel.Name + ' ' + matchingLabel.Parents);
//	console.log('Result is ' + data.Labels[result].Name + ' ' + data.Labels[result].Parents.length);

	var response = {
        	statusCode: 200,
        	body: JSON.stringify(matchingLabel.Name)
    	};
        
        console.log(JSON.stringify(data));
        return resolve(response);

	} else {
		var response = {
                statusCode: 200,
                body: JSON.stringify('Sorry that picture is not of an animal')
		};
		console.log(JSON.stringify(data));
		return resolve(response);		
	}
      });
    });
};


exports.animalbot = async (event) => {
  console.log(event);

  const jsonBody = JSON.parse(event.body)
  const imageData = await getData(jsonBody.url);
  return getAnimalFromRekognitionService(imageData);
};
