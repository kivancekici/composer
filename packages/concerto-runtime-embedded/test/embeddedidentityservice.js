/*
 * IBM Confidential
 * OCO Source Materials
 * IBM Concerto - Blockchain Solution Framework
 * Copyright IBM Corp. 2016
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */

'use strict';

const IdentityService = require('@ibm/concerto-runtime').IdentityService;
const EmbeddedIdentityService = require('..').EmbeddedIdentityService;

const should = require('chai').should();
const sinon = require('sinon');

describe('EmbeddedIdentityService', () => {

    let identityService;
    let sandbox;

    beforeEach(() => {
        identityService = new EmbeddedIdentityService();
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#constructor', () => {

        it('should create a identity service', () => {
            identityService.should.be.an.instanceOf(IdentityService);
        });

    });

    describe('#getCurrentUserID', () => {

        it('should return null', () => {
            should.equal(identityService.getCurrentUserID(), null);
        });

    });

});
