// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import machina from 'machina';
import _ from 'lodash';

function err(message) {
  return new Promise((resolve, reject) => { reject(message); });
}

let defaultHandlers = {
  wait_for: function() {
    this.reportError(`Cannot wait for login results while ${this.state}`);
  },

  load_state: function() {
    this.reportError(`Cannot load state while ${this.state}`);
  },

  login: function() { return err(`Cannot log in while ${this.state}`); },

  signup: function() { return err(`Cannot sign up while ${this.state}`); },

  logout: function() { return err(`Cannot log out while ${this.state}`); },

  recover_password: function() { return err(`Cannot recover password while ${this.state}`); },

  reset_password: function() { return err(`Cannot reset password while ${this.state}`); },
};

module.exports = machina.Fsm.extend(
  {
    loadState: function(options) {
      return this.handle('load_state', options);
    },

    namespace: 'api',

    initialState: 'uninitialized',

    states: {
      uninitialized: _.extend({}, defaultHandlers, {
        load_state: function(options) {
          this.transition('logged_out');
        },
      }),

      // Nobody is logged in, we can log in, reset a password, or recover a
      // password
      logged_out: _.extend({}, defaultHandlers, {
        login: function(...args) {
          this.transition('authenticating');
          return this._login(...args).then((res) => {
            this.data = res;
            this.transition('logging_in');
            return res;
          }).catch((x) => {
            this.transition('logged_out');
            return Promise.reject(x);
          });
        },

        signup: function(...args) {
          this.transition('authenticating');
          return this._signup(...args).then((res) => {
            this.data = res;
            this.transition('signing_up');
            return res;
          }).catch((x) => {
            this.transition('logged_out');
            return Promise.reject(x);
          });
        },

        recover_password: function(...args) {
          return this._recoverPassword(...args);
        },

        reset_password: function(...args) {
          return this._resetPassword(...args);
        },
      }),

      // Authenticating is when we have requested to be logged in, but we have
      // not received word from the API service about whether or not we have
      // successfully logged in.
      authenticating: _.extend({}, defaultHandlers, {

      }),

      // Once we have confirmation that we are logged in, we have some method of
      // proving that to the service, and we now transition into a state where
      // we can retrieve information that is important to the operation of the
      // service.  "Logging in" can take between zero seconds and a few seconds,
      // depending on how much data fits into this category.  It is advised that
      // faster is better!
      logging_in: _.extend({}, defaultHandlers, {
        _onEnter: function() {
          console.log('Sending logging in signal');
          this.emit('logging_in');
          console.log('Done sending logging in signal');

          if (!this._waiting_for && this._waiting_for.length == 0) {
            this.transition('logged_in');
          }
        },

        wait_for: function(promise) {
          this._waiting_for = this._waiting_for || [];
          this._waiting_for.push(promise);

          promise.then(() => {
            let index = this._waiting_for.indexOf(promise);
            this._waiting_for.splice(index, 1);

            if (this._waiting_for.length == 0) {
              this._waiting_for = null;
              this.transition('logged_in');
            }
          }).catch((x) => {
            this.reportError(x);
            this.transition('logged_out');
          });
        },
      }),
      signing_up: _.extend({}, defaultHandlers, {
        _onEnter: function() {
          console.log('Sending logging in signal');
          this.emit('signing_up');
          console.log('Done sending logging in signal');
        },

        wait_for: function(promise) {
          this._waiting_for = this._waiting_for || [];
          this._waiting_for.push(promise);

          promise.then(() => {
            let index = this._waiting_for.indexOf(promise);
            this._waiting_for.splice(index, 1);
            if (this._waiting_for.length == 0) {
              this._waiting_for = null;
              this.transition('logged_in');
            }
          }).catch((x) => {
            this.reportError(x);
            this.transition('logged_out');
          });
        },
      }),

      // We are logged in!  We can now go about our business.
      logged_in: _.extend({}, defaultHandlers, {
        wait_for: function() { this.reportError('Cannot wait for login results while logged in'); },

        logout: function() {
          return this._logout().catch((x) => { console.error('Error logging out: ', x); })
            .then(() => this.transition('logged_out'));
        },
      }),
    },

    login: function(...args) { return this.handle('login', ...args); },

    signup: function(...args) { return this.handle('signup', ...args); },

    logout: function(...args) { return this.handle('logout', ...args ); },

    waitFor: function(promise) { return this.handle('wait_for', promise); },

    recoverPassword: function(...args) { return this.handle('recover_password', ...args); },

    resetPassword: function(...args) { return this.handle('reset_password', ...args); },

    reportError: function(error) {
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
    ERROR_VALIDATION_FAILED: 'validation_fail',  // put validation errors in 'data' field.
    ERROR_UNAUTHORIZED: 'unauthorized',

    // subclasses should implement these, each does the most sensible thing
    // given their input, and will be what is called internally.  Should return
    // a promise.
    _login: function(...args) {
      throw new Error('UnimplementedLogin');
    },

    // logout should log the current session out, and optionally take a hash.
    // it should return a promise, which will most likely be ignored.
    _logout: function(...args) {
      throw new Error('UnimplementedLogout');
    },

    // recover password should send an email/SMS with a token, or whatever
    _recoverPassword: function(...args) {

    },

    // reset password should take a token and a password, and return a promise
    _resetPassword: function(...args) {
      throw new Error('UnimplementedResetPassword');
    },

    _signup: function(...args) {
      throw new Error('UnimplementedSignup');
    },
  }
);
