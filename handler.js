'use strict';

const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

function getAnimalFromRekogitionService() {
     const params = {
      Image: {
        S3Object: {
          Bucket: "noservernovember-animal-bot-pics",
          Name: "german.jpg",
        },
      },
      MaxLabels: 100,
      MinConfidence: 90,
    };
 
    return new Promise((resolve, reject) => {
      rek.detectLabels(params, (err, data) => {
        if (err) {
          return reject(new Error(err));
        }
        
        console.log(JSON.stringify(data));
        //console.log('Analysis labels:', data.Labels);
        return resolve(data.Labels);
      });
    });
}


exports.animalbot = async (event) => {
  return getAnimalFromRekognitionService();
};
