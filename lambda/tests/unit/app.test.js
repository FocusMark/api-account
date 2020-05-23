'use strict';

const App = require('../../src/app');
const Command = require('../../src/command');
const Workbook = require('../../src/workbook');

const AWS = require('aws-sdk');
const sinon = require('sinon');
const chai = require('chai');

const expect = chai.expect;
const should = chai.should();

describe('App', function () {
    const configuration = { messageBus: { topic: 'fake-topic' } };
    
    describe('constructor', function() {
       let event = { body: {} };
       let messageBus = { };
       let configuration = { };
       const app = new App(messageBus, configuration, event);
       
       it('should assign Lambda event', () => {
          should.exist(app.httpEvent);
       });
       
       it('should assign SNS message bus', () => {
           should.exist(app.messageBus);
       });
       
       it('should assign Lambda Configuration', () => {
           should.exist(app.configuration);
       });
    });
    
    describe('validateCommand', function() {
        const app = new App(null, null, null);
       
        it('should throw when missing domain parameter for Content-Type header', () => {
            let headers = { 'Content-Type': 'application/json' };
            should.throw(() => app.validateCommand(headers));
        });
        it('should throw when using incorrect command', () => {
            let headers = { 'Content-Type': 'application/json;domain-model=invalid-command' };
            should.throw(() => app.validateCommand(headers));
        });
        it('should return valid command from Content-Type Header', () => {
            let headers = { 'Content-Type': `application/json;domain-model=${Command.CREATE_WORKBOOK}` };
            let command = app.validateCommand(headers);
            command.should.equal(Command.CREATE_WORKBOOK);
        });
    });
    
    describe('getDomainModelParameter', function() {
        const app = new App(null, null, null);
        
        it('should throw when missing any headers', () => {
            should.throw(() => app.getDomainModelParameter(null));
        });
        
        it('should throw when missing domain-model parameter', () => {
            let headers = { 'Content-Type': 'application/json' };
            should.throw(() => app.getDomainModelParameter(headers));
        });
        
        it('should return domain-model parameter when it exists', () => {
            let headers = { 'Content-Type': `application/json;domain-model=${Command.CREATE_WORKBOOK}` };
            let domainModelParameter = app.getDomainModelParameter(headers);
            domainModelParameter.should.equal(`domain-model=${Command.CREATE_WORKBOOK}`);
        });
    });
    
    describe('createWorkbookFromRequest', function() {
        const app = new App(null, null, null);
        let request = { title: 'hello world', path: '/' };
        
        it('should return Workbook', () => {
            let workbook = app.createWorkbookFromRequest(request);
            should.exist(workbook);
        });
        
        it('should return Workbook with title', () => {
            let workbook = app.createWorkbookFromRequest(request);
            workbook.title.should.equal(request.title);
        });
        
        it('should return Workbook with path', () => {
            let workbook = app.createWorkbookFromRequest(request);
            workbook.path.should.equal(request.path);
        });
    });
    
    describe('validateWorkbook', function() {
        const app = new App(null, null, null);
        
        it('should throw on invalid Workbook', () => {
            let workbook = { };
            should.throw(() => app.validateWorkbook(workbook));
        });
    });
    
    describe('publishWorkbook', function() {
        const snsMock = sinon.stub(new AWS.SNS());
        this.afterEach(sinon.reset);
        
        const workbook = new Workbook('hello world/foo bar', '/');
        let snsResults = { 'boop':'deeboop' };
        let context = { functionName: 'martha-lambda' };
        const app = new App(snsMock, configuration, null, context);
        
        it('should return 201 Response object on success.', async () => {
            snsMock.publish.returns({ promise: sinon.fake.resolves(snsResults)});
            let response = await app.publishWorkbook(workbook);
            
            response.statusCode.should.equal(201);
            should.exist(response.headers);
            should.exist(response.headers.Location);
            should.exist(response.headers['Content-Type']);
            response.headers.Location.should.equal(`/workbook/${workbook.id}`);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
            body.isSuccessful.should.equal(true);
        });
        
        it('should return 500 Response object on SNS failure.', async () => {
            snsMock.publish.returns({ promise: sinon.fake.throws('Mocked error thrown to test SNS failure response object.')});
            let response = await app.publishWorkbook(workbook);
            
            response.statusCode.should.equal(500);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
            body.isSuccessful.should.equal(false);
        });
    });
    
    describe('run', function() {
        const messageBus = sinon.stub(new AWS.SNS());
        this.afterEach(sinon.reset);
        
        let snsResults = { 'boop':'deeboop' };
        
        let request = { title: 'hello world', path: '/' };
        var headers = { 'Content-Type': 'application/json' };
        let event = { headers: headers };
        let context = { functionName: 'martha-lambda' };
        const app = new App(messageBus, configuration, event, context);
        
        it('returns 404 response on invalid domain-model command', async () => {
            let response = await app.run(request);
            
            response.statusCode.should.equal(404);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
            body.isSuccessful.should.equal(false);
        });
        
        it('returns 422 response on invalid entity command', async () => {
            headers['Content-Type'] = `application/json;domain-model=${Command.CREATE_WORKBOOK}`;
            let response = await app.run({ });
            
            response.statusCode.should.equal(422);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
            body.isSuccessful.should.equal(false);
        });
        
        it('returns 201 response on successful execution of command', async () => {
            messageBus.publish.returns({ promise: sinon.fake.resolves(snsResults)});
            headers['Content-Type'] = `application/json;domain-model=${Command.CREATE_WORKBOOK}`;
            let response = await app.run(request);
            
            response.statusCode.should.equal(201);
            should.exist(response.headers);
            should.exist(response.headers.Location);
            
            expect(response.body).to.be.an('string');
            let body = JSON.parse(response.body);
            should.exist(response.body);
            body.isSuccessful.should.equal(true);
        });
    });
});
