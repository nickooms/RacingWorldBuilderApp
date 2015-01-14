window.Images = {
  load: function() {
    var images = [];
    var entries = Racing.entries;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var name = entry.name;
      if (name.indexOf('.png') != -1) {
        images.push(entry);
      }
    }
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
    console.log(cols);
    console.log(rows);
    Racing.tileSize = parseInt(document.body.clientWidth / (cols.length - 1));
    alert('TileSize = ' + Racing.tileSize);
    createCanvas(cols, rows);
    images.forEach(function(image) {
      var name = image.name;
      var components = name.split('-');
      var gemeente = components[0];
      var straat = components[1];
      var layer = components[2];
      var bbox = components[3].replace('.png', '').split(',');
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
      image.file(function(file) {
        var size = Racing.tileSize;
        var url = URL.createObjectURL(file);
        var img = document.createElement('img');
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.onload = function() {
          var size = Racing.tileSize;
          Racing.imagesToLoad--;
          Racing.context.drawImage(img, col * size, row * size, size, size);
          if (Racing.imagesToLoad == 0) {
            Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
            Points.load(function(points) {
              var ctx = Racing.context;
              ctx.fillStyle = '#FF0000';
              for (var i = 0; i < points.length; i++) {
                var point = points[i];
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1, 2 * Math.PI, false);
                ctx.closePath();
                ctx.fill();
              }
              Lines.load(function(lines) {
                alert(lines);
                var minX = cols[0];
                var maxX = cols[cols.length - 1];
                var minY = rows[0];
                var maxY = rows[rows.length - 1];
                var canvas = Racing.canvas;
                var w = canvas.width;
                var h = canvas.height;
                var points = Racing.points;
                var ctx = Racing.context;
                Points.setContext(ctx);
                Points.setDrawingColor('#FF0000');
                //ctx.fillStyle = '#FF0000';
                for (var i = 0; i < lines.length; i++) {
                  var line = lines[i];
                  for (var j = 0; j < line.length; j++) {
                    line[j] = points[line[j]];
                  }
                  for (var j = 0; j < line.length - 1; j++) {
                    var point1 = line[j];
                    var x1 = parseInt(w / (maxX - minX) * (point1.x - minX));
                    var y1 = parseInt(h / (maxY - minY) * (maxY - point1.y));
                    Points.draw(x1, y1);
                    /*ctx.beginPath();
                    ctx.arc(x1, y1, 1, 2 * Math.PI, false);
                    ctx.closePath();
                    ctx.fill();*/
                    var color1 = Racing.pixel(Racing.imageData.data, w, x1, y1);
                    var point2 = line[j + 1];
                    var x2 = parseInt(w / (maxX - minX) * (point2.x - minX));
                    var y2 = parseInt(h / (maxY - minY) * (maxY - point2.y));
                    Points.draw(x2, y2);
                    /*ctx.beginPath();
                    ctx.arc(x2, y2, 1, 2 * Math.PI, false);
                    ctx.closePath();
                    ctx.fill();*/
                    var color2 = Racing.pixel(Racing.imageData.data, w, x2, y2);
                    if (color1.equals(color2)) {
                      ctx.beginPath();
                      ctx.moveTo(x1, y1);
                      ctx.lineTo(x2, y2);
                      var sameColor = true;
                      for (var x = Math.min(x1, x2); x < Math.max(x1, x2); x++) {
                        for (var y = Math.min(y1, y2); y < Math.max(y1, y2); y++) {
                          if (ctx.isPointInPath(x, y)) {
                            alert('onPath');
                            if (!color1.equals(Racing.pixel(Racing.imageData.data, w, x, y))) {
                              sameColor = false;
                            }
                          }
                        }
                      }
                      if (sameColor) {
                        ctx.stroke();
                      }
                    }
                    alert(color1.toHex() + ' ==> ' + color2.toHex());
                  }
                }
                alert(lines);
              });
            });
          }
        }
        img.src = url;
      });
    });
  }
};