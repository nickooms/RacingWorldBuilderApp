function findPerpendicularDistance(point, line) {
  var pointX = point[0],
    pointY = point[1],
    lineStart = {
      x: line[0][0],
      y: line[0][1]
    },
    lineEnd = {
      x: line[1][0],
      y: line[1][1]
    },
    slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x),
    intercept = lineStart.y - (slope * lineStart.x),
    result;
  result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
  return result;
}
function douglasPeucker(points, epsilon) {
  var maxIndex = 0,
    maxDistance = 0,
    perpendicularDistance,
    filteredPoints;
  for (var i = 2; i < points.length - 1; i++) {
    perpendicularDistance = findPerpendicularDistance(points[i], [points[1], points[points.length - 1]]);
    if (perpendicularDistance > maxDistance) {
      maxIndex = i;
      maxDistance = perpendicularDistance;
    }
  }
  if (maxDistance >= epsilon) {
    var leftRecursiveResults = douglasPeucker(points.slice(1, maxIndex), epsilon);
    var rightRecursiveResults = douglasPeucker(points.slice(maxIndex), epsilon);
    filteredPoints = leftRecursiveResults.concat(rightRecursiveResults);
  } else {
    filteredPoints = points;
  }
  return filteredPoints;
}
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
function getBounds(imageData) {
  var w = imageData.width;
  var h = imageData.height;
  var data = imageData.data;
  var pixelCount = data.length / 4;
  var left = width - 1;
  var right = 0;
  var top = height - 1;
  var bottom = 0;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var offset = y * 4 * w + x * 4;
      var r = data[offset];
      var g = data[offset + 1];
      var b = data[offset + 2];
      var a = data[offset + 3];
      if (r + g + b + a != 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  };
}
window.Color = {
  inverse: function(color) {
    var a = color.split('');
    for (var i = 1; i < 7; i++) {
      a[i] = (15 - parseInt(a[i], 16)).toString(16);
    }
    return a.join('');
  },
  random: function() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }
};
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
        return ['#', this.r.toString(16), this.g.toString(16), this.b.toString(16)].join('');
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
    /*console.log('leftRight = ' + leftRight);
    console.log('topBottom = ' + topBottom)
    console.log('width = ' + width);
    console.log('height = ' + height);*/
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
    /*if (Racing.imageData == null) {
      setTimeout(Racing.processStreet, Racing.processStreetDelay);
      return;
    }*/
    var borderWidth = 10;
    var cols = Racing.cols;
    var rows = Racing.rows;
    var minX = cols[0];
    var maxX = cols[cols.length - 1];
    var minY = rows[0];
    var maxY = rows[rows.length - 1];
    var d = new Date().getTime();
    /*if (Racing.streetsPoints[Racing.streetPoints].processed == true) {
      return;
    }*/
    //console.log('Processing Street ' + Racing.streetPoints);
    //console.log('Processing Street ');
    //console.log(Racing.loadedPoints[0]);
    //Racing.points = Racing.streetsPoints[Racing.streetPoints].points;
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
          //console.log('Point ' + (j + 1) + ' == Point ' + (b.index + 1) + '/' + Racing.points.length);
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
              var imageData = floodFill(x, y, Racing.context, inv, color.toHex() == '#cccccc' ? 0 : 0, '#0000FF');
              var bounds = getBounds(imageData);
              bounds.index = j;
              var sBounds = JSON.stringify(bounds);
              //console.log('\tBounds: ' + sBounds);
              var filledImageData = Racing.context.getImageData(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
              var canvas = document.createElement('canvas');
              canvas.style.border = '1px solid black';
              canvas.width = bounds.right - bounds.left + borderWidth * 2;//Racing.canvas.width;
              canvas.height = bounds.bottom - bounds.top + borderWidth * 2;//Racing.canvas.height;
              if (document.querySelectorAll('canvas').length == 1) {
                canvas.style.top = Racing.canvas.height;
              }
              //document.body.appendChild(canvas);
              var ctx = canvas.getContext('2d');
              ctx.putImageData(imageData, 10 - bounds.left, 10 - bounds.top);
              var border = MarchingSquares.getBlobOutlinePoints(canvas);
              if (border.length > 0) {
                //if (Racing.bounds[sBounds] == null) {
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
                //}
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
      //console.log('==============');
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
      //console.log()
      ctx.stroke();
    }
    if (Racing.uniquePolygons == null) {
      Racing.uniquePolygons = {};
    }
    for (var k = 0; k < polygons.length; k++) {
      Racing.uniquePolygons[polygons[k]] = true;
    }
    Racing.nr++;
    //console.log('Nr = ' + Racing.nr);
    //console.log('Total = ' + Racing.total)
    if (Racing.loadedPoints.length > 1) {
    //if (Racing.nr < Racing.total) {
      Racing.imageData = null;
      Racing.canvas = null;
      //readDir();
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
    //console.log(polygons.join('\n'));
    //console.log('Processed Street ' + Racing.streetPoints + ' in ' + (new Date().getTime() - d) + ' ms');
    /*if (Racing.canvas.height / Racing.canvas.width > document.body.clientHeight / document.body.clientWidth) {
      Racing.canvas.style.height = document.body.clientHeight;
      Racing.canvas.style.width = document.body.clientHeight / Racing.canvas.height * Racing.canvas.width;
    } else {*/
      

    //}
    /*Racing.streetsPoints[Racing.streetPoints].processed = true;
    for (var streetId in Racing.streetsPoints) {
      if (Racing.streetsPoints[streetId].processed == false) {
        console.log('new streetId: ' + streetId);
        Racing.streetPoints = streetId;
        setTimeout(Racing.processStreet, Racing.processStreetDelay);
        return;
      }
    }*/
  }
};
var fs;
function convertDataURIToBinary(dataURI) {
  var BASE64_MARKER = ';base64,';
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));
  for (i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
var errorHandler = function(err) {
  console.log(err);
}
function onInitFs(theFS) {
  fs = theFS;
  readDir();
}
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
//requestFileSystem(PERSISTENT, 0, onInitFs, errorHandler);
chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(theEntry) {
  chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
  chrome.storage.local.get('chosenFile', function(items) {
    if (items.chosenFile) {
      // if an entry was retained earlier, see if it can be restored
      chrome.fileSystem.isRestorable(items.chosenFile, function(bIsRestorable) {
        // the entry is still there, load the content
        console.info("Restoring " + items.chosenFile);
        chrome.fileSystem.restoreEntry(items.chosenFile, function(chosenEntry) {
          if (chosenEntry) {
            Racing.chosenEntry = chosenEntry;
            fs = chosenEntry.filesystem;
            loadDirEntry();
          }
        });
      });
    }
  });
});
function loadPoints() {
  Racing.loadedPoints = [];
  for (var i = 0; i < Racing.entries.length; i++) {
    var entry = Racing.entries[i];
    var path = entry.fullPath;
    if (path.indexOf('.point') != -1) {
      entry.file(function(file) {
        var reader = new FileReader();
        reader.onerror = errorHandler;
        reader.onload = function(e) {
          Racing.loadedPoints.push({
            fileName: file.name,
            tiles: JSON.parse(e.target.result)
          });
        };
        reader.readAsText(file);
      });
    } else if (path.indexOf('points.json') != -1) {
      entry.file(function(file) {
        var reader = new FileReader();
        reader.onerror = errorHandler;
        reader.onload = function(e) {
          Racing.points = JSON.parse(e.target.result);
        };
        reader.readAsText(file);
      });
    }
  }
}
function loadPoint() {
  //console.log(file.name);
  var point = Racing.loadedPoints[0];
  var tiles = point.tiles;
  var name = point.fileName.split('#')[0];
  Racing.uniqueCols = {};
  Racing.uniqueRows = {};
  for (var j = 0; j < tiles.length; j++) {
    var fileName = name + '-' + tiles[j].split('BBOX=')[1].split('&')[0] + '.png';
    //console.log(fileName);
    var components = fileName.split('-');
    var bbox = components[3].split(',');
    //var bbox = entry.fullPath.split(':')[3].split('&')[0].split(',');
    Racing.uniqueCols[bbox[0]] = true;
    Racing.uniqueRows[bbox[1]] = true;
    //Racing.uniqueCols[bbox[2]] = true;
    //Racing.uniqueRows[bbox[3]] = true;
  }
  //console.log(Racing.uniqueCols);
  //console.log(Racing.uniqueRows);
  var cols = [], rows = [];
  for (var j in Racing.uniqueCols) {
      cols.push(j);
  }
  cols.sort(function(a, b) {
    return parseFloat(a) < parseFloat(b) ? -1 : 1;
  });
  for (var j in Racing.uniqueRows) {
      rows.push(j);
  }
  rows.sort(function(a, b) {
    return parseFloat(a) < parseFloat(b) ? -1 : 1;
  });
  Racing.cols = cols;
  Racing.rows = rows;
  Racing.tileSize = 512;//Math.floor(Math.max(document.body.clientWidth / cols.length, document.body.clientHeight / rows.length));
  //console.log('Tile Size = ' + Racing.tileSize + 'x' + Racing.tileSize);
  var canvas = Racing.canvas;
  if (canvas == null) {
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
  } else {
    Racing.context.clearRect(0, 0, canvas.width, canvas.height);
  }
  Racing.entriesToLoad = tiles.length;
  var col = null, row = null;
  for (var j = 0; j < tiles.length; j++) {
    var fileName = name + '-' + tiles[j].split('BBOX=')[1].split('&')[0] + '.png';
    var components = fileName.split('-');
    var bbox = components[3].split(',');
    for (var k = 0; k < cols.length; k++) {
      if (cols[k] == bbox[0]) {
        col = k;
      }
    }
    for (var k = 0; k < rows.length; k++) {
      if (rows[k] == bbox[1]) {
        row = rows.length - 2 - k;
      }
    }
    loadImageFile(fileName, Racing.tileSize, 100, col, row);
    //console.log(fileName);
  }
}
function loadDirEntry() {
  chosenEntry = Racing.chosenEntry;
  var dirReader = chosenEntry.createReader();
  var entries = [];
  var readEntries = function() {
     dirReader.readEntries(function(results) {
      if (!results.length) {
        Racing.entries = entries;
        loadPoints();
      } else {
        results.forEach(function(item) { 
          entries = entries.concat(item);
        });
        readEntries();
      }
    }, errorHandler);
  };
  readEntries();
}
(function(context) {
  document.getElementById('appid').value = chrome.runtime.id;
  var logField = document.getElementById('log');
  var sendText = document.getElementById('sendText');
  var sendText = document.getElementById('sendText');
  var sendId = document.getElementById('sendId');
  var send = document.getElementById('send');
  var list = document.getElementById('list');
  var _delete = document.getElementById('delete');
  /*send.addEventListener('click', function() {
    appendLog('sending to ' + sendId.value);
    chrome.runtime.sendMessage(sendId.value, {
      myCustomMessage: sendText.value
    }, function(response) {
      appendLog('response: ' + JSON.stringify(response));
    })
  });*/
  
  list.addEventListener('click', readDir, function(response) {
      
  });
  _delete.addEventListener('click', deleteAll, function(response) {
      appendLog('response: ' + JSON.stringify(response));
  });
  blacklistedIds = ['none'];
  Racing.images = {};
  Racing.jsonFiles = {};
  Racing.tileFiles = {};
  chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    //console.log('FILE ' + request.url);
    //chrome.fileSystem.getWritableEntry
    if (request.base64) {
      var ui8a = convertDataURIToBinary(request.base64);
      var path = request.url + '.png';
      //var config = {type: 'saveFile', suggestedName: 'test.txt'};
      Racing.images[path] = ui8a;
      //console.log(path);
      //var config = {type: 'saveFile', suggestedName: 'test.txt'};
      /*chrome.fileSystem.chooseEntry(config, function(writableEntry) {
        var blob = new Blob(['ui8a'], {type: 'image/png'});
        writeFileEntry(writableEntry, blob, function(e) {
          console.log('Write complete :)');
        });
      });*/

      //chrome.fileSystem.chooseEntry(config, function(fileEntry) {
      //chrome.fileSystem.getWritableEntry(path, function(fileEntry) {
      /*fs.root.getFile(path, { create: true }, function(fileEntry) {
        console.log('FILE ' + fileEntry);
        var url = request.url;
        var blob = new Blob([ui8a], {
          type: 'image/png'
        });
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + url + '.png');
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          fileWriter.write(blob);
        });
      });*/
      sendResponse('Saved ' + path);
    } else if (request.json) {
      var path = request.url;
      var data = request.json;
      Racing.jsonFiles[path] = JSON.stringify(data);
      /*fs.root.getFile(path, {
        create: true
      }, function(fileEntry) {
        var url = path;
        var json = data;
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + url);
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          var blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
          fileWriter.write(blob);
        });
      });*/
      sendResponse('Saved ' + path);
    } else if (request.tiles) {
      var path = request.url;
      var data = request.tiles;
      Racing.tileFiles[path] = JSON.stringify(data);
      fs.root.getFile(path, {
        create: true
      }, function(fileEntry) {
        var url = path;
        var json = data;
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + url);
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          var blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
          fileWriter.write(blob);
        });
      });
      sendResponse('Saved ' + path);
      /*for (var i = 0; i < request.tiles.length; i++) {
        var tile = request.tiles[i];
        fs.root.getFile('/' + tile.fileName + '.png', {}, function(file, tile) {
          var img = document.createElement('img');
          img.style.position = 'absolute';
          img.style.left = tile.points[0] * 512 + 'px';
          img.style.top = tile.points[1] * 512 + 'px';
          img.style.width = '512px';
          img.style.height = '512px';
          img.src = file.toURL();
          document.body.appendChild(img); //or document.body
        });
      }*/
      //readDir();
    } else {
      sendResponse("Oops, I don't understand this message");
    }
  });
  var appendLog = function(message) {
    logField.innerText += "\n" + message;
  }
  context.appendLog = appendLog;
})(window);
function saveImages() {
  if (Racing.saveImages == null) {
    Racing.saveImages = [];
    for (var name in Racing.images) {
      Racing.saveImages.push(name.split('&')[0] + '.png');
    }
  }
  var fileName = Racing.saveImages[0].split(':').join('-');
  console.log(fileName);
  var config = { type: 'saveFile', suggestedName: fileName };
  chrome.fileSystem.chooseEntry(config, function(writableEntry) {
    //console.log(fileName.split('_').join(':').replace('.png', '') + '&WIDTH=512&HEIGHT=512.png');
    var s = Racing.images[Racing.saveImages[0].replace('.png', '') + '&WIDTH=512&HEIGHT=512.png'];
    console.log(s.length);
    var blob = new Blob([s], { type: 'image/png' });
    writableEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        console.log('Saved ' + fileName);
        Racing.saveImages = Racing.saveImages.splice(1);
        if (Racing.saveImages.length > 0) {
          setTimeout(saveImages, 0);
        }
      };
      fileWriter.onerror = function(e) {
        console.log('Save failed: ' + e.toString());
      };
      fileWriter.write(blob);
    });
  });
}
function saveJsonFiles() {
  if (Racing.saveJsonFiles == null) {
    Racing.saveJsonFiles = [];
    for (var name in Racing.jsonFiles) {
      Racing.saveJsonFiles.push(name);
    }
  }
  var fileName = Racing.saveJsonFiles[0].split(':').join('-');
  console.log(fileName);
  var config = { type: 'saveFile', suggestedName: fileName };
  chrome.fileSystem.chooseEntry(config, function(writableEntry) {
    //console.log(fileName.split('_').join(':').replace('.png', '') + '&WIDTH=512&HEIGHT=512.png');
    var s = Racing.jsonFiles[Racing.saveJsonFiles[0]];
    console.log(s.length);
    var blob = new Blob([s], { type: 'text/plain' });
    writableEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        console.log('Saved ' + fileName);
        Racing.saveJsonFiles = Racing.saveJsonFiles.splice(1);
        if (Racing.saveJsonFiles.length > 0) {
          setTimeout(saveJsonFiles, 0);
        }
      };
      fileWriter.onerror = function(e) {
        console.log('Save failed: ' + e.toString());
      };
      fileWriter.write(blob);
    });
  });
}
function saveTileFiles() {
  if (Racing.saveTileFiles == null) {
    Racing.saveTileFiles = [];
    for (var name in Racing.tileFiles) {
      Racing.saveTileFiles.push(name);
    }
  }
  var fileName = Racing.saveTileFiles[0].split(':').join('-');
  console.log(fileName);
  var config = { type: 'saveFile', suggestedName: fileName };
  chrome.fileSystem.chooseEntry(config, function(writableEntry) {
    //console.log(fileName.split('_').join(':').replace('.png', '') + '&WIDTH=512&HEIGHT=512.png');
    var s = Racing.tileFiles[Racing.saveTileFiles[0]];
    console.log(s.length);
    var blob = new Blob([s], { type: 'text/plain' });
    writableEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        console.log('Saved ' + fileName);
        Racing.saveTileFiles = Racing.saveTileFiles.splice(1);
        if (Racing.saveTileFiles.length > 0) {
          setTimeout(saveTileFiles, 0);
        }
      };
      fileWriter.onerror = function(e) {
        console.log('Save failed: ' + e.toString());
      };
      fileWriter.write(blob);
    });
  });
}
/*function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    console.log('Nothing selected.');
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } 
    else {
      chosenEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}
function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    } 
    else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}*/
