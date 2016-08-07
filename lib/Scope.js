/* global Utils */


function Scope(parent, id = 0) {

  this.$$watchers = []
  this.$$children = []
  this.$parent = parent
  this.$id = id
}

Scope.counter = 0;

/**
 * Push expression to watch in watchers
 * ------------------------------------
 * @param  {string}   exp - Expression to eval
 * @param  {Function} fn  
 */
Scope.prototype.$watch = function (exp, fn) {
  'use strict'

  console.info( 'Watch' )

  this.$$watchers.push({
    exp : exp,
    fn  : fn,
    last: Utils.clone( this.$eval( exp ) )
  })
}

/**
 * Evaluates the expression expr 
 *   in the context of the current Scope
 * -------------------------------------  
 * @param  {???} exp 
 * 
 * @return {[type]}     [description]
 *
 * @description :
 *   In the complete implementation there're 
 *     lexer, parser and interpreter.
 *     Note that this implementation is pretty evil! 
 *     It uses two dangerouse features: 
 *       - eval 
 *       - with 
 *     The reason the 'use strict' statement is 
 *     omitted is because of `with`
 */
Scope.prototype.$eval = function (exp) {

  let val

  if (typeof exp === 'function') {

    val = exp.call( this )
  } 
  else {

    try {
      with (this) {
        val = eval( exp )
      }
    } 
    catch (e) {
      val = undefined
    }
  }

  return val;
}

/**
 * Creates a new scope, 
 *   which prototypically inherits 
 *   from the target of the call
 * -----------------------------  
 * @return {Object} - The new scope
 */
Scope.prototype.$new = function () {
  'use strict'

  Scope.counter += 1

  let obj = new Scope(this, Scope.counter)

  Object.setPrototypeOf(obj, this) // TODO: utiliser Object.create()

  this.$$children.push(obj)

  console.log( obj )

  return obj
}

/**
 * Destroys the current scope
 * --------------------------
 */
Scope.prototype.$destroy = function () {
  'use strict'

  let pc = this.$parent.$$children

  pc.splice( pc.indexOf(this), 1 )
}

/**
 * Runs the dirty checking loop
 * ----------------------------
 */
Scope.prototype.$digest = function () {
  'use strict'

  let dirty
  let watcher
  let current
  let i

  do {
    dirty = false

    for (i = 0; i < this.$$watchers.length; i += 1) {

      console.info( 'Digest' )

      watcher = this.$$watchers[i]
      current = this.$eval( watcher.exp )

      // If last result and current (the newest) of expression eval are diferent
      if ( !Utils.equals( watcher.last, current ) ) {

        // Set new in in last
        watcher.last = Utils.clone( current )

        // Repeat then on all watchers, 
        //   because may have some inter-expression dependencies
        dirty = true

        // Call function
        watcher.fn( current )

      }
    }
  } while (dirty)

  // Result of expression has changed, $digest now all children
  for (i = 0; i < this.$$children.length; i += 1) {

    this.$$children[i].$digest()
  }
}
