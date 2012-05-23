module.exports = defineProtocol;

/**
 * @param {Function} @optional protocol
 * @param {Object} _interface is an object whose keys are the function names
 * and whose values are an array representing the arguments signature
 */
function defineProtocol (protocol, _interface) {
  if (arguments.length === 1) {
    _interface = protocol;
    var protocol = function (type, implementations) {
      if (typeof type === 'function') {
        var typePrototype = type.prototype;
      }
      var types = protocol[':types'];
      var typeStr = typeOf(type && Object.create(typePrototype))
        , typeFns = types[typeStr];

      if (! typeFns) {
        var protocolId = typePrototype.protocolId
          , Other = types.Other;
        typeFns = Other[protocolId] || (Other[protocolId] = {});
      }
      Object.keys(implementations).forEach( function (methodName) {
        if (! (methodName in protocol)) {
          throw new Error('This protocol does not include "' + methodName + '"');
        }
        if (methodName in typeFns) {
          throw new Error('The type already implements the protocol method ' + methodName);
        }
        typeFns[methodName] = implementations[methodName];
      });
    }
    protocol[':interface'] = _interface;
    protocol[':types'] = {
      'Arguments': {}
    , 'Array': {}
    , 'Boolean': {}
    , 'Date': {}
    , 'Function': {}
    , 'Null': {}
    , 'Number': {}
    , 'Other': {}    // For any constructors
    , 'RegExp': {}
    , 'String': {}
    , 'Undefined': {}
    };
  } else {
    for (var k in _interface) {
      protocol[':interface'][k] = _interface[k];
    }
  }

  extendProtocol(protocol, _interface);

  return protocol;
}

function extendProtocol (protocol, _interface) {
  Object.keys(_interface).forEach( function (methodName) {
    var index = _interface[methodName].indexOf(defineProtocol)
      , types = protocol[':types'];
    protocol[methodName] = function method () {
      var target  = arguments[index]
        , typeStr = typeOf(target)
        , typeFns = types[typeStr]
        , fn = (typeFns)
             ? typeFns[methodName]
             : types.Other[target.protocolId][methodName];
      return fn.apply(null, arguments);
    };
  });
}

function typeOf (x) {
  var type = Object.prototype.toString.call(x).split(' ')[1].split(']')[0];
  return type === 'Object' ? x.constructor.name : type;
}
