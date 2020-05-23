class Response {
    /**
     * 
     * @constructor
     * @param {number} - The HTTP status code that this Response needs to represent.
     * @param {data} - The data that will represent a HTTP response body.
     * @param {errors} - Any errors that need to be returned as part of the HTTP response body.
     * @param {createdLocation} - A location header value.
     * 
     */
    constructor(statusCode, data, errors, createdLocation) {
        this.body = JSON.stringify({
            data: data,
            errors: errors,
            isSuccessful: errors ? false : true,
        });
        
        this.statusCode = statusCode;
        this.headers = {
            'Content-Type': 'application/json',
        };
        
        if (createdLocation) {
            this.headers['Location'] = createdLocation;
        }
    }
}

module.exports = Response;

class ClientSecretHash {
    constructor(clientId, clientSecret, username) {
        
        if (!clientId || !clientSecret || !username) {
            this.secretHash = null;
            return;
        }
        
        let hash = [];
    }
}