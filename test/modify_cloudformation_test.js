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
 * Create a CloudFormation template with the following:
 *  + Two EC2 instances
 *  + One ElastiCache cluster with a single node
 *  + An Elastic Load Balancer
 *  + Two security groups
 *      - One for the EC2 instances
 *      - One for the ElastiCache cluster
 *  + A VPC to which the EC2 instances belong (and therefore do NOT use the security group)
 *
 *  Save it out to a template, and then read it back in, asserting that the
 *  loaded template equals the one initially created. Then modify the new
 *  template, and assert that the original values are no longer present in the
 *  modified version.
 **/

var Template = require('../lib/Template.js');
var Validator = require('../lib/Validator.js');
var filePath = '/tmp/modify_cf_test.json';
var t = new Template();

exports.createOriginalTemplate = function(test){

    // Create Parameters
    t.strParam('CacheType', 'cache.m3.medium', 'Type of cache instance to add to the ElastiCache cluster');
    t.strParam('EC2InstanceType', 'c3.large', 'Type of EC2 Instance to launch');
    t.strParam('EC2InstanceAMI', 'ami-6aff5e02', 'AMI Instance ID to use for the EC2 instances');
    t.strParam('KeyName', null, 'Name of the EC2 Keypair to enable SSH access to the boxes');
    t.strParam('OpenCidrIp', '0.0.0.0/0');

    var webServerPort = 80;
    t.numParam('RDPPort', 3389);
    t.numParam('WebServerPort', webServerPort);

    // Create EC2 Instances
    var instanceIds = [];
    for(var i=0; i<2; i++){
        instanceIds.push('loadBalacnedEc2Instance' + i);
    }

    for(var j in instanceIds){
        t.ec2Instance(instanceIds[j])
            .keyName( t.ref('KeyName') )
            .imageId( t.ref('EC2InstanceAMI') )
            .instanceType( t.ref('EC2InstanceType') )
            .securityGroups( t.ref('InstanceSecurityGroup') );
    }

    // Create the load balancer (for the ec2 instances)
    var lbHealth = {
        'Target': 'HTTP:' + webServerPort + '/',
        'HealthyThreshold': '3',
        'UnhealthyThreshold': '5',
        'Interval': '30',
        'Timeout': '5'
    };
    t.loadBalancer('ec2LoadBalancer')
        .availabilityZones()
        .healthCheck(lbHealth)
        .instances(instanceIds)
        .listeners({
          'LoadBalancerPort' : '80',
          'InstancePort' : { 'Ref' : 'WebServerPort' },
          'Protocol' : 'HTTP'
        });

    // Create Elasticache Cluster
    var eccName = 'TestECC';
    t.elastiCacheCluster(eccName)
        .autoMinorVersionUpgrade('true')
        .cacheNodeType( t.ref('CacheType') )
        .clusterName(eccName)
        .engine('memcached')
        .numCacheNodes(1)
        .vpcSecurityGroupIds( t.fnGetAtt('CacheSecurityGroup', 'GroupId') );

    // Create Security Groups
    t.securityGroup('InstanceSecurityGroup', 'Security Group for the EC2 Instances')
        .tcpIn({ 'CidrIp': t.ref('OpenCidrIp')}, t.ref('WebServerPort'), t.ref('RDPPort'));
    t.securityGroup('CacheSecurityGroup', 'Security Group for the ElastiCache Cluster')
        .tcpIn({'SourceSecurityGroupName': t.ref('InstanceSecurityGroup')}, 11211);

    t.save(filePath);

    // Validate the template
    test.expect(2);

    function validationCallback(isValid, message){
        if(!isValid){
            console.log(message);
        }
        test.ok(isValid);
        test.ok(!!message);
        test.done();
    }

    var v = new Validator(filePath, __dirname + '/../config.json');
    v.validate(validationCallback);
};

exports.testLoadedTemplate = function(test){
    test.expect(1);
    var newTemplate = Template.parse(filePath);
    test.deepEqual(newTemplate, t);
    test.done();
};

exports.testGetResourcesByType = function(test){
    test.expect(2);
    var newTemplate = Template.parse(filePath);
    var ec2Instances = newTemplate.getResourcesByType('AWS::EC2::Instance');
    test.ok(!!ec2Instances);
    test.ok(2 === ec2Instances.length);
    test.done();
};

exports.testModifyResource = function(test){
    test.expect(3);

    // Grab the first EC2 instance in the template
    var originalInstance = t.getResourcesByType('AWS::EC2::Instance')[0];
    var newTemplate = Template.parse(filePath);
    var modifiedInstance = newTemplate.getResourcesByType('AWS::EC2::Instance')[0];

    // Modify it
    modifiedInstance.instanceType('t1.micro');

    // Assert that the original instance does not match the new one
    test.notDeepEqual(originalInstance, modifiedInstance);
    test.notDeepEqual(newTemplate, t);

    // Assert that modifying objects is reflected in the template that houses them
    test.ok('t1.micro' === newTemplate.getResourcesByType('AWS::EC2::Instance')[0].node.Properties.InstanceType);

    test.done();
};
