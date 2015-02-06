window.Images = {
  items: null,
  fromEntries: function() {
    var images = [];
    Racing.entries.forEach(function(entry) {
      var name = entry.name;
      if (name.indexOf('.png') != -1) {
        images.push(entry);
      }
    });
    Images.items = images;
    return images;
  },
  parseFileName: function(image) {
    var components = image.name.split('-');
    return {
      gemeente: components[0],
      straat: components[1],
      layer: components[2],
      bbox: components[3].replace('.png', '').split(',')
    };
  },
  getGrid: function(images) {
    var uniqueCols = {};
    var uniqueRows = {};
    Racing.imagesToLoad = images.length;
    var uniqueCols = {};
    var uniqueRows = {};
    images.forEach(function(image) {
      var name = image.name;
      var components = name.split('-');
      var gemeente = components[0];
      var straat = components[1];
      var layer = components[2];
      var bbox = components[3].replace('.png', '').split(',');
      uniqueCols[bbox[0]] = true;
      uniqueRows[bbox[1]] = true;
      uniqueCols[bbox[2]] = true;
      uniqueRows[bbox[3]] = true;
    });
    var cols = [];
    var rows = [];
    for (var uniqueCol in uniqueCols) {
      cols.push(uniqueCol);
    }
    for (var uniqueRow in uniqueRows) {
      rows.push(uniqueRow);
    }
    cols.sort(Sort.float);
    rows.sort(Sort.float);
    return {
      cols: cols,
      rows: rows
    };
  },
  getGridPos: function(image, grid) {
    var components = Images.parseFileName(image);
    var bbox = components.bbox;
    var layer = components.layer;
    var cols = grid.cols;
    var rows = grid.rows;
    var col = null;
    var row = null;
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
    return {
      row: row,
      col: col
    };
  },
  load: function() {
    var images = Images.images = Images.fromEntries();
    var grid = Racing.grid = Images.getGrid(images);
    Racing.tileSize = 512;//parseInt(document.body.clientWidth / (grid.cols.length - 1));
    alert('TileSize = ' + Racing.tileSize);
    //createCanvas(grid.cols, grid.rows);
    Racing.imagesToLoad = 0;
    //Images.drawLayer(images, 'GRB_WBN');

    Points.load(function(points) {
      Racing.uniquePoints = Points.unique(points);
      Lines.load(function(lines) {
        Racing.roadPieces = RoadPieces.get(lines, points, Racing.grid.cols, Racing.grid.rows);
      });
    });

  },
  drawLayer: function(images, layer) {
    Racing.layer = layer;
    var grid = Racing.grid;
    images.forEach(function(image) {
      if (Images.parseFileName(image).layer == layer) {
        Racing.imagesToLoad++;
        image.file(function(file) {
          var size = Racing.tileSize;
          var url = URL.createObjectURL(file);
          var img = document.createElement('img');
          img.style.width = size + 'px';
          img.style.height = size + 'px';
          img.pos = Images.getGridPos(image, grid);
          img.onload = Tile.loaded;
          img.src = url;
        });
      }
    });
  },
  save: function() {
    if (Images.toSave == null) {
      Images.toSave = [];
      for (var name in Racing.images) {
        Images.toSave.push(name.split('&')[0] + '.png');
      }
    }
    var fileName = Images.toSave[0].split('-').join('_').split(':').join('-');
    console.log(fileName);
    chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
      entry.getFile(fileName, { create: true }, function(writableEntry) {
        var s = Racing.images[Images.toSave[0].replace('.png', '') + '&WIDTH=512&HEIGHT=512.png'];
        var blob = new Blob([s], { type: 'image/png' });
        writableEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + fileName);
            Images.toSave = Images.toSave.splice(1);
            if (Images.toSave.length > 0) {
              setTimeout(Images.save, 0);
            } else {
              JSONFiles.save();
            }
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          fileWriter.write(blob);
        });
      });
    });
  }
};