function readDir() {
  //var entries = [];
  //var dirReader = null;
  //var dirEntry = null;
  function removeImages() {
    var images = document.getElementsByTagName('canvas');
    while (images.length > 0) {
      document.body.removeChild(images[0]);
    }
  }
  chosenEntry = Racing.chosenEntry;
  console.log(chosenEntry);
  if (chosenEntry.isDirectory) {
    var dirReader = chosenEntry.createReader();
    var entries = [];
    var readEntries = function() {
       dirReader.readEntries (function(results) {
        if (!results.length) {
          console.log(entries.join('\n'));
          processEntriesRead();
        } else {
          results.forEach(function(item) { 
            entries = entries.concat(item.fullPath);
          });
          readEntries();
        }
      }, errorHandler);
    };
    readEntries();
  }
  function addEntriesRead() {
    dirReader.readEntries(function(newEntries) {
      for (var i = 0; i < newEntries.length; i++) {
        var entry = newEntries[i];
        var components = entry.fullPath.substr(1).split(':');
        //console.log(components.join('|'));
        var gemeente = Racing.gemeenten[components[0]];
        //console.log('gemeente = ' + gemeente);
        var straat = Racing.straten[components[1]];
        //console.log('straat = ' + straat);
        switch (components[2]) {
          case 'points.json':
          case 'lines.json':
            fs.root.getFile(entry.fullPath, {}, function(fileEntry) {
              var components = fileEntry.fullPath.substr(1).split(':');
              var streetId = components[0] + ':' + components[1];
              //console.log('streetId from fileName = ' + streetId);
              fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                  var result = JSON.parse(this.result);
                  //console.log(fileEntry.fullPath + ':' + result.length);
                  if (fileEntry.fullPath.indexOf('points.json') != -1) {
                    var streetId = components[0] + ':' + components[1];
                    Racing.streetPoints = streetId;
                    Racing.streetsPoints[Racing.streetPoints] = {
                      points: result,
                      processed: false
                    }
                    Racing.thePoints = result;
                    //setTimeout(Racing.processStreet, Racing.processStreetDelay);
                  }
                  if (fileEntry.fullPath.indexOf('lines.json') != -1) {
                    Racing.lines = result;
                  }
                };
                reader.readAsText(file);
              }, errorHandler);
            });
            break;
          default:
            if ((typeof gemeente == 'undefined' || gemeente != false) && (typeof straat == 'undefined' || straat != false)) {
              if (components[2].indexOf('.point') != -1) {
                var read = false;
                var nr = parseInt(components[2].split('#')[1]);
                var total = parseInt(components[2].split('#')[2]);
                if (Racing.nr == null) {
                  Racing.total = total;
                  Racing.nr = 0;
                  read = true;
                } else {
                  if (Racing.nr == nr) {
                    read = true;
                  }
                }
                if (read) {
                  console.log('NR = ' + nr + '/' + total);
                  fs.root.getFile(entry.fullPath, {}, function(fileEntry) {
                    var components = fileEntry.fullPath.substr(1).split(':');
                    var nr = parseInt(components[2].split('#')[1]);
                    var total = parseInt(components[2].split('#')[2]);
                    var streetId = components.join(':');
                    //console.log('points from fileName = ' + streetId);
                    
                    fileEntry.file(function(file) {
                      var reader = new FileReader();
                      reader.onloadend = function(e) {
                        var result = JSON.parse(this.result);
                        //console.log(nr + '/' + total);
                        if (fileEntry.fullPath.indexOf('.point') != -1) {
                          var streetId = components[0] + ':' + components[1];
                          //Racing.streetPoints = streetId + ':' + nr + ':' + total;
                          if (Racing.nr == null) {
                            Racing.tiles = result;
                            setTimeout(Racing.processStreet, Racing.processStreetDelay);
                          } else {
                            if (Racing.nr == nr) {
                              Racing.tiles = result;
                              /*Racing.streetsPoints[Racing.streetPoints] = {
                                points: result,
                                processed: false
                              }*/
                              setTimeout(Racing.processStreet, Racing.processStreetDelay);
                            }
                          }
                        }
                        if (fileEntry.fullPath.indexOf('lines.json') != -1) {
                          Racing.lines = result;
                        }
                      };
                      reader.readAsText(file);
                    }, errorHandler);
                  });
                }
              } else {
                entries.push(entry);
              }
            }
        }    
      }
      if (newEntries.length != 0) {
        addEntriesRead();
        console.log('files: ' + entries.length);
      } else {
        if (entries.length != 0) {
          processEntriesRead();
        }
      }
    });
  }
  function processEntriesRead() {
    console.log('***************************************');
    if (Racing.tiles == null) {
      setTimeout(processEntriesRead, Racing.processStreetDelay);
      return;
    }
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var found = false;
      for (var j = 0; j < Racing.tiles.length; j++) {
        //console.log();
        if (Racing.tiles[j].split('BBOX=')[1] + '.png' == entry.fullPath.split(':')[3]) {
          found = true;
        }
      }

//http://geo-vlaanderen.agiv.be/gdiviewer/proxy/regularproxycrab.ashx?url=http://aocsrv88/CRABREST/crab.svc/GetFeatureShape?StreetID=2123&_dc=1420202611099&ext-comp-1071=Antwerpen&ext-comp-1072=Noorderlaan&ext-comp-1073=Selecteer%20een%20huisnummer%20...&crab_imm_chkbx=a


      /*chrome.fileSystem.getDisplayPath(dirEntry, function(path) {
        console.log('DisplayPath ' + dirEntry.name + '===' +path);
      });*/
      if (entry.isFile && found) {
        var bbox = entry.fullPath.split(':')[3].split('&')[0].split(',');
        Racing.uniqueCols[bbox[0]] = true;
        Racing.uniqueRows[bbox[1]] = true;
        Racing.uniqueCols[bbox[2]] = true;
        Racing.uniqueRows[bbox[3]] = true;
      }
    }
    var cols = [], rows = [];
    for (var i in Racing.uniqueCols) {
        cols.push(i);
    }
    cols.sort(function(a, b) {
      return parseFloat(a) < parseFloat(b) ? -1 : 1;
    });
    for (var i in Racing.uniqueRows) {
        rows.push(i);
    }
    rows.sort(function(a, b) {
      return parseFloat(a) < parseFloat(b) ? -1 : 1;
    });
    Racing.cols = cols;
    Racing.rows = rows;
    Racing.tileSize = 512;//Math.floor(Math.max(document.body.clientWidth / cols.length, document.body.clientHeight / rows.length));
    //console.log('Tile Size = ' + Racing.tileSize + 'x' + Racing.tileSize);
    Racing.canvas = document.createElement('canvas');
    Racing.canvas.style.position = 'absolute';
    Racing.canvas.style.zIndex = 100;
    Racing.canvas.style.left = '0px';
    Racing.canvas.style.top = '0px';
    Racing.canvas.width = (cols.length - 1) * Racing.tileSize;
    Racing.canvas.height = (rows.length - 1) * Racing.tileSize;
    document.body.appendChild(Racing.canvas);
    Racing.context = Racing.canvas.getContext('2d');
    Racing.entriesToLoad = Racing.tiles.length;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var found = false;
      for (var j = 0; j < Racing.tiles.length; j++) {
        //console.log();
        if (Racing.tiles[j].split('BBOX=')[1] + '.png' == entry.fullPath.split(':')[3]) {
          found = true;
        }
      }
      //console.log('found=' + found);
      if (entry.isFile && found) {
        var components = entry.fullPath.substr(1).split(':');
        var layer = components[2];
        var zIndex = {
          'GRB_WBN': 100,
          'GRB_WGO': 101,
          'GRB_WVB': 102,
          'GRB_WKN': 103,
          'GRB_WRI': 104,
          'GRB_WPI': 105,
          'GRB_WTI': 106,
          'GRB_WLI': 107,
          'GRB_TRN': 108,
          'GRB_ADP': 109,
          'GRB_ADP_Grens': 110,
          'GRB_GBG': 111,
          'ortho': 112
        }[layer];
        //console.log('Loaded: ' + components.join(':'));
        var bbox = components[3].split(',');
        for (var j = 0; j < cols.length; j++) {
          if (cols[j] == bbox[0]) {
            entry.col = j;
          }
        }
        for (var j = 0; j < rows.length; j++) {
          if (rows[j] == bbox[1]) {
            entry.row = rows.length - 2 - j;
          }
        }
        loadImageFile(entry.fullPath, Racing.tileSize, zIndex, entry.col, entry.row);
      }
    }
  }
 /* navigator.webkitPersistentStorage.queryUsageAndQuota(function(usage, quota) {
    console.log('usage ' + usage + ' quota ' + quota);
  }, errorHandler);*/
  removeImages();
  //fs.root.getDirectory('', {}, function(entry) {
    dirEntry = Racing.chosenEntry;//entry;
    dirReader = dirEntry.createReader();
    addEntriesRead();
  //}, errorHandler);
}

