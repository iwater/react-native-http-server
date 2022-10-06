// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Modified by iwater@gmail.com for react-native envs

const ObjectDefineProperty = Object.defineProperty;

const messages = new Map();
export const codes: Record<string, any> = {};

let excludedStackFn;

function makeNodeErrorWithCode(Base, key) {
  return class NodeError extends Base {
    constructor(...args) {
      if (excludedStackFn === undefined) {
        super();
      } else {
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        super();
        // Reset the limit and setting the name property.
        Error.stackTraceLimit = limit;
      }
      const message = getMessage(key, args, this);
      ObjectDefineProperty(this, 'message', {
        value: message,
        enumerable: false,
        writable: true,
        configurable: true
      });
      addCodeToName(this, super.name, key);
      this.code = key;
    }

    toString() {
      return `${this.name} [${key}]: ${this.message}`;
    }
  };
}

// This function removes unnecessary frames from Node.js core errors.

function addCodeToName(err, name, code) {
  // Set the stack
  if (excludedStackFn !== undefined) {
    // eslint-disable-next-line no-restricted-syntax
    Error.captureStackTrace(err, excludedStackFn);
  }
  // Add the error code to the name to include it in the stack trace.
  err.name = `${name} [${code}]`;
  // Access the stack to generate the error message including the error code
  // from the name.
  err.stack;
  // Reset the name to the actual name.
  if (name === 'SystemError') {
    ObjectDefineProperty(err, 'name', {
      value: name,
      enumerable: false,
      writable: true,
      configurable: true
    });
  } else {
    delete err.name;
  }
}

// Utility function for registering the error codes. Only used here. Exported
// *only* to allow for testing.
function E(sym, val, def, ...otherClasses) {
  // Special case for SystemError that formats the error message differently
  // The SystemErrors only have SystemError as their base classes.
  messages.set(sym, val);
  def = makeNodeErrorWithCode(def, sym);

  if (otherClasses.length !== 0) {
    otherClasses.forEach((clazz) => {
      def[clazz.name] = makeNodeErrorWithCode(clazz, sym);
    });
  }
  codes[sym] = def;
}

function getMessage(key, args, self) {
  const msg = messages.get(key);

  if (typeof msg === 'function') {
    return msg.apply(self, args);
  }

  if (args.length === 0)
    return msg;

  args.unshift(msg);
  return args;
}

E('ERR_HTTP_HEADERS_SENT',
  'Cannot %s headers after they are sent to the client', Error);
E('ERR_HTTP_INVALID_STATUS_CODE', 'Invalid status code: %s', RangeError);
E('ERR_INVALID_ARG_TYPE','', TypeError);
E('ERR_INVALID_CHAR',
// Using a default argument here is important so the argument is not counted
// towards `Function#length`.
(name, field = undefined) => {
  let msg = `Invalid character in ${name}`;
  if (field !== undefined) {
    msg += ` ["${field}"]`;
  }
  return msg;
}, TypeError);
E('ERR_HTTP_INVALID_HEADER_VALUE',
'Invalid value "%s" for header "%s"', TypeError);
E('ERR_HTTP_TRAILER_INVALID',
'Trailers are invalid with this transfer encoding', Error);
E('ERR_INVALID_HTTP_TOKEN', '%s must be a valid HTTP token ["%s"]', TypeError);
E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);