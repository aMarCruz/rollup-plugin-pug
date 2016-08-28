import template from './index.pug';

var data = { title: 'My Site' };
var html = template(data);

assert.ok(/My Site/.test(html), 'Failed to include head.js');
assert.ok(/\(c\)/.test(html), 'Failed to include foot.js');
