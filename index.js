const Alexa = require('ask-sdk');
const cities_json = require('./in_cities.json');

const API_key = 'should -contain-your-bing-api-key';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Distancer. You can search distance between two different cities in India.';

    return handlerInput.responseBuilder
      .speak(speakOutput) 
      .getResponse();
  },
};

const HelloHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloIntent';
  },
  handle(handlerInput) {

    const speakOutput = 'Hi ! Welcome to Distancer. You can search distance between two different cities in India.';

    return handlerInput.responseBuilder
      .speak(speakOutput) 
      .getResponse();
  },
};

const DistanceHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'DistanceIntent');
  },
  async handle(handlerInput) {

    let speakOutput = '';
    let origin = handlerInput.requestEnvelope.request.intent.slots.start.value;
    let destination = handlerInput.requestEnvelope.request.intent.slots.end.value;
    if (origin && destination) { 
      
      if(origin === destination) {
      
        speakOutput = 'think out of your city.';
      } else {
        
        const cities = [origin.toLowerCase(), destination.toLowerCase()];
        let count = 0;
        const citiesDetails = [];
        
        for (var key in cities_json) {
          if (key === cities[0]) {
            count++;
            citiesDetails.push(cities_json[key]);
          }
          if(key === cities[1]) {
            count++;
            citiesDetails.push(cities_json[key]);
          }
          if (count === 2) {
            break;
          }
        }
        if(count !== 2) {
          speakOutput = 'I don\'t have data about that, will collect in sometime.';
        }  else {
          let DistanceObject = {
          "origins": [{
            "latitude": citiesDetails[0].latitude,
            "longitude": citiesDetails[0].longitude
          }],
          "destinations": [{
            "latitude": citiesDetails[1].latitude,
            "longitude": citiesDetails[1].longitude
          }],
          "travelMode": "driving"
        };
        const url = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins='+DistanceObject.origins[0].latitude
        +','+DistanceObject.origins[0].longitude+'&destinations='+DistanceObject.destinations[0].latitude+','+
        DistanceObject.destinations[0].longitude+'&travelMode=driving&key='+ API_key
        await getRemoteData(url)
        .then((response) => {
          let data = JSON.parse(response);
          let result = data.resourceSets[0].resources[0].results[0];
          speakOutput = 'The distance between ' + origin + ' and ' + destination + ' is '+ result.travelDistance.toFixed(2) + ' Kilometers.';
        })
        .catch((err) => {
          speakOutput = err.message;
        }); 
        }
      }
    } else {
      speakOutput = 'some problem in taking the input.please try agin wih valid input.';
    }   
    return handlerInput.responseBuilder
      .speak(speakOutput) 
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const CancelAndStopHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(error.trace);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode === 200) {
        let body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      } else {
        reject ('please try again.');
      }
    });
    request.on('error', (err) => reject(err));
  });
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    DistanceHandler,
    HelloHandler,
    HelpHandler,
    CancelAndStopHandler,
    SessionEndedRequestHandler
  	
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

