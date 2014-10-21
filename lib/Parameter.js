'use strict';

var _ = require('lodash');

function Parameter(id, type, defaultValue, description, options) {
    this.id = id;
    this.node = {
        Type: type
    };
    if (description) {
        this.node.Description = description;
    }
    if (defaultValue) {
        this.node.Default = defaultValue;
    }
    _.extend(this.node, options);
    return this;
}

Parameter.prototype.ref = function () {
    return { 'Ref': this.id };
};

Parameter.prototype.minLength = function (min) {
    this.node.MinLength = min + '';
};

Parameter.prototype.maxLength = function (max) {
    this.node.MaxLength = max + '';
};

Parameter.prototype.allowedValues = function (values) {
    if (!(values instanceof Array)) {
        values = [values];
    }
    this.node.AllowedValues = values;
    return this;
};

module.exports = Parameter;