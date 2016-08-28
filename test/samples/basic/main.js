import template from './template.pug';

var data = { name: 'World' };

assert.equal(template(data), '<p>Hello World</p>');
