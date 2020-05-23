let AWSXRay = require('aws-xray-sdk');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));
let crypto = require('crypto');

let Response = require('./shared/response');
let CommandParser = require('./shared/commandParser');
let DomainCommands = require('./shared/domainCommands');

class HttpUserPost {
    
    /**
     *
     * Represents the app logic that the Lambda needs to execute.
     * @constructor
     * @param {object} identityService - The Amazon Cognito service used to interact with the Identity platform.
     * @param {object} configuration - An instance of {@link WorkbookConfiguration} containing message bus topic details.
     * @param {object} event - An instance representing the {@link https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format|AWS API Gateway request event}.
     * @param {object} context - The {@link https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html|environment context} in which this Lambda is executing under.
     * 
     */
    constructor(identityService, configuration, event, context) {
        this.httpEvent = event;
        this.configuration = configuration;
        this.identityService = identityService;
        this.context = context;
    }
    
    async run(request) {
        console.info('Running http-post request app.');
        try {
            let parser = new CommandParser(this.httpEvent);
            this.command = parser.command;
        } catch(err) {
            console.info('Failed to parse command.');
            return new Response(404, null, err.message);
        }
        
        return await this.routeCommand(request);
    }
    
    async routeCommand(request) {
        switch(this.command) {
            case DomainCommands.createUser:
                console.info(`Running ${this.command} code branch.`);
                return await this.createUser(request.username, request.email.toLowerCase(), request.password, request.client_id, request.client_secret);
                
            default:
                return new Response(404, null, 'Invalid or missing domain command');
        }
    }
    
    async createUser(username, email, password, clientId, clientSecret) {
        let validationResult = this.validateNewUser(username, email, password, clientId, clientSecret);
        if (validationResult !== null) {
            return validationResult;
        }
        
        let params = this.createSignUpParameters(username, email, password, clientId, clientSecret);
        
        try {
            console.info('Performing SignUp with Cognito');
            let request = this.identityService.signUp(params).promise();
            let response = await request;
            console.info('SignUp completed.');
            return new Response(201, 'Signup completed. Confirmation required.');
        } catch(err) {
            console.info('SignUp failed. Handling error.');
            console.error(err);
            return this.processSignUpError(err, username);
        }
    }
    
    processSignUpError(err, username) {
        if (err.code === 'InvalidPasswordException') {
            return new Response(422, null, err.message);
        } else if (err.code === 'UsernameExistsException') {
            console.error(`Attempt made to sign-up username ${username} when it already exists.`);
            return new Response(201, 'Signup completed. Confirmation required.');
        } else if (err.code === 'InvalidParameterException') {
            return new Response(422, null, err.message);
        }
        
        return new Response(500, null, 'Identity could not process the request at this time.');
    }
    
    createSignUpParameters(username, email, password, clientId, clientSecret) {
        console.info('Creating parameters')
        let secretHash = this.createSecretHash(username, clientId, clientSecret);
        
        return {
            ClientId: clientId,
            Password: password,
            Username: username,
            SecretHash: secretHash,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                }
            ],
        };
    }
    
    validateNewUser(username, email, password, clientId, clientSecret) {
        if (!username) {
            return new Response(422, null, 'Field "username" is missing.');
        } else if (!password) {
            return new Response(422, null, 'Field "password" is missing.');
        } else if (!email) {
            return new Response(422, null, 'Field "email" is missing.');
        } else if (!clientId || !clientSecret) {
            return new Response(422, null, 'Client information missing.');
        }
        
        console.info('New User validation successful.');
        return null;
    }
    
    createSecretHash(username, clientId, clientSecret) {
        let hmac = crypto.createHmac("sha256", clientSecret);
        let hash = hmac.update(username + clientId);
        let secretHash = hash.digest("base64");

        return secretHash;
    }
}

module.exports = HttpUserPost;