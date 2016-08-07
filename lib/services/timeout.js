/* global Provider */

/**
 * $timeout it's a native timeout 
 *   with $digest on $rootScope
 * ------------------------------
 */
Provider.service('$timeout', function ($rootScope) {
  'use strict'

  return function (fn, timeout) {

    setTimeout(function () {
      fn()
      $rootScope.$digest()
    }, timeout)
  }
})
