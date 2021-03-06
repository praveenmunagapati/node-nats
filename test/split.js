/*
 * Copyright 2013-2018 The NATS Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
/* global describe: false, before: false, after: false, it: false */
'use strict';

var NATS = require('../'),
    nsc = require('./support/nats_server_control'),
    should = require('should');

describe('Split Messages', function() {

    var PORT = 1427;
    var server;

    // Start up our own nats-server
    before(function(done) {
        server = nsc.start_server(PORT, done);
    });

    // Shutdown our server
    after(function(done) {
        nsc.stop_server(server, done);
    });

    it('should properly handle large # of messages from split buffers', function(done) {
        var nc = NATS.connect(PORT);

        var data = 'Hello World!';
        var received = 0;
        var expected = 10000;

        nc.subscribe('foo', function(msg) {
            should.exists(msg);
            msg.should.equal(data);
            msg.length.should.equal(data.length);
            received += 1;
            if (received == expected) {
                nc.close();
                done();
            }
        });

        for (var i = 0; i < expected; i++) {
            nc.publish('foo', data);
        }
    });

    it('should properly handle large # of utf8 messages from split buffers', function(done) {
        var nc = NATS.connect(PORT);

        // Use utf8 string to make sure encoding works too.
        var data = '½ + ¼ = ¾';
        var received = 0;
        var expected = 10000;

        nc.subscribe('foo', function(msg) {
            msg.should.equal(data);
            msg.length.should.equal(data.length);
            received += 1;
            if (received == expected) {
                done();
            }
        });

        for (var i = 0; i < expected; i++) {
            nc.publish('foo', data);
        }
    });

});
