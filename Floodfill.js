function floodFill(x, y, context, color, tolerance, border) {
  function hexToR(h) {
    return parseInt((cutHex(h)).substring(0, 2), 16);
  }
  function hexToG(h) {
    return parseInt((cutHex(h)).substring(2, 4), 16);
  }
  function hexToB(h) {
    return parseInt((cutHex(h)).substring(4, 6), 16);
  }
  function cutHex(h) {
    return (h.charAt(0) == '#') ? h.substring(1, 7) : h;
  }
  function matchTolerance(pixelPos, color, tolerance) {
    var tol = tolerance / 100;
    var rMax = startR + (startR * tol);
    var gMax = startG + (startG * tol);
    var bMax = startB + (startB * tol);
    var rMin = startR - (startR * tol);
    var gMin = startG - (startG * tol);
    var bMin = startB - (startB * tol);
    var r = imageData.data[pixelPos]; 
    var g = imageData.data[pixelPos + 1]; 
    var b = imageData.data[pixelPos + 2];
    return ((
      (r >= rMin && r <= rMax) &&
      (g >= gMin && g <= gMax) &&
      (b >= bMin && b <= bMax)
    ) && !(
      r == hexToR(color) &&
      g == hexToG(color) &&
      b == hexToB(color))
    );
  }
  function colorPixel(pixelPos, color) {
    imageData.data[pixelPos] = hexToR(color);
    imageData.data[pixelPos + 1] = hexToG(color);
    imageData.data[pixelPos + 2] = hexToB(color);
    imageData.data[pixelPos + 3] = 255;
    imageData2.data[pixelPos] = hexToR(color);
    imageData2.data[pixelPos + 1] = hexToG(color);
    imageData2.data[pixelPos + 2] = hexToB(color);
    imageData2.data[pixelPos + 3] = 255;
  }
  lastPos = 0;
  pixelStack = [[x, y]];
  width = context.canvas.width;
  height = context.canvas.height;
  pixelPos = (y * width + x) * 4;
  var canvas2 = document.createElement('canvas');
  canvas2.width = width;
  canvas2.height = height;
  imageData2 = canvas2.getContext('2d').getImageData(0, 0, width, height);
  imageData =  context.getImageData(0, 0, width, height);
  startR = imageData.data[pixelPos];
  startG = imageData.data[pixelPos + 1];
  startB = imageData.data[pixelPos + 2];
  while (pixelStack.length) {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];
    pixelPos = (y * width + x) * 4;
    while (y-- >= 0 && matchTolerance(pixelPos, color, tolerance)) {
      pixelPos -= width * 4;
    }
    pixelPos += width * 4;
    ++y;
    reachLeft = false;
    reachRight = false;
    while (y++ < height - 1 && matchTolerance(pixelPos, color, tolerance)) {
      colorPixel(pixelPos, color);
      if (x > 0) {
        if (matchTolerance(pixelPos - 4, color, tolerance)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else {
          if (reachLeft) {
            reachLeft = false;
          }
        }
      }
      if (x < width - 1) {
        if (matchTolerance(pixelPos + 4, color, tolerance)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else {
          if (matchTolerance(pixelPos + 4 - (width * 4), color, tolerance)) {
            if (!reachLeft) {
              pixelStack.push([x + 1, y - 1]);
              reachLeft = true;
            }
          } else {
            if (reachRight) {
              reachRight = false;
            }
          }
        }
      }
      pixelPos += width * 4;
    }
  }
  return imageData2;
}