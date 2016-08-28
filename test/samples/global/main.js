import template from './template.pug';

var data = {};

assert.equal(template(data), '<p>GLOBAL</p>');
