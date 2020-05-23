'use strict';

const Workbook = require('../../src/workbook');
const chai = require('chai');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

describe('Workbook', function () {
    let title = 'hello';
    let path = '/world';
    let schemaName = '/workbook';
    
    describe('constructor', function() {
        it('should assign unique id', () => {
            let workbook = new Workbook(title, path);
            
            should.exist(workbook.id);
        });
        
        it('should assign title', () => {
            let workbook = new Workbook(title, path);
            
            workbook.title.should.equal(title);
        });
        
        it('should assign path', () => {
           let workbook = new Workbook(title, path);
           
           workbook.path.should.equal(path);
        });
        
        it('should assign default priority', () => {
            let workbook = new Workbook(title, path);
            
            should.exist(workbook.priority);
        });
        
        it('should assign createdAt', () => {
            let pretestTimestamp = Date.now();
            let workbook = new Workbook(title, path);
            
            should.exist(workbook.createdAt);
            expect(workbook.createdAt).to.be.at.least(pretestTimestamp);
        });
        
        it('should assign updatedAt', () => {
            let pretestTimestamp = Date.now();
            let workbook = new Workbook(title, path);
            
            should.exist(workbook.updatedAt);
            expect(workbook.updatedAt).to.be.at.least(pretestTimestamp);
        });
    });
    
    describe('createWorkbookSchema', function() {
        it('should create schema for workbook', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            should.exist(schema);
            schema.id.should.equal(schemaName);
            assert.isArray(schema.required);
        });
        
        it('should require title', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('title');
        });
        
        it('should require id', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('id');
        });
        
        it('should require path', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('path');
        });
        
        it('should require isFlagged', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('isFlagged');
        });
        
        it('should require priority', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('priority');
        });
        
        it('should require createdAt', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('createdAt');
        });
        
        it('should require updatedAt', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            expect(schema.required).to.include('updatedAt');
        });
        
        it('should disallow additional properties', () => {
            let workbook = new Workbook(title, path);
            let schema = workbook.createWorkbookSchema();
            
            schema.additionalProperties.should.be.false;
        });
    });
    
    describe('validate', function() {
        it('should validate with correct title, path and defaults', () => {
            let workbook = new Workbook(title, path);
            let result = workbook.validate();
            
            result.valid.should.be.true;
        });
        
        it('should fail with undefined title', () => {
            let workbook = new Workbook(null, path);
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.title');
        });
        
        it('should fail with undefined path', () => {
            let workbook = new Workbook(title, null);
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.path');
        });
        
        it('should fail with undefined isFlagged', () => {
            let workbook = new Workbook(title, path);
            workbook.isFlagged = null;
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.isFlagged');
        });
        
        it('should fail with undefined priority', () => {
            let workbook = new Workbook(title, path);
            workbook.priority = null;
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.priority');
        });
        
        it('should fail with undefined createdAt', () => {
            let workbook = new Workbook(title, path);
            workbook.createdAt = null;
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.createdAt');
        });
        
        it('should fail with undefined updatedAt', () => {
            let workbook = new Workbook(title, path);
            workbook.updatedAt = null;
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance.updatedAt');
        });
        
        it('should fail when adding new properties', () => {
            let workbook = new Workbook(title, path);
            workbook.hello = 'world';
            let result = workbook.validate();
            
            result.valid.should.be.false;
            should.exist(result.errors);
            result.errors.length.should.equal(1);
            result.errors[0].property.should.equal('instance');
        });
    });
});
