const assert = require('chai').assert;
const helper = require('../lib/helper');
const types = require('leadconduit-types');

describe('Helper', () => {

  describe('get list URL names', () => {

    ['list_ids', 'list_id', 'list_names', 'list_name'].forEach(key => {
      describe(`specified with ${key}`, () => {
        it('should handle single value', () => {
          let vars = { [key] : 'foo' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo');
        });

        it('should handle comma delimited list', () => {
          let vars = { [key] : 'foo,bar,baz' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should ignore comma delimited empty values', () => {
          let vars = { [key] : ',,foo,,bar,baz,,' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array', () => {
          let vars = { [key] : ['foo', 'bar', 'baz'] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array with empty values', () => {
          let vars = { [key] : ['foo', null, 'bar', '', 'baz', ''] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array of comma delimited lists', () => {
          let vars = { [key] : ['foo,bar,baz', 'bip,bap'] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz|bip|bap');
        });

        it('should slugify', () => {
          let vars = { [key] : 'My List,"Bob\'s List, Unplugged",2015-10-12' };
          assert.deepEqual(helper.getListUrlNames(vars), 'my_list|bobs_list_unplugged|20151012');
        });
      });
    });
  });
});
