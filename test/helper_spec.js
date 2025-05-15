const assert = require('chai').assert;
const helper = require('../lib/helper');
const types = require('leadconduit-types');

describe('Helper', () => {
  describe('get list URL names', () => {
    ['list_ids', 'list_id', 'list_names', 'list_name'].forEach(key => {
      describe(`specified with ${key}`, () => {
        it('should handle single value', () => {
          const vars = { [key]: 'foo' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo');
        });

        it('should handle comma delimited list', () => {
          const vars = { [key]: 'foo,bar,baz' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should ignore comma delimited empty values', () => {
          const vars = { [key]: ',,foo,,bar,baz,,' };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array', () => {
          const vars = { [key]: ['foo', 'bar', 'baz'] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array with empty values', () => {
          const vars = { [key]: ['foo', null, 'bar', '', 'baz', ''] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz');
        });

        it('should handle array of comma delimited lists', () => {
          const vars = { [key]: ['foo,bar,baz', 'bip,bap'] };
          assert.deepEqual(helper.getListUrlNames(vars), 'foo|bar|baz|bip|bap');
        });

        it('should slugify', () => {
          const vars = { [key]: 'My List,"Bob\'s List, Unplugged",2015-10-12' };
          assert.deepEqual(helper.getListUrlNames(vars), 'my_list|bobs_list_unplugged|20151012');
        });
      });
    });
  });

  describe('Base URL', () => {
    after(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should get production url', () => {
      process.env.NODE_ENV = 'production';
      assert.equal(helper.getBaseUrl(), 'https://app.suppressionlist.com');
    });

    it('should get staging url', () => {
      process.env.NODE_ENV = 'staging';
      assert.equal(helper.getBaseUrl(), 'https://staging.suppressionlist.com');
    });

    it('should get development url', () => {
      process.env.NODE_ENV = 'development';
      assert.equal(helper.getBaseUrl(), 'https://development.suppressionlist.com');
    });

    it('should use the production url when process.env.NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      assert.equal(helper.getBaseUrl(), 'https://app.suppressionlist.com');
    });
  });

  describe('Validate', () => {
    it('should require list_ids', () => {
      assert.equal(helper.validate({}), 'a list name is required');
    });

    it('should require values', () => {
      assert.equal(helper.validate({ list_ids: 'foo' }), 'values must not be blank');
    });

    it('should require non empty string values', () => {
      assert.equal(helper.validate({ list_ids: 'foo', values: '' }), 'values must not be blank');
    });

    it('should require non null values', () => {
      assert.equal(helper.validate({ list_ids: 'foo', values: null }), 'values must not be blank');
    });

    it('should require values in typed fields', () => {
      const lead = { email: types.email.parse('') }; // an empty lead.email (a String) is different than ''
      assert.equal(helper.validate({ list_ids: 'foo', values: lead.email }), 'values must not be blank');
    });

    it('should be satisfied with list_ids, values', () => {
      assert.isUndefined(helper.validate({ list_ids: 'foo', values: 'bar@baz.com' }));
    });
  });

  describe('Request Headers', () => {
    beforeEach(() => {
      process.env.SUPPRESSIONLIST_CPL_TOKEN = '4321';
      this.vars = {
        activeprospect: {
          api_key: 'api_key'
        }
      };
      this.headers = helper.getRequestHeaders(this.vars);
    });

    it('should accept JSON', () => {
      assert.equal(this.headers.Accept, 'application/json');
    });

    it('should set authorization header', () => {
      assert.equal(this.headers.Authorization, 'Basic WDphcGlfa2V5');
    });

    it('should set content-type by default', () => {
      assert.equal(this.headers['Content-Type'], 'application/json');
    });

    it('should not set content-type when told not to', () => {
      this.headers = helper.getRequestHeaders(this.vars, false);
      assert.isUndefined(this.headers['Content-Type']);
    });

    it('should set CPL-Token header', () => {
      assert.equal(this.headers['CPL-Token'], '4321');
    });

    it('should mask CPL token on second invocation', () => {
      const masked = helper.getRequestHeaders(this.vars);
      assert.equal(masked['CPL-Token'], '****');
    });
  });
});
