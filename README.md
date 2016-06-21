# api-js
Simple JS API state management code.  This library allows you to define lifecycle hooks for communication with an API server.  For example, you might want to define certain behavior when logging in that must complete before you consider yourself "logged in".  Similarly, you may want to do a few asynchronous things as you are logging out, before you consider yourself to be actually logged out.  The states defined are thus:

- logged_out: no special privileges with the server
- authenticating: checking credentials
- logging_in: waiting for things that must happen before we're logged in
- restoring: state is being restored from a cache (similar to logging_in)
- signing_up: waiting for things that must happen before we're logged in (e.g. collecting additional data or doing stuff on the server)
- logged_in: good to go.

You may define additional states if you wish.

## Requirements
- *machina.js*: Provides finite-state-machine backing for the API object.

## Usage

- es6: `import BaseApi from 'api-js';`
- vanilla: `var api = ApiJS.BaseApi.extend({....})`

## Events

The API server emits events during the lifecycle.  It emits all the events that MachinaJS does, as well as:

- `status`: status updates from the server or elsewhere
- `api_data_changed`: we have some new API token, role information, or other API-centered details
- `clear_data`: we are now in a state that should not have any user-specific data associated with it, listen for this event if you are storing user data somewhere other than the API object, so that you may clear it at the appropriate time.
- <state_name>: we have entered <state> (i.e. `restoring`, `logged_out`, etc.)

## Details

To do things on login/signup/restore, you watch for the 
