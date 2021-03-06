'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs-extra');
var path = require('path');
var cc = require('change-case');

module.exports = yeoman.generators.Base.extend({
  // note: arguments and options should be defined in the constructor.
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
  },

  /**
   * Running context priorities
   * http://yeoman.io/authoring/running-context.html
   */
  initializing: function () {    
    this.settings = {
      phpNamespace: cc.pascalCase(this.appname),
      phpClassName: cc.pascalCase(this.appname) + 'Command', // PHP file and classname (with the 'Command' suffix)
      commandNamespace: cc.paramCase(this.appname), // command namespace, e.g. foobar:example (foobar)
      commandName: cc.paramCase('example'), // command name, e.g. foobar:example (example)
      appName: cc.titleCase(this.appname), // app name used in composer and app settings
      appVersion: '1.0', // app version used in composer and app settings
      entrypointName: cc.paramCase(this.appname), // app entry point / php executable
    };
  },

  prompting: function () {    
    var done = this.async();

    var prompts = [
    {
      type    : 'input',
      name    : 'username',
      message : 'What\'s your Github username',
      default: 'vendor'
    }];


    this.prompt(prompts, function (props) {
      this.props = props;

      done();
    }.bind(this));
  },

  configuring: function () {    
    this.fs.copyTpl(
      this.templatePath('_composer.json'),
      this.destinationPath('composer.json'), 
      { 
        VENDOR_NAME: this.props.username,
        PROJECT_NAME: this.settings.entrypointName,
        PHP_NAMESPACE: this.settings.phpNamespace,
        APPLICATION_VERSION: this.settings.appVersion,
      }
    );

    this.fs.copyTpl(
      this.templatePath('_README.md'),
      this.destinationPath('README.md'), 
      { 
        APPLICATION_NAME: this.settings.appName,
        COMMAND_NAMESPACE: this.settings.commandNamespace,
        COMMAND_NAME: this.settings.commandName,
        PROJECT_NAME: this.settings.entrypointName
      }
    );
  },

  writing: function () {    
    this.fs.copyTpl(
      this.templatePath('_app'),
      this.destinationPath(this.settings.entrypointName), 
      { 
        PHP_NAMESPACE: this.settings.phpNamespace,
        APPLICATION_NAME: this.settings.appName,
        APPLICATION_VERSION: this.settings.appVersion,
        PHP_CLASSNAME: this.settings.phpClassName
      }
    );

    this.fs.copyTpl(
      this.templatePath('src/Command/StubCommand.php'),
      this.destinationPath('src/Command/' + this.settings.phpNamespace + '/' + this.settings.phpClassName + '.php'), 
      { 
        PHP_NAMESPACE: this.settings.phpNamespace,
        PHP_CLASSNAME: this.settings.phpClassName,
        COMMAND_NAMESPACE: this.settings.commandNamespace,
        COMMAND_NAME: this.settings.commandName,
        COMMAND_DESCRIPTION: 'The command description goes here',
        COMMAND_HELP: 'The command help text goes here'
      }
    );
  },

  install: function () {
    if(typeof this.options.skipInstall === 'undefined') {
      this.spawnCommand('composer', ['install'])
        .on('exit', function (err) {
          if(err === 0) {
            this.log.write('Scaffolding complete. Run your app by calling ');
            this.log.write(chalk.green('php ' + this.settings.entrypointName + '\n'));
            this.log.write(chalk.white('Don\'t forget to update the README.md and the rest of the composer.json settings (author, description etc).' + '\n'));
          }
        }.bind(this));    
      }
  },

});
