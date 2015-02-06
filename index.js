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
function alert(text) {
  console.log(text);
}
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
  //console.log(err);
}
function onInitFs(theFS) {
  fs = theFS;
  readDir();
}
function loadFS() {
  chrome.storage.local.get('chosenFile', function(items) {
    if (items.chosenFile) {
      chrome.fileSystem.isRestorable(items.chosenFile, function(bIsRestorable) {
        console.info('Restoring ' + items.chosenFile);
        chrome.fileSystem.restoreEntry(items.chosenFile, function(chosenEntry) {
          if (chosenEntry) {
            Racing.chosenEntry = chosenEntry;
            fs = chosenEntry.filesystem;
            //loadDirEntry(Images.load);
            loadDirEntry(Processing.init);
          }
        });
      });
    } else {
      chrome.fileSystem.chooseEntry({ type: 'openDirectory' }, function(theEntry) {
        chrome.storage.local.set({ chosenFile: chrome.fileSystem.retainEntry(theEntry) });
        loadFS();
      });
    }
  });
}
chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});
loadFS();
function loadFile(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(file.name, e.target.result);
      Racing.filesToLoad--;
      //console.log(file.name + ' : ' + Racing.filesToLoad);
      if (Racing.filesToLoad == 0) {
        Racing.loadedCallback();
      }
    };
    reader.readAsText(file);
  });
}
function loadPoints(callback) {
  Racing.loadedPoints = [];
  Racing.filesToLoad = 0;
  for (var i = 0; i < Racing.entries.length; i++) {
    var entry = Racing.entries[i];
    var path = entry.fullPath;
    if (path.indexOf('.point') != -1) {
      Racing.filesToLoad++;
      loadFile(entry, function(fileName, data) {
        var location = fileName.split('-');
        Racing.layer = location[2].split('#')[0];
        Racing.loadedPoints.push({
          fileName: fileName,
          tiles: JSON.parse(data)
        });
      });
    } else if (path.indexOf('points.json') != -1) {
      Racing.filesToLoad++;
      loadFile(entry, function(fileName, data) {
        Racing.points = JSON.parse(data);
      });
    } else if (path.indexOf('lines.json') != -1) {
      Racing.filesToLoad++;
      loadFile(entry, function(fileName, data) {
        Racing.lines = JSON.parse(data);
        var location = fileName.split('-');
        Racing.gemeente = location[0];
        Racing.straat = location[1];
      });
    }
  }
}
function loadLines() {
  if (Racing.lines.length > 0) {
    loadLine(Racing.lines[0]);
  } else {
    console.log('Lines loaded');
  }
}
function loadLine(line) {
  var pointsToLoad = [];
  console.log('Line');
  for (var index in line) {
    for (var i = 0; i < Racing.loadedPoints.length; i++) {
      var lineIndex = parseInt(Racing.loadedPoints[i].fileName.split('#')[1]);
      if (line[index] == lineIndex) {
        for (var j = 0; j < Racing.loadedPoints[i].tiles.length; j++) {
          pointsToLoad.push(Racing.loadedPoints[i].tiles[j]);
        }
      }
    }
  }
  var uniqueTiles = {};
  for (var i = 0; i < pointsToLoad.length; i++) {
    var tile = pointsToLoad[i].split('BBOX=')[1].split('&')[0];
    uniqueTiles[tile] = tile
  }
  var tiles = [];
  var tilesToLoad = 0;
  for (var i in uniqueTiles) {
    var tile = Racing.gemeente + '-' + Racing.straat + '-' + Racing.layer + '-' + uniqueTiles[i];
    tiles.push(tile);
    tilesToLoad++;
  }
  Racing.uniqueCols = {};
  Racing.uniqueRows = {};
  for (var i = 0; i < Racing.entries.length; i++) {
    for (var j = 0; j < tiles.length; j++) {
      if (Racing.entries[i].fullPath.indexOf(tiles[j]) != -1) {
        loadFile(Racing.entries[i], function(fileName, data) {
          tilesToLoad--;
          console.log(fileName);
          var components = fileName.split('-');
          var bbox = components[3].split(',');
          Racing.uniqueCols[bbox[0]] = true;
          Racing.uniqueRows[bbox[1]] = true;
          if (tilesToLoad == 0) {
            Racing.entriesToLoad = tiles.length;
            var cols = [], rows = [];
            for (var k in Racing.uniqueCols) {
              cols.push(k);
            }
            cols.sort(Sort.float);
            for (var k in Racing.uniqueRows) {
              rows.push(k);
            }
            rows.sort(Sort.float);
            Racing.cols = cols;
            Racing.rows = rows;
            Racing.tileSize = 512;
            if (Racing.canvas == null) {
              createCanvas(cols, rows);
            } else {
              clearCanvas();
            }
            var col = null, row = null;
            for (var h = 0; h < tiles.length; h++) {
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
            }
          }
        });
      }
    }
  }
}
function loadPoint() {
  var point = Racing.loadedPoints[0];
  var tiles = point.tiles;
  var name = point.fileName.split('#')[0];
  Racing.uniqueCols = {};
  Racing.uniqueRows = {};
  for (var j = 0; j < tiles.length; j++) {
    var fileName = name + '-' + tiles[j].split('BBOX=')[1].split('&')[0] + '.png';
    var components = fileName.split('-');
    var bbox = components[3].split(',');
    Racing.uniqueCols[bbox[0]] = true;
    Racing.uniqueRows[bbox[1]] = true;
  }
  var cols = [], rows = [];
  for (var j in Racing.uniqueCols) {
    cols.push(j);
  }
  cols.sort(Sort.float);
  for (var j in Racing.uniqueRows) {
    rows.push(j);
  }
  rows.sort(Sort.float);
  Racing.cols = cols;
  Racing.rows = rows;
  Racing.tileSize = 512;//Math.floor(Math.max(document.body.clientWidth / cols.length, document.body.clientHeight / rows.length));
  var canvas = Racing.canvas;
  if (canvas == null) {
    canvas = createCanvas(cols, rows);
  } else {
    clearCanvas();
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
  }
}
function loadDirEntry(callback) {
  var dirReader = Racing.chosenEntry.createReader();
  var entries = [];
  var readEntries = function() {
    dirReader.readEntries(function(results) {
      if (!results.length) {
        Racing.entries = entries;
        callback();
        //Racing.loadedCallback = Images.load;
        //loadPoints(callback);
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
Racing.images = {};
Racing.jsonFiles = {};
Racing.tileFiles = {};
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.base64) {
    var ui8a = convertDataURIToBinary(request.base64);
    var path = request.url + '.png';
    Racing.images[path] = ui8a;
    sendResponse('Saved ' + path);
  } else if (request.json) {
    var path = request.url;
    var data = request.json;
    Racing.jsonFiles[path] = JSON.stringify(data);
    sendResponse('Saved ' + path);
  } else if (request.tiles) {
    var path = request.url;
    var data = request.tiles;
    Racing.tileFiles[path] = JSON.stringify(data);
    sendResponse('Saved ' + path);
  } else {
    sendResponse("Oops, I don't understand this message");
  }
});
function loadImageFile(fileName, size, zIndex, col, row) {
  for (var i = 0; i < Racing.entries.length; i++) {
    var entry = Racing.entries[i];
    if (entry.name == fileName) {
      entry.file(function(file) {
        var url = URL.createObjectURL(file);
        var img = document.createElement('img');
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.onload = function() {
          var size = Racing.tileSize;
          Racing.entriesToLoad--;
          Racing.context.drawImage(img, col * size, row * size, size, size);
          if (Racing.entriesToLoad == 0) {
            Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
            Racing.processStreet();
          }
        }
        img.src = url;
      });
    }
  }
}
function deleteFile(fileName) {
  fs.root.getFile(fileName, { create: false }, function(fileEntry) {
    fileEntry.remove(function() {
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
    }, errorHandler);
  }, function(e) {
    if (e.code == FileError.INVALID_MODIFICATION_ERR) {
      alert('Folder does not exists');
    }
  });
}