/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        initData();
        const questionText = getQuestion();
        currentStatus = 'Question';
        const speakOutput = '¡Vale! Vamos a jugar a Trivia de municipios de Tenerife. Tendrás que responder diciendo el municipio de la isla que se corresponde con la pregunta que haré... ¡Empecemos! ' + questionText;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const answerValue = handlerInput.requestEnvelope.request.intent.slots.municipio.value
        let speakOutput = '';
        
        if (currentStatus === 'Continue') {
            speakOutput += 'Responde sí o no'
        }
        else {
            if (currentIndex.answers.includes(answerValue)) {
                speakOutput += '¡Correcto! ' + currentIndex.longAnswer;
                hits++;
            }
            else {
                speakOutput += '¡Lo siento, no has acertado! La respuesta correcta era ' + currentIndex.answers[0] + '. ' + currentIndex.longAnswer;
            }
        }
        
        currentIndex = null;
        speakOutput += '...¿Continuamos?';
        currentStatus = 'Continue';
        
        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const ClueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClueIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (currentStatus === 'Question') {
            speakOutput += 'Ahí va una pista! ... ' + currentIndex.clue + '. ... Te vuelvo a repetir la pregunta. ... ' + getQuestion(false);
        }
        else if (currentStatus === 'Continue') {
            speakOutput += 'Responde Sí o No.';
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        
        if (currentStatus === 'Question'){
            speakOutput += '¡Repito la pregunta! ... ' + getQuestion(false);
        }
        else if (currentStatus === 'Continue') {
            speakOutput += '¿Continuamos?'
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const NextIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NextIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (pending !== null) {
            speakOutput = '¡Ya tienes una pregunta pendiente! Te la repetiré ... ';
            const tmpIndex = currentIndex;
            currentIndex = pending;
            pending = tmpIndex;
            speakOutput += getQuestion(false);
        }
        else {
            speakOutput = '¡De acuerdo! Guardaremos esta pregunta para después. La siguiente pregunta es ...';
            pending = currentIndex;
            speakOutput += getQuestion();
        }
        currentStatus = 'Question';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const PendingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PendingIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (pending === null) {
            if (currentIndex !== null && currentStatus === 'Question') {
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para después ... '; 
                pending = currentIndex;
            }
            speakOutput += '¡No tienes preguntas pendientes! ... ¿Quieres continuar con una nueva pregunta?';
            currentStatus = 'Continue';
        }
        else {
            if (currentIndex !== null && currentStatus === 'Question') {
                let tmpIndex = currentIndex;
                currentIndex = pending;
                pending = currentIndex;
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para después ... '; 
            }
            else {
                currentIndex = pending;
                pending = null;
            }
            
            speakOutput += '¡Vamos con la pregunta que teníamos pendiente! ... ' + getQuestion(false);
            currentStatus = 'Question';
        }


        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const speakOutput = getQuestion();
        currentStatus = 'Question';
        
        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'El juego consistirá en rondas de preguntas tipo trivia acerca de Tenerife y tendrás que responder con el nombre del municipio con el que se corresponde.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Has conseguido acertar ' + hits + ' de ' + count + ' preguntas. ¡Bien jugado!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no entiendo lo que me dices. Por favor inténtalo otra vez.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, tuve problemas para hacer lo que me pediste. Inténtalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


let questionList, currentIndex, count, hits, pending, currentStatus, exit;
function initData() {
    questionList = require('./question-list');
    currentIndex = null;
    count = 0;
    hits = 0;
    pending = null;
    currentStatus = null;
    exit = false;
}

function getRandomItem(obj) {
    if (Object.keys(obj).length === 0) {
        return null;
    }
    currentIndex = obj[Object.keys(obj)[Math.floor(Math.random()*Object.keys(obj).length)]];
    return currentIndex;
}

function getQuestion(random = true){
    let speechText = '';
    if (random) {
        speechText = getRandomItem(questionList);
        if (currentIndex === null && pending === null) {
            return '¡Bien jugado! Has conseguido acertar ' + hits + ' de ' + count + ' preguntas.';
        }
        else if (currentIndex === null) {
            return '¡Todavía te queda una pregunta pendiente! Vamos con ella ... ' + speechText.question;
        }
        delete questionList[currentIndex.id];
        count ++;
    }
    else {
        speechText = currentIndex;
    }
    const speakOutput = speechText.question;
    return speakOutput;
}


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        RepeatIntentHandler,
        NextIntentHandler,
        ClueIntentHandler,
        YesIntentHandler,
        PendingIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        AnswerIntentHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();