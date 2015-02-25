function createCanvas(cols, rows) {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.zIndex = 100;
  canvas.style.left = '0px';
  canvas.style.top = '0px';
  canvas.width = (cols.length - 1) * Racing.tileSize;
  canvas.height = (rows.length - 1) * Racing.tileSize;
  Racing.canvas = canvas;
  document.body.appendChild(canvas);
  Racing.context = canvas.getContext('2d');
  return canvas;
}
function clearCanvas() {
  Racing.context.clearRect(0, 0, Racing.canvas.width, Racing.canvas.height);
  Racing.canvas.width = (Tiles.cols.length - 1) * Racing.tileSize;
  Racing.canvas.height = (Tiles.rows.length - 1) * Racing.tileSize;
}
$C = window.Canvas = {
  create: function(params) {
    var canvas = document.createElement('canvas');
    canvas.width = params && params.width ? params.width : 512;
    canvas.height = params && params.height ? params.height : 512;
    if (params) {
      var style = canvas.style;
      for (var paramName in params) {
        if (paramName != 'width' && paramName != 'height') {
          style[paramName] = params[paramName];
        }
      }
      document.body.appendChild(canvas);
    }
    return canvas;
  },
  LEFT: {
    position: 'absolute',
    left: '0px',
    top: '0px'
  },
  RIGHT: {
    position: 'absolute',
    left: '600px',
    top: '0px'
  },
  isEmpty: function(canvas) {
    var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var data = new Uint32Array(imageData.data.buffer);
    for (var i = 0, length = data.length; i < length; i++) {
      if (data[i] != 0) {
        return false;
      }
    }
    return true;
  }
}