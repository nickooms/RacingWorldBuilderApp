window.Racing = {
  processStreetDelay: 1000,
  uniqueCols: {},
  uniqueRows: {},
  gemeenten: {
    'Stabroek': true,
    'Kapellen': true
  },
  straten: {
    'Markt': true
  },
  streetsPoints: {},
  streetPoints: null,
  canvasses: [],
  pixel: function(data, imageWidth, x, y) {
    var offset = ((imageWidth * y) + x) * 4;
    var red = data[offset];
    var green = data[offset + 1];
    var blue = data[offset + 2];
    var alpha = data[offset + 3];
    return {
      r: red,
      g: green,
      b: blue,
      a: alpha,
      equals: function(color) {
        return this.r == color.r && this.g == color.g && this.b == color.b && this.a == color.a;
      },
      toHex: function() {
        if (typeof this.r == 'undefined') {
          return null;
        }
        return ['#', this.r < 0x10 ? '0' : '', this.r.toString(16), this.g < 0x10 ? '0' : '', this.g.toString(16), this.b < 0x10 ? '0' : '', this.b.toString(16)].join('');
      }
    };
  },
  plotCorners: function(corners, ctx, color) {
    var w = ctx.canvas.width,
      h = ctx.canvas.height,
      twopi = 2 * Math.PI,
      step, i, points = [];
    ctx.fillStyle = color || '#000000';
    for (var y = 0; y < h; y++) {
      step = y * w;
      for (var x = 0; x < w; x++) {
        i = step + x;
        if (corners[i] > 0) {
          ctx.beginPath();
          ctx.arc(x, y, 1, twopi, false);
          ctx.closePath();
          ctx.fill();
          points.push({
            x: x,
            y: y
          });
        }
      }
    }
    return points;
  },
  lambert: function(x, y) {
    var cols = Racing.cols;
    var rows = Racing.rows;
    var minX = cols[0];
    var maxX = cols[cols.length - 1];
    var minY = rows[0];
    var maxY = rows[rows.length - 1];
    var w = Racing.canvas.width;
    var h = Racing.canvas.height;
    var leftRight = x / w;
    var topBottom = y / h;
    var width = maxX - minX;
    var height = maxY - minY;
    var xPos = (parseFloat(minX) + leftRight * width).toString().split('.');
    var yPos = (parseFloat(maxY) - topBottom * height).toString().split('.');
    if (xPos.length > 1) {
      xPos[1] = xPos[1].substr(0, 2);
    }
    if (yPos.length > 1) {
      yPos[1] = yPos[1].substr(0, 2);
    }
    return '[' + xPos.join('.') + ',' + yPos.join('.') + ']';
  },
  processStreet: function() {
    var borderWidth = 10;
    var cols = Racing.cols;
    var rows = Racing.rows;
    var minX = cols[0];
    var maxX = cols[cols.length - 1];
    var minY = rows[0];
    var maxY = rows[rows.length - 1];
    var d = new Date().getTime();
    Racing.polygons = [];
    if (Racing.bounds == null) {
      Racing.bounds = {};
    }
    for (var j = 0; j < Racing.points.length; j++) {
      var x = parseInt(Racing.canvas.width / (maxX - minX) * (Racing.points[j].x - minX));
      var y = parseInt(Racing.canvas.height / (maxY - minY) * (maxY - Racing.points[j].y));
      var processed = false;
      for (var bounds in Racing.bounds) {
        var b = JSON.parse(bounds);
        if (b.left < x && x < b.right && b.top < y && y < b.bottom) {
          processed = true;
        }
      }
      if (!processed) {
        var color = Racing.pixel(Racing.imageData.data, Racing.canvas.width, x, y);
        if (color != null) {
          console.log('Point ' + (j + 1) + '/' + Racing.points.length);
          switch (color.toHex()) {
            case '#cccccc':
            case '#b7b7b7':
              inv = '#000000';
              var imageData = floodFill(x, y, Racing.context, inv, color.toHex() == '#cccccc' ? 0 : 0);
              var bounds = getBounds(imageData);
              bounds.index = j;
              var sBounds = JSON.stringify(bounds);
              var filledImageData = Racing.context.getImageData(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
              var canvas = document.createElement('canvas');
              canvas.style.border = '1px solid black';
              canvas.width = bounds.right - bounds.left + borderWidth * 2;//Racing.canvas.width;
              canvas.height = bounds.bottom - bounds.top + borderWidth * 2;//Racing.canvas.height;
              if (document.querySelectorAll('canvas').length == 1) {
                canvas.style.top = Racing.canvas.height;
              }
              var ctx = canvas.getContext('2d');
              ctx.putImageData(imageData, 10 - bounds.left, 10 - bounds.top);
              var border = MarchingSquares.getBlobOutlinePoints(canvas);
              if (border.length > 0) {
                Racing.bounds[sBounds] = true;
                console.log('\tFound ' + border.length / 2 + ' points');
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FFFFFF';
                for (var i = 0; i < border.length; i += 2) {
                  ctx.fillRect(border[i], border[i + 1], 1, 1);
                }
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var corners = CornerDetector.detect(imageData, 'harris', {
                  qualityLevel: 0.02,
                  blockSize: 5,
                  k: 0.02
                });
                ctx.fillStyle = 'yellow';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FFFFFF';
                for (var i = 0; i < border.length; i += 2) {
                  ctx.fillRect(border[i], border[i + 1], 1, 1);
                }
                corners = Racing.plotCorners(corners, ctx, '#FF0000');
                console.log('\tFound ' + corners.length + ' corners');
                for (var i = 0; i < corners.length; i++) {
                  var corner = corners[i];
                  var minDist = null;
                  var x = corner.x;
                  var y = corner.y;
                  var bestPointIndex = null;
                  var bestX = null;
                  var bestY = null;
                  for (var k = 0; k < border.length; k += 2) {
                    var xDist = Math.abs(border[k] - x);
                    var yDist = Math.abs(border[k + 1] - y);
                    var dist = xDist + yDist
                    if (minDist == null || dist < minDist) {
                      minDist = dist;
                      bestPointIndex = k / 2;
                      bestX = border[k];
                      bestY = border[k + 1];
                    }
                  }
                  corners[i].x = bestX + bounds.left - borderWidth;
                  corners[i].y = bestY + bounds.top - borderWidth;
                  corners[i].index = bestPointIndex;
                  ctx.fillStyle = '#000000';
                  ctx.fillRect(bestX, bestY, 1, 1);
                }
                corners.sort(function(a, b) {
                  return a.index < b.index ? -1 : 1;
                });
                var polygon = [];
                for (var i = 0; i < corners.length; i++) {
                  polygon.push(corners[i]);
                }
                Racing.polygons.push(polygon);
              }
              break;
            default:
          }
        }
      }
    }
    var ctx = Racing.canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    var polygons = [];
    for (var i = 0, len = Racing.polygons.length; i < len; i++) {
      var k, corners = Racing.polygons[i],
          corner = corners[0],
          polygon = [];
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y);
      polygon.push(Racing.lambert(corner.x, corner.y));
      for (k = 1; k < corners.length; k++) {
        corner = corners[k];
        ctx.lineTo(corner.x, corner.y);
        polygon.push(Racing.lambert(corner.x, corner.y));
      }
      polygons.push('addComplexBaan([' + polygon.join(',') + ']);');
      corner = corners[0];
      ctx.lineTo(corner.x, corner.y);
      ctx.stroke();
    }
    if (Racing.uniquePolygons == null) {
      Racing.uniquePolygons = {};
    }
    for (var k = 0; k < polygons.length; k++) {
      Racing.uniquePolygons[polygons[k]] = true;
    }
    if (Racing.loadedPoints.length > 1) {
      Racing.imageData = null;
      Racing.canvas = null;
      Racing.loadedPoints = Racing.loadedPoints.slice(1);
      loadPoint();
    } else {
      var uniquePolygons = []
      for (var uniquePolygon in Racing.uniquePolygons) {
        uniquePolygons.push(uniquePolygon);
      }
      console.log(uniquePolygons.join('\n'));
      Racing.canvas.style.width = document.body.clientWidth + 'px';
      Racing.canvas.style.height = parseInt(document.body.clientWidth / Racing.canvas.width * Racing.canvas.height) + 'px';
    }
  }
};