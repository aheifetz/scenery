// Copyright 2014 OpenWhere, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var Walk = require('walk');
/**
 * An object responsible for mapping all Resource classes exposed by the
 * Scenery module and mapping them to the AWS monikers
 **/

function Registry() {
    // Build a list of resources in the project
    var files = [];
    var walkOptions = {
        listeners: {
            file: function(root, fileStats, next){
                var extension = fileStats.name.slice(-3);
                if('.js' === extension){
                    files.push(root + '/' + fileStats.name);
                }
                next();
            },
            errors: function(root, nodeStatsArray, next){
                console.log('Error walking dir:', nodeStatsArray);
                next();
            }
        },
        followLinks: false
    };
    var walker = Walk.walkSync(__dirname, walkOptions);

    // Build a map of AWS Types to Scenery Classes
    this.awsClassMap = {};
    var classesToIgnore = [
        'Module',       // Scenery class not registered with AWS
        'Registry',     // This class; avoid recursive requires
        'Resource',     // Scenery class not registered with AWS
        'Template',     // Registry used in this class; avoid recursive requires
        'Validator'     // Scenery class not registered with AWS
    ];

    for(var index in files){
        // Ignore certain classes
        var file  = files[index];
        var className = file.substr(file.lastIndexOf('/') + 1).split('.')[0];
        if(classesToIgnore.indexOf(className) !== -1){
            continue;
        }

        var AWSClass = require(file);
        var awsObject = new AWSClass();
        if(awsObject.node && awsObject.node.Type){
            var awsMoniker = awsObject.node.Type;
            this.awsClassMap[awsMoniker] = AWSClass;
        }
    }
}

Registry.prototype.getClass = function(awsMoniker) {
    return this.awsClassMap[awsMoniker];
};

module.exports = Registry;
