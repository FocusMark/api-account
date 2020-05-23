'use strict';

const Response = require('../../src/response');
const chai = require('chai');

const expect = chai.expect;
const should = chai.should();

describe('Response', function () {
    describe('constructor', function() {
        let statusCode = 201;
        let data = { foo: 'bar' };
        let errors = data.foo;
        let createdLocation = '/foobar';
        let contentType = 'application/json';
        
        it('should assign status code', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            response.statusCode.should.equal(statusCode);
        });
        
        it('should assign body', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
        });
        
        it ('should assign data to body', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(body.data);
        });
        
        it ('should assign errors to body', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(body.errors);
        });
        
        it ('should assign report successful', () => {
            let response = new Response(statusCode, data, null, createdLocation);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            body.isSuccessful.should.equal(true);
        });
        
        it ('should assign report failure', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            body.isSuccessful.should.equal(false);
        });
        
        it('should assign Content-Type header by default', () => {
            let response = new Response(statusCode, data, errors, null);
            
            response.headers['Content-Type'].should.equal(contentType);
        });
        
        it('should assign Content-Type header with Location header', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            response.headers['Content-Type'].should.equal(contentType);
        });
        
        it('should assign Location header', () => {
            let response = new Response(statusCode, data, errors, createdLocation);
            
            response.headers.Location.should.equal(createdLocation);
        });
    });
});
