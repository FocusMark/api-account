class Configuration {
    /**
     * 
     * @constructor
     * Creates a new instance of a configuration object for message bus event services and AWS region.
     * 
     */
    constructor() {
        this.awsRegion = process.env.AWS_REGION;
        
        this.deployedEnvironment = process.env.deployed_environment;
        this.userPoolIdSSMPath = process.env.user_pool_id_ssm_path;
        this.clientIdSSMPath = process.env.identity_client_id_ssm_path;
        this.clientSecretSSMPath = process.env.identity_client_secret_ssm_path;
    }
}

module.exports = Configuration;