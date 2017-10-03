'use strict';

var config = require('./config.webgme'),
    path = require('path'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
// config.server.port = 8080;
// config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_my_app';
config.requirejsPaths['widgets/DiagramDesigner'] =
    './src/visualizers/widgets/DiagramDesigner';

config.requirejsPaths['scsrc'] = './src';
//config.visualization.svgDirs = ['./src/svgs'];
config.visualization.svgDirs.push(path.join(__dirname, '../src/svgs'));
config.seedProjects.defaultProject = 'SC';
config.plugin.allowServerExecution = true;
config.client.defaultConnectionRouter = 'basic';
validateConfig(config);
module.exports = config;