function deleteAll() {
  var entries = [];
  var dirReader = null;
  var dirEntry = null;
  function addEntriesDelete() {
    dirReader.readEntries(function(newEntries) {
      console.log('new entries: ' + newEntries.length);
      for (var i = 0; i < newEntries.length; i++) {
        var entry = newEntries[i];
        entries.push(entry);
      }
      if (newEntries.length != 0) {
        addEntriesDelete();
      } else {
        processEntriesDelete();
      }
    });
  }
  function processEntriesDelete() {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      (entry.isDirectory ? deleteFolder : deleteFile)(entry.fullPath);
    }
    readDir();
  }
  fs.root.getDirectory('', {}, function(entry) {
    dirEntry = entry;
    dirReader = dirEntry.createReader();
    addEntriesDelete();
  }, errorHandler);
}

function loadImageFile(fileName, size, zIndex, col, row) {
  for (var i = 0; i < Racing.entries.length; i++) {
    var entry = Racing.entries[i];
    if (entry.name == fileName) {
      //console.log(entry.fullPath);
      entry.file(function(file) {
        /*var reader = new FileReader();
        reader.onerror = errorHandler;
        reader.onload = function(e) {
          //console.log(file.name);
          var blob = new Blob([e.target.result], { type: 'text/plain' });
          var url = URL.createObjectURL(blob);
          //console.log(blob);
          var size = Racing.tileSize;*/
          var url = URL.createObjectURL(file);
          var img = document.createElement('img');
          img.style.position = 'absolute';
          img.style.left = col * size + 'px';
          img.style.top = row * size + 'px';
          img.style.width = size + 'px';
          img.style.height = size + 'px';
          img.style.zIndex = zIndex;
          img.onload = function() {
            var size = Racing.tileSize;
            Racing.entriesToLoad--;
            //console.log('entriesToLoad = ' + Racing.entriesToLoad);
            Racing.context.drawImage(img, col * size, row * size, size, size);
            if (Racing.entriesToLoad == 0) {
              Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
              Racing.processStreet();
            }
          }
          img.src = url;
        //};
        //reader.readAsText(file);
      });
      /*entry.file(function(file) {
        console.log(file.toURL());
        var img = document.createElement('img');
        img.style.position = 'absolute';
        img.style.left = col * size + 'px';
        img.style.top = row * size + 'px';
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.zIndex = zIndex;
        img.src = file.toURL();
        img.onload = function() {
          var size = Racing.tileSize;
          Racing.entriesToLoad--;
          //console.log('entriesToLoad = ' + Racing.entriesToLoad);
          Racing.context.drawImage(img, col * size, row * size, size, size);
          if (Racing.entriesToLoad == 0) {
            Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
          }
        }
      });*/
      /*Racing.chosenEntry.getFile(entry, {}, function(file) {
        var img = document.createElement('img');
        img.style.position = 'absolute';
        img.style.left = col * size + 'px';
        img.style.top = row * size + 'px';
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.zIndex = zIndex;
        img.src = file.toURL();
        img.onload = function() {
          var size = Racing.tileSize;
          Racing.entriesToLoad--;
          //console.log('entriesToLoad = ' + Racing.entriesToLoad);
          Racing.context.drawImage(img, col * size, row * size, size, size);
          if (Racing.entriesToLoad == 0) {
            Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
          }
        }
      });*/
    }
  }
  /*
  });*/
}

function deleteFile(fileName) {
  fs.root.getFile(fileName, { create: false }, function(fileEntry) {
    fileEntry.remove(function() {
      //displayDirectory();
    }, errorHandler);
  }, function(e) {
    if (e.code == FileError.INVALID_MODIFICATION_ERR) {
      alert('Filename does not exists');
    }
  });
}

function deleteFolder(fileName) {
  fs.root.getDirectory(fileName, { create: false }, function(dirEntry) {
    dirEntry.removeRecursively(function() {
      //displayDirectory();
    }, errorHandler);
  }, function(e) {
    if (e.code == FileError.INVALID_MODIFICATION_ERR) {
      alert('Folder does not exists');
    }
  });
}