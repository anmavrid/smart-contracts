'use strict';

var config = require('./config.default');

config.server.port = 9001;
config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_tests';

module.exports = config;