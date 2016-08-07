/* global Provider */
Provider.service('log', function () {
  'use strict'

  return function (msg) {
    console.info( msg )
  };
});
