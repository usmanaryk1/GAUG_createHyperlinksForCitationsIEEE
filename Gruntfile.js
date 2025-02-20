'use strict';
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    // Configurable paths for the application
    var config = {
        app: require('./package.json').appPath || 'app',
        name: require('./package.json').name || 'app',
        currentVersion: /(@\$7.0.0\$@)/g,
        targetVersion: '@$7.0.1$@'
    };
    // Define the configuration for all the tasks
    grunt.initConfig({
        // Project settings
        config: config,
        'string-replace': {
            dist: {
                files: [{
                        expand: true,
                        cwd: 'app',
                        src: '**/*',
                        dest: 'app'
                    },
                    {
                        expand: true,
                        cwd: './',
                        src: 'index.html',
                        dest: './'
                    }],
                options: {
                    replacements: [{
                            pattern: '<%= config.currentVersion %>',
                            replacement: '<%= config.targetVersion %>'
                        }]
                }
            }
        }
    });
    grunt.registerTask('build', [
        'string-replace'
    ]);
    grunt.registerTask('default', [
        'build'
    ]);
};
