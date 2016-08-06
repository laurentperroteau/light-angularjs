/* global Provider, document */

/**
 * DOMCompiler will :
 *   - Compile the DOM
 *     - Traverse the DOM tree
 *     - Finds registered directives, used as attributes
 *     - Invoke the logic associated with them
 *     - Manages the scope
 */
var DOMCompiler = DOMCompiler || (function () {
  'use strict'

  return {

    /**
     * Bootstraps the application
     * --------------------------
     * @description - Compile the root HTML element
     */
    bootstrap: function () {

      this.compile(
        document.children[0],
        Provider.get('$rootScope')
      )
    },

    /**
     * Invokes the logic of all directives associated 
     *   with given element (el) 
     *   and calls itself recursively 
     *   for each child element of el
     * ------------------------------
     * @param  {HTMLElement} el    
     * @param  {Object} scope 
     */
    compile: function (el, scope) {

      console.info( 'Compile' );

      let dirs = this._getElDirectives(el)
      let dir
      let scopeCreated

      dirs.forEach(function (d) {

        // Get the provider
        dir = Provider.get( d.name + Provider.DIRECTIVES_SUFFIX )

        if (dir.scope && !scopeCreated) {
          
          // Creates a new scope, which prototypically inherits from the current scope
          scope = scope.$new()
          scopeCreated = true
        }

        dir.link(el, scope, d.value)
      })

      // Compile all children of element
      Array.prototype.slice.call(el.children).forEach(function (c) {
        this.compile(c, scope)
      }, this)
    },

    /**
     * Return all directives (on each compile)
     * ---------------------------------------
     * @param  {HTMLElement} el 
     * 
     * @return {Array} - List of Object (name and value of attribut)
     */
    _getElDirectives: function (el) {

      let attrs = el.attributes
      let result = []

      for (let i = 0; i < attrs.length; i += 1) {

        if ( Provider.get(attrs[i].name + Provider.DIRECTIVES_SUFFIX) ) {

          result.push({
            name: attrs[i].name,
            value: attrs[i].value
          })
        }
      }

      return result
    }
  }
}())
