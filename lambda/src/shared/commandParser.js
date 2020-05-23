class CommandParser {
    
    constructor(lambdaEvent) {
        this.supportedCommands = {
            signUp: 'create-user',
        };
        this.headers = lambdaEvent.headers;
        this.validateCommand();
    }
    
    validateCommand() {
        let domainParameterKeyValue;
        try {
            let domainModelParameter = this.getDomainModelParameter(this.headers);
             domainParameterKeyValue = domainModelParameter.split('=');
        } catch(err) {
            console.error(err);
            throw 'Unable to find the domain-model parameter on Content-Type header.';
        }

        if (domainParameterKeyValue.length != 2) {
            throw 'Command not specified on the domain-model Content-Type parameter.'
        } 
        
        let command = domainParameterKeyValue[1]; 
        if (command != this.supportedCommands.signUp) {
            throw `The ${command} provided is not supported.`;
        }
        
        this.command = command;
    }
    
    getDomainModelParameter() {
        console.info('Validating domain parameter in Content-Type header');
        if (!this.headers) {
            console.error('No heaers were found on the request');
            throw 'Malformed HTTP request made. Required headers are missing.';
        }

        // API Gateway custom domains changes the casing to lowercase from the original request
        // for some reason despite it being documented as a passthrough header with no remapping being done.
        // This does not happen when invoking the API from the API Gateway endpoint itself. Just the custom domain endpoints.
        // We check for lowercase first since we know custom domains behaves this way and so this is the behavior to expect
        // during production. SAM and API Gateway for local debugging accepts it as 'Content-Type'.
        let contentTypeHeader = this.headers['content-type'];
        if (!contentTypeHeader) {
            contentTypeHeader = this.headers['Content-Type'];
        }
        
        let domainModelParameter = contentTypeHeader
            .split(';')
            .filter(element => element.includes('domain-model='));
            
        if (domainModelParameter.length == 0) {
            throw 'domain-model parameter is required on Content-Type.';
        }
        
        return domainModelParameter[0];
    }
}

module.exports = CommandParser