module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-exec');

    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
    });

    var AppUploader = require('./app-uploader.js');
    
    var request = require('request');

    grunt.registerTask('publish', 'Publish IPA and APK', function(mode) {
        var done = this.async();
        var publishAddress = 'http://localhost:3000/api/apps/upload'; //THIS IS THE ENKAN SERVER'S URL
        var publishedFiles = ["./xxxx.ipa"];
        var publishedFiles = ["./xxxx.ipa"];
        AppUploader.startPublish(publishAddress, publishedFiles);     
    });

};
