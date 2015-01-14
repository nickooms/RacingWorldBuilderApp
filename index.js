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
  console.log(err);
}
function onInitFs(theFS) {
  fs = theFS;
  readDir();
}
chrome.fileSystem.chooseEntry({ type: 'openDirectory' }, function(theEntry) {
  chrome.storage.local.set({ chosenFile: chrome.fileSystem.retainEntry(theEntry) });
  chrome.storage.local.get('chosenFile', function(items) {
    if (items.chosenFile) {
      chrome.fileSystem.isRestorable(items.chosenFile, function(bIsRestorable) {
        console.info('Restoring ' + items.chosenFile);
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
function loadFile(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(file.name, e.target.result);
    };
    reader.readAsText(file);
  });
}
function loadPoints() {
  Racing.loadedPoints = [];
  for (var i = 0; i < Racing.entries.length; i++) {
    var entry = Racing.entries[i];
    var path = entry.fullPath;
    if (path.indexOf('.point') != -1) {
      loadFile(entry, function(fileName, data) {
        var location = fileName.split('-');
        Racing.layer = location[2].split('#')[0];
        Racing.loadedPoints.push({
          fileName: fileName,
          tiles: JSON.parse(data)
        });
      });
    } else if (path.indexOf('points.json') != -1) {
      loadFile(entry, function(fileName, data) {
        Racing.points = JSON.parse(data);
      });
    } else if (path.indexOf('lines.json') != -1) {
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
function loadDirEntry() {
  var dirReader = Racing.chosenEntry.createReader();
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