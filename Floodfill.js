function floodFill(canvas, x, y, newColor, newAlpha) {
  function getPixelColor(x, y) {
    var offset = (y * W + x) * 4;
    var result = data[offset] << 24;
    result |= data[offset + 1] << 16;
    result |= data[offset + 2] << 8;
    return result;
  }
  var dx = [ 0, -1, +1,  0];
  var dy = [-1,  0,  0, +1];
  var W = canvas.width;
  var H = canvas.height;
  var context = canvas.getContext('2d');
  var img = context.getImageData(0, 0, W, H);
  var data = img.data;
  var oldColor = getPixelColor(x, y);
  if (oldColor == newColor) return;
  var fillCanvas = document.createElement('canvas');
  fillCanvas.width = W;
  fillCanvas.height = H;
  var fillContext = fillCanvas.getContext('2d');
  var fill = fillContext.getImageData(0, 0, W, H);
  var fillData = fill.data;
  var minX = x;
  var maxX = x;
  var minY = y;
  var maxY = y;
  var r = (oldColor >> 24) & 0xFF;
  var g = (oldColor >> 16) & 0xFF;
  var b = (oldColor >> 8) & 0xFF;
  //alert('oldrgb = ' + r + ',' + g + ',' + b);
  var newR = (newColor >> 24) & 0xFF;
  var newG = (newColor >> 16) & 0xFF;
  var newB = (newColor >>  8) & 0xFF;
  //alert('newrgba = ' + newR + ',' + newG + ',' + newB + ',' + newAlpha);
  var stack = [];
  stack.push(x);
  stack.push(y);
  while (stack.length > 0) {
    var curY = stack.pop();
    var curX = stack.pop();
    for (var i = 0; i < 4; i++) {
      var nextX = curX + dx[i];
      var nextY = curY + dy[i];
      if (nextX < 0 || nextY < 0 || nextX >= W || nextY >= H) {
        continue;
      }
      var offset = (nextY * W + nextX) * 4;
      if (data[offset] == r && data[offset + 1] == g && data[offset + 2] == b) {
        data[offset] = newR;
        data[offset + 1] = newG;
        data[offset + 2] = newB;
        if (newAlpha != null) {
          data[offset + 3] = newAlpha ? newAlpha : 255;
        }
        fillData[offset] = newR;
        fillData[offset + 1] = newG;
        fillData[offset + 2] = newB;
        fillData[offset + 3] = newAlpha ? newAlpha : 255;
        minX = Math.min(minX, nextX);
        maxX = Math.max(maxX, nextX);
        minY = Math.min(minY, nextY);
        maxY = Math.max(maxY, nextY);
        stack.push(nextX);
        stack.push(nextY);
      }
    }
  }
  context.putImageData(img, 0, 0);
  return {
    image: fill,
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};