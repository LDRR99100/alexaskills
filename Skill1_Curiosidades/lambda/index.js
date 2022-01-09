const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return GetFactIntentHandler.handle(handlerInput);
    }
};
const GetFactIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'GetFactIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent');
    },
    handle(handlerInput) {
        
        const speechText = getRandomItem(CURIOSIDADES);
        return handlerInput.responseBuilder
            .speak(speechText + getRandomItem(PREGUNTAS))
            .reprompt(getRandomItem(PREGUNTAS))
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = '¡Pídeme una curiosidad!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speechText = '¡Adiós!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = 'Perdona, hubo un error. Por favor inténtalo otra vez';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

function getRandomItem(array) {
    return array[Math.floor(Math.random()*array.length)]
}

const CURIOSIDADES = [ 
  'Con una duración de 45 minutos (aproximadamente), la Guerra Anglo-Zanzibariana es la guerra más corta registrada en la historia. La batalla fue protagonizada por el Reino Unido y Zanzíbar el 27 de agosto de 1896.', 
  'Crisipo de Solos, filósofo griego, estaba viendo a un burro comer algunos higos y exclamó: «Ahora dale al burro una copa de vino puro para acompañar los higos», tras lo cual murió en un ataque de risa. ',
  'Cuando a Diógenes de Sinope le invitaron a una lujosa mansión le advirtieron de no escupir en el suelo, acto seguido le escupió al dueño, diciendo que no había encontrado otro sitio más sucio.',
  'La oreja de Van Gogh en realidad fue cortada cuando el pintor tuvo una discusión con un maestro de esgrima.',
  'Genghis Khan mató a su hermano cuando tenía 10 años porque no quería compartir su comida.',
  'Fidel Castro sobrevivió a más de 600 intentos de asesinato. ',
  'No fue Cristobal Colón, sino el vikingo Leif Erikson el primer europeo en descubrir América en el siglo X. ',
  'Cuando Alejandro Magno llegó a Egipto, las Pirámides eran tan antiguas como para nosotros lo es Alejandro Magno.',
  'El Papa Gregorio IX le declaró la guerra a los gatos negros.',
  'La Universidad de Oxford es más antigua que el Imperio Azteca. ',
  'El ketchup se empezó a vender en el siglo XVIII como medicina. ',
  'Drogas como la heroína o la cocaína se solía vender como jarabe para niños. '
];

const PREGUNTAS = [
  '¿Quieres otra?',
  '¿Quieres otra curiosidad?',
  '¿Te gustaría saber más?',
  '¿Quieres saber la siguiente?',
  '¿Quieres la siguiente curiosidad?',
  '¿Te digo otra?',
  '¿Te digo la siguiente?',
  '¿Te digo otra curiosidad?',
  '¿Te digo la siguiente curiosidad?'
];

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetFactIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();