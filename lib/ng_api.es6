import Base from './base_api.es6';

let NgHttpApi = Base.extend({
  initialize: function(options, ...args) {
    Base.prototype.initialize.call(this, options, ...args);

    this._baseUrl = options.baseUrl;
    this._$http = options.$http;
  },

  url: function(method) {
    return `${this._baseUrl}/${method}`;
  },

  _procHttpResponse: function(promise) {
    return promise.then(function(res) {
      return res.data;
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

  _login: function(hash) {
    return this._procHttpResponse(this.post('authentication/login', hash));
  },
});

angular.module('ngApi', []).provider('Api', function() {
  let apiBaseURL = '/api';

  this.setBaseURL = function(baseURL) {
    apiBaseURL = baseURL;
  };

  this.$get = ['$http', function($http) {
    return window.Api = new NgHttpApi({ baseUrl: apiBaseURL, $http: $http });
  },];
});

module.exports = NgHttpApi;
