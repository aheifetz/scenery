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

/**
 * Attempt to create a template containing an elasticache instance.
 **/
var Template = require('../lib/Template.js');
var Validator = require('../lib/Validator.js');

exports.testElasticache = function(test){
    // Create the template
    var t = new Template();
    var filePath = '/tmp/elasticache_test_template.json';

    t.elastiCacheCluster('TestECC')
        .autoMinorVersionUpgrade('true')
        .cacheNodeType('cache.m3.medium')
        .engine('memcached')
        .numCacheNodes(1);

    t.save(filePath);

    // Validate the template
    test.expect(2);

    function validationCallback(isValid, message){
        test.ok(isValid);
        test.ok(!!message);
        test.done();
    }

    var v = new Validator(filePath, __dirname + '/../config.json');
    v.validate(validationCallback);
};
