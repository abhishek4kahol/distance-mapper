const Alexa = require('ask-sdk');
const cities_json = require('./in_cities.json');
const { get } = require('https');
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
    let origin = handlerInput.requestEnvelope.request.intent.slots.start.value.toLowerCase();
    let destination = handlerInput.requestEnvelope.request.intent.slots.end.value.toLowerCase();
    if (origin && destination) {
      if (origin === destination) {
        speakOutput = 'think out of your city.';
      } else {
        let orginDetails = cities_json[origin];
        let destinationDetails = cities_json[destination]

        if (orginDetails && destinationDetails) {
          const url = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=' + orginDetails.latitude
            + ',' + orginDetails.longitude + '&destinations=' + destinationDetails.latitude + ',' +
            destinationDetails.longitude + '&travelMode=driving&key=' + API_key
          console.log('here we are');
          try {
            let data = await getRemoteData(url);
            let result = data.resourceSets[0].resources[0].results[0];
            speakOutput = 'The distance between ' + origin + ' and ' + destination + ' is ' + result.travelDistance + ' Kilometers.';
          } catch (error) {
            speakOutput = error;
          }
        } else {
          speakOutput = 'I don\'t have data about that, will collect in sometime.';
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
    get(url, (response) => {
      if (response.statusCode === 200) {
        let body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => {
          let res = body.join('');
          resolve(JSON.parse(res));
        })
      } else {
        reject('please try again.');
      }
    });
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

