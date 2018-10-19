var angular = require('angular');
var _ = require('lodash');
require('simple-angular-pagination');

var ui = require('leadconduit-integration-ui');

ui.init(init);

function init(config) {
  config = config || {};
  // Our app
  var app = angular.module('app', ['Pagination'])
    // $http config
    .controller('Page1Ctrl', ['$rootScope', '$scope', '$http', '$timeout', function($rootScope, $scope, $http, $timeout) {
      var state = $rootScope.state = $rootScope.state || {};

      $scope.loading = true;

      state.basicFields = _.intersectionWith(
        _.get(config, 'flow.fields', []),
        ['email', 'phone_1', 'phone_2', 'phone_3'],
        function(a,b) {
          return a.value == b;
        }
      );

      if (state.basicFields.length === 0) {
        state.value = 'other';
      } else {
        state.basicFields.push({
          value: 'other',
          text: 'Select another field...'
        });
      }

      $rootScope.startOver = function() {
        state.action = '';
        $scope.changePage(1);
      };

      $rootScope.jump = function() {
        if(state.action == 'is_unique') {
          $scope.changePage(3);
        } else {
          $scope.changePage(2);
        }
      };

      $rootScope.config = config;
      $rootScope.cancel = ui.cancel;

      if (config.integration) {
        state.action = _.last(config.integration.split('.'));
        $rootScope.startedWithIntegration = true;
        // NOTE -Seems like jump was running before pages got fully initialized
        // or something and was showing 2 pages at once
        $timeout(function(){
          $rootScope.jump();
        });
      }

      // the creds should always be there since they're from AP
      if (config.credential) {
        $http.post('credential', config.credential).then(function() {
          $scope.loading = false;

          if (config.integration) {
            state.action = _.last(config.integration.split('.'));
          }

          if (state.action == 'is_unique') {
            setTimeout(function() { $rootScope.changePage(3); }, 0);
          } else {
            $rootScope.allowPrevious = true;
            $http.get('lists').then(function(response) {
              $rootScope.lists = response.data;
            });
          }

        });
      } else {
        ui.cancel();
      }

    }])
    .controller('Page2Ctrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
      var state = $rootScope.state = $rootScope.state || {};

      $rootScope.fieldListText = {
        query_item: 'query',
        add_item: 'add to',
        delete_item: 'delete from'
      };

      // Finalization and communicating to the user what's next
      $scope.finish = function(){
        var steps = [{
          type: 'recipient',
          entity: {
            name: config.entity.name,
            id: config.entity.id
          },
          integration: {
            module_id: 'leadconduit-suppressionlist.outbound.' + state.action,
            mappings: [
              { property: (state.action === 'query_item') ? 'value' : 'values',
                value: '{{lead.' + ((state.value == 'other' || state.basicFields.length === 0) ? state.finalValue : state.value) + '}}' },
              { property: (state.action === 'query_item') ? 'list_names' : 'list_name',
                value: state.list_name }
            ]
          }
        }];
        if (state.action == 'query_item') {
          steps.push({
            type: 'filter',
            reason: 'Duplicate lead',
            outcome: 'failure',
            rule_set: {
              op: 'and',
              rules: [{
                op: 'is true',
                lhv: 'suppressionlist.query_item.found'
              }]
            }
          });
        }

        ui.create({
          flow: {
            steps: steps
          }
        });
      };

    }])
    .controller('Page3Ctrl', ['$rootScope', function($rootScope){
      var state = $rootScope.state = $rootScope.state || {};
    }])
    .controller('Page4Ctrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

      var state = $rootScope.state = $rootScope.state || {};

      $scope.genAmountText = function(text, increment, unit) {
        // Checking `text` handles the Custom case
        return (text) ? text : increment + ' ' + unit;
      };

      $scope.amounts = [
        { value: 24 * 60 * 60, increment: '1',  unit: 'day' },
        { value: 7 * 24 * 60 * 60, increment: '1',  unit: 'week' },
        { value: 31 * 24 * 60 * 60, increment: '1',  unit: 'month' },
        { value: 91 * 24 * 60 * 60, increment: '3',  unit: 'months' },
        { value: 183 * 24 * 60 * 60, increment: '6',  unit: 'months' },
        { value: 'custom', text: 'Custom' }
      ];

      $scope.units = [
        { value: 24 * 60 * 60, text: 'days' },
        { value: 7 * 24 * 60 * 60, text: 'weeks' },
        { value: 30 * 24 * 60 * 60, text: 'months' }
      ];

      // Finalization and communicating to the user what's next
      $scope.finish = function(){        
        $scope.finishing = true;
        $http.post('lists/ensure', {
          name: 'Duplicate Checking',
          ttl: state.ttl == 'custom' ? ((state.ttlSeconds || 0) * (state.ttlUnit || 1)) : state.ttl
        }).then(function(response) {

          var filterStep = {
            type: 'filter',
            reason: 'Duplicate lead',
            outcome: 'failure',
            rule_set: {
              op: 'and',
              rules: [{
                op: 'is equal to',
                lhv: 'suppressionlist.is_unique.outcome',
                rhv: 'failure'
              }]
            }
          };
          if (state.ttl) {
            var rhv;
            if (state.ttl === 'custom') {
              var unit = $scope.units.find(unit => unit.value === state.ttlUnit).text;
              var increment= state.ttlSeconds;
              rhv = '{{format submission.timestamp operator="subtract" ' + unit + '="' + increment + '"}}-{{submission.timestamp}}';
            } else {
              var amount = $scope.amounts.filter(amount => amount.value === state.ttl)[0];
              amount.unit = (amount.unit.endsWith('s')) ? amount.unit : amount.unit + 's';
              rhv = '{{format submission.timestamp operator="subtract" ' + amount.unit + '="' + amount.increment + '"}}-{{submission.timestamp}}';
            }

            filterStep.rule_set.rules.push(
              {
                'op': 'is between',
                'lhv': 'suppressionlist.is_unique.query_item.added_at',
                'rhv': rhv
              }
            );
          }

          ui.create({
            flow: {
              steps: [{
                type: 'recipient',
                entity: {
                  name: config.entity.name,
                  id: config.entity.id
                },
                integration: {
                  module_id: 'leadconduit-suppressionlist.outbound.is_unique',
                  mappings: [
                    { property: 'value', value: '{{lead.' + ((state.value == 'other' || state.basicFields.length === 0) ? state.finalValue : state.value) + '}}' },
                    { property: 'list_name', value: response.data.url_name }
                  ]
                }
              },
              filterStep
              ]
            }
          });
        }).catch(function() {
          $scope.finishing = false;
        });
      };

    }]);

  angular.bootstrap(document, ['app']);
}