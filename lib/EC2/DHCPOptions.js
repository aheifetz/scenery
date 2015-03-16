// Copyright 2015 OpenWhere, Inc.
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

var AWSClass = require('../AWSClass.js');
var Taggable = require('../Taggable.js');
var aws_properties_resource_tags = require('../properties/aws_properties_resource_tags.js');

var propertyMap = {'DomainName': {'list': false, 'type': 'string'},
 'DomainNameServers': {'list': true, 'type': 'string'},
 'NetbiosNameServers': {'list': true, 'type': 'string'},
 'NetbiosNodeType': {'list': true, 'type': 'Example"NetbiosNode"2'},
 'NtpServers': {'list': true, 'type': 'string'},
 'Tags': {'list': false, 'type': aws_properties_resource_tags}};

var Class = function (id) {
    return Taggable.call(this, id, 'AWS::EC2::DHCPOptions', {});
};
require('util').inherits(Class, Taggable);

Class = AWSClass.registerPropertyPrototypes(Class, propertyMap);
module.exports = Class;