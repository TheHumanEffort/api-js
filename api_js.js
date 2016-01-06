module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _base_api = __webpack_require__(1);

	var _base_api2 = _interopRequireDefault(_base_api);

	var _ng_api = __webpack_require__(4);

	var _ng_api2 = _interopRequireDefault(_ng_api);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	  BaseApi: _base_api2.default,
	  NgApi: _ng_api2.default
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _machina = __webpack_require__(2);

	var _machina2 = _interopRequireDefault(_machina);

	var _lodash = __webpack_require__(3);

	var _lodash2 = _interopRequireDefault(_lodash);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

	function err(message) {
	  return new Promise(function (resolve, reject) {
	    reject(message);
	  });
	}

	var defaultHandlers = {
	  wait_for: function wait_for() {
	    this.reportError('Cannot wait for login results while ' + this.state);
	  },

	  load_state: function load_state() {
	    this.reportError('Cannot load state while ' + this.state);
	  },

	  login: function login() {
	    return err('Cannot log in while ' + this.state);
	  },

	  signup: function signup() {
	    return err('Cannot sign up while ' + this.state);
	  },

	  logout: function logout() {
	    return err('Cannot log out while ' + this.state);
	  },

	  recover_password: function recover_password() {
	    return err('Cannot recover password while ' + this.state);
	  },

	  reset_password: function reset_password() {
	    return err('Cannot reset password while ' + this.state);
	  }
	};

	module.exports = _machina2.default.Fsm.extend({
	  loadState: function loadState(options) {
	    return this.handle('load_state', options);
	  },

	  namespace: 'api',

	  initialState: 'uninitialized',

	  states: {
	    uninitialized: _lodash2.default.extend({}, defaultHandlers, {
	      load_state: function load_state(options) {
	        this.transition('logged_out');
	      }
	    }),

	    // Nobody is logged in, we can log in, reset a password, or recover a
	    // password
	    logged_out: _lodash2.default.extend({}, defaultHandlers, {
	      login: function login() {
	        var _this = this;

	        this.transition('authenticating');
	        return this._login.apply(this, arguments).then(function (res) {
	          _this.data = res;
	          _this.transition('logging_in');
	          return res;
	        }).catch(function (x) {
	          _this.transition('logged_out');
	          return _this._reject(x);
	        });
	      },

	      signup: function signup() {
	        var _this2 = this;

	        this.transition('authenticating');
	        return this._signup.apply(this, arguments).then(function (res) {
	          _this2.data = res;
	          _this2.transition('signing_up');
	          return res;
	        }).catch(function (x) {
	          _this2.transition('logged_out');
	          return _this2._reject(x);
	        });
	      },

	      recover_password: function recover_password() {
	        return this._recoverPassword.apply(this, arguments);
	      },

	      reset_password: function reset_password() {
	        return this._resetPassword.apply(this, arguments);
	      }
	    }),

	    // Authenticating is when we have requested to be logged in, but we have
	    // not received word from the API service about whether or not we have
	    // successfully logged in.
	    authenticating: _lodash2.default.extend({}, defaultHandlers, {}),

	    // Once we have confirmation that we are logged in, we have some method of
	    // proving that to the service, and we now transition into a state where
	    // we can retrieve information that is important to the operation of the
	    // service.  "Logging in" can take between zero seconds and a few seconds,
	    // depending on how much data fits into this category.  It is advised that
	    // faster is better!
	    logging_in: _lodash2.default.extend({}, defaultHandlers, {
	      _onEnter: function _onEnter() {
	        console.log('Sending logging in signal');
	        this.emit('logging_in');
	        console.log('Done sending logging in signal');

	        if (!this._waiting_for && this._waiting_for.length == 0) {
	          this.transition('logged_in');
	        }
	      },

	      wait_for: function wait_for(promise) {
	        var _this3 = this;

	        this._waiting_for = this._waiting_for || [];
	        this._waiting_for.push(promise);

	        promise.then(function () {
	          var index = _this3._waiting_for.indexOf(promise);
	          _this3._waiting_for.splice(index, 1);

	          if (_this3._waiting_for.length == 0) {
	            _this3._waiting_for = null;
	            _this3.transition('logged_in');
	          }
	        }).catch(function (x) {
	          _this3.reportError(x);
	          _this3.transition('logged_out');
	        });
	      }
	    }),
	    signing_up: _lodash2.default.extend({}, defaultHandlers, {
	      _onEnter: function _onEnter() {
	        console.log('Sending logging in signal');
	        this.emit('signing_up');
	        console.log('Done sending logging in signal');
	      },

	      wait_for: function wait_for(promise) {
	        var _this4 = this;

	        this._waiting_for = this._waiting_for || [];
	        this._waiting_for.push(promise);

	        promise.then(function () {
	          var index = _this4._waiting_for.indexOf(promise);
	          _this4._waiting_for.splice(index, 1);
	          if (_this4._waiting_for.length == 0) {
	            _this4._waiting_for = null;
	            _this4.transition('logged_in');
	          }
	        }).catch(function (x) {
	          _this4.reportError(x);
	          _this4.transition('logged_out');
	        });
	      }
	    }),

	    // We are logged in!  We can now go about our business.
	    logged_in: _lodash2.default.extend({}, defaultHandlers, {
	      wait_for: function wait_for() {
	        this.reportError('Cannot wait for login results while logged in');
	      },

	      logout: function logout() {
	        var _this5 = this;

	        return this._logout().catch(function (x) {
	          console.error('Error logging out: ', x);
	        }).then(function () {
	          return _this5.transition('logged_out');
	        });
	      }
	    })
	  },

	  login: function login() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return this.handle.apply(this, ['login'].concat(args));
	  },

	  signup: function signup() {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    return this.handle.apply(this, ['signup'].concat(args));
	  },

	  logout: function logout() {
	    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	      args[_key3] = arguments[_key3];
	    }

	    return this.handle.apply(this, ['logout'].concat(args));
	  },

	  waitFor: function waitFor(promise) {
	    return this.handle('wait_for', promise);
	  },

	  recoverPassword: function recoverPassword() {
	    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
	      args[_key4] = arguments[_key4];
	    }

	    return this.handle.apply(this, ['recover_password'].concat(args));
	  },

	  resetPassword: function resetPassword() {
	    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	      args[_key5] = arguments[_key5];
	    }

	    return this.handle.apply(this, ['reset_password'].concat(args));
	  },

	  reportError: function reportError(error) {
	    console.error(error);

	    this.emit('status', 'error', { message: error });
	  },

	  // Subclassers take note, errors take 'normal' structures, with the
	  // following being a few of the options available.  Since error tracks are
	  // separate from success tracks, objects that come through rejection
	  // handlers are assumed to be an object of the following shape:
	  //
	  // { type: < the type of error >,
	  //   message: <a human readable message about the error>,
	  //   data: <additional data about the error>
	  // }
	  //
	  // Types:

	  ERROR_NETWORK: 'network_error',
	  ERROR_AUTHENTICATION_FAILED: 'auth_fail',
	  ERROR_VALIDATION_FAILED: 'validation_fail', // put validation errors in 'data' field.
	  ERROR_UNAUTHORIZED: 'unauthorized',

	  // subclasses should implement these, each does the most sensible thing
	  // given their input, and will be what is called internally.  Should return
	  // a promise.
	  _login: function _login() {
	    throw new Error('UnimplementedLogin');
	  },

	  // logout should log the current session out, and optionally take a hash.
	  // it should return a promise, which will most likely be ignored.
	  _logout: function _logout() {
	    throw new Error('UnimplementedLogout');
	  },

	  // recover password should send an email/SMS with a token, or whatever
	  _recoverPassword: function _recoverPassword() {},
	  _reject: function _reject(message) {
	    return Promise.reject(message);
	  },

	  // reset password should take a token and a password, and return a promise
	  _resetPassword: function _resetPassword() {
	    throw new Error('UnimplementedResetPassword');
	  },

	  _signup: function _signup() {
	    throw new Error('UnimplementedSignup');
	  }
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("machina");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _base_api = __webpack_require__(1);

	var _base_api2 = _interopRequireDefault(_base_api);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NgHttpApi = _base_api2.default.extend({
	  initialize: function initialize(options) {
	    var _Base$prototype$initi;

	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      args[_key - 1] = arguments[_key];
	    }

	    (_Base$prototype$initi = _base_api2.default.prototype.initialize).call.apply(_Base$prototype$initi, [this, options].concat(args));

	    this._baseUrl = options.baseUrl;
	    this._$q = options.$q;
	    this._$http = options.$http;
	  },

	  url: function url(method) {
	    return this._baseUrl + '/' + method;
	  },

	  _procHttpResponse: function _procHttpResponse(promise) {
	    var _this = this;

	    return promise.then(function (res) {
	      if (res.data.errors) {
	        return _this._$q.reject({ type: _this.ERROR_VALIDATION_FAILED, data: res.data.errors });
	      } else {
	        return res.data;
	      }
	    }).catch(function (x) {
	      var res = x;
	      if (x.status == 0) {
	        res = { type: _this.ERROR_NETWORK, message: 'Can\'t reach the server' };
	      } else if (x.status == 401) {
	        // Unauthorized, probably
	        res = { type: _this.ERROR_AUTHENTICATION_FAILED, message: x.data.error.description };
	      } else if (x.status == 500) {
	        res = { type: _this.ERROR_SERVER, message: 'There was an error on the server' };
	      }

	      return Promise.reject(res);
	    });
	  },

	  post: function post(relativeUrl, postData) {
	    return this._$http({ method: 'POST',
	      url: this.url(relativeUrl),
	      data: postData });
	  },

	  _signup: function _signup(hash) {
	    return this._procHttpResponse(this.post('authentication/signup', hash));
	  },

	  _login: function _login(hash) {
	    return this._procHttpResponse(this.post('authentication/login', hash));
	  },

	  _logout: function _logout() {
	    return this.post('authentication/logout');
	  },

	  _reject: function _reject(message) {
	    this._$q.reject(message);
	  }
	});

	angular.module('ngApi', []).provider('Api', function () {
	  var apiBaseURL = '/api';

	  this.setBaseURL = function (baseURL) {
	    apiBaseURL = baseURL;
	  };

	  this.$get = ['$http', '$q', function ($http, $q) {
	    return window.Api = new NgHttpApi({ baseUrl: apiBaseURL, $http: $http, $q: $q });
	  }];
	});

	module.exports = NgHttpApi;

/***/ }
/******/ ]);