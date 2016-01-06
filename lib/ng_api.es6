
import Base from './base_api.es6';

let NgHttpApi = Base.extend({
  initialize: function(options, ...args) {
    Base.prototype.initialize.call(this, options, ...args);

    this._baseUrl = options.baseUrl;
    this._$q = options.$q;
    this._$http = options.$http;
  },

  url: function(method) {
    return `${this._baseUrl}/${method}`;
  },

  _procHttpResponse: function(promise) {
    return promise.then((res) => {
      if (res.data.errors) {
        return this._$q.reject({ type: this.ERROR_VALIDATION_FAILED, data: res.data.errors });
      } else {
        return res.data;
      }
    }).catch((x) => {
      let res = x;
      if (x.status == 0) {
        res = { type: this.ERROR_NETWORK, message: 'Can\'t reach the server' };
      } else if (x.status == 401) {
        // Unauthorized, probably
        res = { type: this.ERROR_AUTHENTICATION_FAILED, message: x.data.error.description };
      } else if (x.status == 500) {
        res = { type: this.ERROR_SERVER, message: 'There was an error on the server' };
      }

      return Promise.reject(res);
    });
  },

  post: function(relativeUrl, postData) {
    return this._$http(
      { method: 'POST',
        url: this.url(relativeUrl),
        data: postData, });
  },

  _signup: function(hash) {
    return this._procHttpResponse(this.post('authentication/signup', hash));
  },

  _login: function(hash) {
    return this._procHttpResponse(this.post('authentication/login', hash));
  },

  _logout: function() {
    return this.post('authentication/logout');
  },
});

angular.module('ngApi', []).provider('Api', function() {
  let apiBaseURL = '/api';

  this.setBaseURL = function(baseURL) {
    apiBaseURL = baseURL;
  };

  this.$get = ['$http', '$q', function($http, $q) {
    return window.Api = new NgHttpApi({ baseUrl: apiBaseURL, $http: $http, $q: $q });
  },
];
});

module.exports = NgHttpApi;
