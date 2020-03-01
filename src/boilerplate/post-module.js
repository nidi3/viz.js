  return Module;
};

function render(instance, src, options) {
  var i;
  for (i = 0; i < options.files.length; i++) {
    instance['ccall']('vizCreateFile', 'number', ['string', 'string'], [options.files[i].path, options.files[i].data]);
  }

  instance['ccall']('vizSetY_invert', 'number', ['number'], [options.yInvert ? 1 : 0]);
  instance['ccall']('vizSetNop', 'number', ['number'], [options.nop ? options.nop : 0]);
  
  var resultPointer = instance['ccall']('vizRenderFromString', 'number', ['string', 'string', 'string'], [src, options.format, options.engine]);
  var resultString = instance['Pointer_stringify'](resultPointer);
  instance['ccall']('free', 'number', ['number'], [resultPointer]);

  var errorMessagePointer = instance['ccall']('vizLastErrorMessage', 'number', [], []);
  var errorMessageString = instance['Pointer_stringify'](errorMessagePointer);
  instance['ccall']('free', 'number', ['number'], [errorMessagePointer]);

  if (errorMessageString != '') {
    throw new Error(errorMessageString);
  }

  return resultString;
}

function setFontWidth(instance, name, widths) {
  var typedArray = Float64Array.from(widths);
  var bytes = _arrayToHeap(typedArray);
  instance['ccall']('vizSetFontWidth', 'number', ['string', 'number'], [name, bytes.byteOffset]);

  function _arrayToHeap(typedArray){
    var numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
    var ptr = instance._malloc(numBytes);
    var heapBytes = new Uint8Array(instance.HEAPU8.buffer, ptr, numBytes);
    heapBytes.set(new Uint8Array(typedArray.buffer));
    return heapBytes;
  }
}

if (typeof importScripts === "function") {
  var instance = Module();
  
  onmessage = function(event) {
    var id = event.data.id;
    var src = event.data.src;
    var options = event.data.options;
  
    try {
      var result = render(instance, src, options);
      postMessage({ id: id, result: result });
    } catch (e) {
      var error;
      if (e instanceof Error) {
        error = { message: e.message, fileName: e.fileName, lineNumber: e.lineNumber };
      } else {
        error = { message: e.toString() };
      }
      postMessage({ id: id, error: error });
    }
  }
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = { render: render, Module: Module };
} else if (typeof define === 'function' && define.amd) {
  define(function() { return { render: render, Module: Module }; });
}

if (typeof global.Viz !== 'undefined') {
  global.Viz.render = render;
  global.Viz.setFontWidth = setFontWidth;
  global.Viz.Module = Module;
}

})(typeof self !== 'undefined' ? self : this);
