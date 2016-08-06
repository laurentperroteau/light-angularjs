/* global Scope */

/*
APPELER QUAND LA PREMIERE FOIS
 */
var Provider = Provider || (function () {
  'use strict'

  return {

    // @private
    _providers: {}, 

    // @private
    _cache: { 
      $rootScope: new Scope() // only one instance of $rootScope
    },

    /**
     * Returns the provider invoke 
     *     if it does not exist yet 
     *     (singleton)
     * ------------------------
     * @param  {String} name   
     * @param  {Object} locals - ???
     * 
     * @return {Function}      - Invoked function
     */
    get: function (name, locals) {

      // Return cached if exist (singleton pattern)
      if ( this._cache[ name ] ) return this._cache[ name ]

      // TODO: ajout inutile des attribut ne commençant pas par ngl
      let provider = this._providers[ name ]

      // Check false ??? or not a function
      if ( !provider || typeof provider !== 'function' ) return null

      console.info( `Provider "${name}"` )

      // Add to cache and invoke function
      return this._cache[ name ] = this.invoke( provider, locals ) 
    },

    /**
     * Call function with its dependencies
     * -----------------------------------
     * @param  {Function} fn     - Function of provider to invoke
     * @param  {Object}   locals - List of local provider
     * 
     * @return {Function}
     */
    invoke: function (fn, locals = {}) {

      // List all dependencies
      let deps = this.annotate(fn).map(function (s) {

        // Return local or global provider
        return locals[ s ] || this.get(s, locals)
      }, this)

      return fn.apply(null, deps)
    },

    /**
     * Return dependencies name
     * ------------------------
     * @param  {Function} fn - Function invoked
     * 
     * @return {array}       - List of dependencies
     *
     * @example "function TodoCtrl($scope, log) {..."
     * // ["$scope", "log"]
     */
    annotate: function (fn) { // fn == '$scope, $http' ???

      // Get function as string without comments
      let res = fn.toString()
          .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '')
          .match(/\((.*?)\)/)

      if (res && res[1]) {
        // Return splited params of function
        return res[1].split(',').map(function (d) {
          return d.trim()
        })
      }

      return []
    },

    /**
     * Register directive
     * ------------------
     * @see _register()
     */
    directive: function (name, fn) {

      this._register(name + Provider.DIRECTIVES_SUFFIX, fn)
    },

    /**
     * Register controller
     * ------------------
     * @see _register()
     */
    controller: function (name, fn) {

      this._register(name + Provider.CONTROLLERS_SUFFIX, function () {
        // wrap the passed controller inside a function for simplicity, since we want to be able to invoke the controller multiple times
        return fn
      })
    },
    service: function (name, fn) {
      this._register(name, fn)
    },

    /**
     * Register provider
     * -----------------
     * @private
     *     
     * @param  {string}   name    
     * @param  {Function} service - Function of Provider
     */
    _register: function (name, service) {
      this._providers[name] = service
    }
  }
}())

Provider.DIRECTIVES_SUFFIX = '.directive'
Provider.CONTROLLERS_SUFFIX = '.controller'
