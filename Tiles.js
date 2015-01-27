window.Tiles = {
  load: function(ids, line, callback) {
    Tiles.unique = {};
    Tiles.tilesToLoad = ids.length;
    Tiles.uniqueCols = {};
    Tiles.uniqueRows = {};
    for (var i = 0; i < Racing.entries.length; i++) {
      var entry = Racing.entries[i];
      var path = entry.fullPath;
      for (var j = 0; j < ids.length; j++) {
        if (path.indexOf('#' + ids[j] + '#') != -1) {
          loadFile(entry, function(fileName, data) {
            var tiles = JSON.parse(data);
            for (var h = 0; h < tiles.length; h++) {
              var tile = tiles[h];
              var layer = tile.split('LAYERS=')[1].split('&')[0];
              var bbox = tile.split('BBOX=')[1].split('&')[0];
              Tiles.unique[layer + ' ' + bbox] = true;
              Tiles.tilesToLoad--;
              Tiles.foundColors = {};
              Tiles.foundR = {};
              Tiles.foundG = {};
              Tiles.foundB = {};
              if (Tiles.tilesToLoad == 0) {
                var images = Images.fromEntries();
                for (var uniqueTile in Tiles.unique) {
                  //alert(uniqueTile);
                  images.forEach(function(image) {
                    //var layer = uniqueTile.split(' ')[0];
                    var bbox = uniqueTile.split(' ')[1];
                    var bbox = bbox.split(',');
                    //alert(image.name);
                    Tiles.uniqueCols[bbox[0]] = true;
                    Tiles.uniqueRows[bbox[1]] = true;
                    Tiles.uniqueCols[bbox[2]] = true;
                    Tiles.uniqueRows[bbox[3]] = true;
                    if (image.name.indexOf(bbox.join(',')) != -1) {
                      Racing.imagesToLoad++;
                      //alert(Racing.imagesToLoad);
                      image.file(function(file) {
                        var size = Racing.tileSize = 512;
                        var url = URL.createObjectURL(file);
                        //alert(file.name);
                        var img = document.createElement('img');
                        img.style.width = size + 'px';
                        img.style.height = size + 'px';
                        img.bbox = bbox;
                        var components = Tiles.parseFileName(file);
                        //alert(components);
                        for (var component in components) {
                          img[component] = components[component];
                        }
                        //img.src = url;
                        //var components = file.name.split('-');
                        /*img.gemeente = components.gemeente;
                        img.straat = components.straat;
                        img.layer = components.layer;
                        img.saveName = components[3];*/
                        //img.pos = Images.getGridPos(image, grid);
                        img.onload = function(evt) {
                          var img = evt.target;
                          var gridPos = Tiles.getGridPos(file, {
                            cols: Tiles.cols,
                            rows: Tiles.rows
                          });
                          //alert(image);
                          var size = 512;
                          var x = gridPos.col * size;
                          var y = gridPos.row * size;
                          
                          switch (img.layer) {
                            case 'GRB_WGO':
                              var checkPurple = Tiles.check(img, img.layer + 'PURPLE');
                              var checkBrown = Tiles.check(img, img.layer + 'BROWN');
                              if (!checkPurple) {
                                Racing.context.drawImage(img, x, y, size, size);
                                var imageData = Racing.context.getImageData(x, y, size, size);
                                var data = imageData.data;
                                var alphas = {};
                                for (var i = 0; i < size * size * 4; i += 4) {
                                  var r = data[i];
                                  var g = data[i + 1];
                                  var b = data[i + 2];
                                  var avg = (r + g + b) / 3;
                                  if (r != avg || g != avg || b != avg) {
                                    var alpha = data[i + 3];
                                    if (alpha != 0) {
                                      if (alphas[alpha] == null) {
                                        alphas[alpha] = [];
                                      }
                                      alphas[alpha].push({
                                        r: r,
                                        g: g,
                                        b: b
                                      });
                                      data[i + 3] = b == 0 ? 0 : 255;
                                      Tiles.foundColors[r + ',' + g + ',' + b] = true;
                                      Tiles.foundR[r] = true;
                                      Tiles.foundG[g] = true;
                                      Tiles.foundB[b] = true;
                                      if (b != 0) {
                                        if (g != 0) {
                                          data[i] = 0;// - r;
                                          data[i + 1] = 0;//255 - g;
                                          data[i + 2] = 0;//255 - b;
                                          data[i + 3] = 0;
                                        } else {
                                          data[i] = 0;
                                          data[i + 1] = 0;
                                          data[i + 2] = 0;
                                          data[i + 3] = 255;
                                        }
                                      } else {
                                        if (g != 0) {
                                          data[i] = 0;// - r;
                                          data[i + 1] = 0;//255 - g;
                                          data[i + 2] = 255;//255 - b;
                                          data[i + 3] = 0;
                                        } else {
                                          data[i] = 0;
                                          data[i + 1] = 255;
                                          data[i + 2] = 0;
                                          data[i + 3] = 0;
                                        }
                                      }
                                    }
                                  } else {
                                    data[i + 3] = 0;
                                  }
                                }
                                Racing.context.putImageData(imageData, x, y);
                                var canvasPurple = document.createElement('canvas');
                                canvasPurple.width = 512;
                                canvasPurple.height = 512;
                                canvasPurple.getContext('2d').putImageData(imageData, 0, 0);
                                var fileName = img.gemeente + '-' + img.straat + '-' + img.layer + 'PURPLE-' + img.saveName;
                                Tiles.saveFile(fileName, canvasPurple);
                              }
                              //BROWN
                              if (!checkBrown) {
                                Racing.context.drawImage(img, x, y, size, size);
                                var imageData = Racing.context.getImageData(x, y, size, size);
                                var data = imageData.data;
                                var alphas = {};
                                for (var i = 0; i < size * size * 4; i += 4) {
                                  var r = data[i];
                                  var g = data[i + 1];
                                  var b = data[i + 2];
                                  var avg = (r + g + b) / 3;
                                  if (r != avg || g != avg || b != avg) {
                                    var alpha = data[i + 3];
                                    if (alpha != 0) {
                                      if (alphas[alpha] == null) {
                                        alphas[alpha] = [];
                                      }
                                      alphas[alpha].push({
                                        r: r,
                                        g: g,
                                        b: b
                                      });
                                      data[i + 3] = b == 0 ? 0 : 255;
                                      Tiles.foundColors[r + ',' + g + ',' + b] = true;
                                      Tiles.foundR[r] = true;
                                      Tiles.foundG[g] = true;
                                      Tiles.foundB[b] = true;
                                      if (b != 0) {
                                        if (g != 0) {
                                          data[i] = 0;// - r;
                                          data[i + 1] = 0;//255 - g;
                                          data[i + 2] = 0;//255 - b;
                                          data[i + 3] = 0;
                                        } else {
                                          data[i] = 0;
                                          data[i + 1] = 0;
                                          data[i + 2] = 0;
                                          data[i + 3] = 0;
                                        }
                                      } else {
                                        if (g != 0) {
                                          data[i] = 0;// - r;
                                          data[i + 1] = 0;//255 - g;
                                          data[i + 2] = 255;//255 - b;
                                          data[i + 3] = 255;
                                        } else {
                                          data[i] = 0;
                                          data[i + 1] = 0;
                                          data[i + 2] = 255;
                                          data[i + 3] = 0;
                                        }
                                      }
                                    }
                                  } else {
                                    data[i + 3] = 0;
                                  }
                                }
                                Racing.context.putImageData(imageData, x, y);
                                var canvasBrown = document.createElement('canvas');
                                canvasBrown.width = 512;
                                canvasBrown.height = 512;
                                canvasBrown.getContext('2d').putImageData(imageData, 0, 0);
                                var fileName = img.gemeente + '-' + img.straat + '-' + img.layer + 'BROWN-' + img.saveName;
                                Tiles.saveFile(fileName, canvasBrown);
                              }
                              break;
                            case 'GRB_WBN':
                              Racing.context.drawImage(img, x, y, size, size);
                              break;
                            case 'GRB_WGOPURPLE':
                              Racing.context.drawImage(img, x, y, size, size);
                              break;
                            case 'GRB_WGOBROWN':
                              Racing.context.drawImage(img, x, y, size, size);
                              break;
                          }

                          Racing.imagesToLoad--;
                          //alert(Racing.imagesToLoad);
                          if (Racing.imagesToLoad == 0) {
                            //alert(666);
                            var canvas = Racing.canvas;
                            Racing.imageData = Racing.context.getImageData(0, 0, canvas.width, canvas.height);
                            var ctx = canvas.getContext('2d');
                            var w = canvas.width;
                            var h = canvas.height;
                            var cols = Tiles.cols;
                            var rows = Tiles.rows;
                            var minX = cols[0];
                            var maxX = cols[cols.length - 1];
                            var minY = rows[0];
                            var maxY = rows[rows.length - 1];
                            //alert(minX + ' - ' + maxX);
                            //alert(minY + ' - ' + maxY);
                            var uniquePoints = Racing.uniquePoints;
                            //alert(line);
                            var roadPieces = [];
                            for (var j = 0; j < line.length - 1; j++) {
                              var roadPiece = {};
                              var point1 = line[j];
                              var x1 = parseInt(w / (maxX - minX) * (point1.x - minX));
                              var y1 = parseInt(h / (maxY - minY) * (maxY - point1.y));

                              var color1 = Racing.pixel(Racing.imageData.data, w, x1, y1);
                              //alert([x1,y1] + ',' + color1.toHex());
                              var point2 = line[j + 1];
                              for (var k = 0; k < uniquePoints.length; k++) {
                                if (JSON.stringify(uniquePoints[k]) == JSON.stringify(point1)) {
                                  point1.Point = k;
                                }
                                if (JSON.stringify(uniquePoints[k]) == JSON.stringify(point2)) {
                                  point2.Point = k;
                                }
                              }
                              var x2 = parseInt(w / (maxX - minX) * (point2.x - minX));
                              var y2 = parseInt(h / (maxY - minY) * (maxY - point2.y));
                              //canvas.getContext('2d').fillRect(x1, y1, 10, 10);
                              //canvas.getContext('2d').fillRect(x2, y2, 10, 10);
                              var color2 = Racing.pixel(Racing.imageData.data, w, x2, y2);

                              if (color1.equals(color2)) {
                                //alert(color1.toHex() + ' == ' + color2.toHex());
                                ctx.beginPath();
                                ctx.moveTo(x1, y1);
                                ctx.lineTo(x2, y2);
                                ctx.fill();
                                roadPiece[point1.Point] = true;
                                roadPiece[point2.Point] = true;
                              } else {
                                roadPiece = {};
                                roadPieces.push(roadPiece);
                                roadPiece[point2.Point] = true;
                              }
                            }
                            for (var i = 0; i < roadPieces.length; i++) {
                              var newRoadPiece = [];
                              for (var point in roadPieces[i]) {
                                newRoadPiece.push(parseInt(point));
                              }
                              roadPieces[i] = newRoadPiece;
                            }
                            function firstRoadPiece(roadPiece) {
                              for (var i = 0; i < roadPieces.length; i++) {
                                var piece = roadPieces[i];
                                for (var j = 0; j < roadPiece.length; j++)  {
                                  if (piece.indexOf(roadPiece[j]) != -1) {
                                    return i;
                                  }
                                }
                              }
                            }
                            for (var i = roadPieces.length - 1; i >= 0; i--) {
                              var roadPiece = roadPieces[i];
                              if (roadPiece.length != 0) {
                                var index = firstRoadPiece(roadPiece);
                                if (i != index) {
                                  //alert('RoadPiece ' + i + ' ' + JSON.stringify(roadPiece) + ' = RoadPiece ' + index + ' ' + JSON.stringify(roadPieces[index]));
                                  for (var j = 0; j < roadPiece.length; j++) {
                                    var piece = roadPiece[j];
                                    if (roadPieces[index].indexOf(piece) == -1) {
                                      roadPieces[index].push(piece);
                                    }
                                  }
                                  roadPieces[i] = [];
                                }
                              }
                            }
                            roadPieces = roadPieces.filter(function(roadPiece) {
                              return roadPiece.length == 0 ? null : roadPiece;
                            }).map(function(roadPiece) {
                              return {
                                points: roadPiece
                              };
                            });
                            RoadPieces.items = roadPieces;
                            //alert(roadPieces);
                            var imageData = Racing.imageData;
                            var newCanvas, newContext;
                            var polygons = [];
                            for (var i = 0; i < roadPieces.length; i++) {
                              var roadPiece = roadPieces[i].points;
                              //alert('RoadPiece ' + i + ' = ' + JSON.stringify(roadPiece));
                              for (var j = 0; j < roadPiece.length; j++) {
                                var point = Racing.points[roadPiece[j]];
                                var x = parseInt(w / (maxX - minX) * (point.x - minX));
                                var y = parseInt(h / (maxY - minY) * (maxY - point.y));
                                var color = Racing.pixel(imageData.data, imageData.width, x, y).toHex();
                                var newColor = null;
                                var newC = null;
                                var trans = 255;
                                //alert(color);
                                switch (color) {
                                  case '#cccccc':
                                    newColor = (0xFF << 24) | (0 << 16) | (0 << 8);
                                    newC = '#FF0000';
                                    //newColor = (0 << 24) | (0 << 16) | (0 << 8);
                                    break;
                                  case '#b7b7b7':
                                    newColor = (0 << 24) | (0xFF << 16) | (0 << 8);
                                    newC = '#00FF00';
                                    //newColor = (0 << 24) | (0 << 16) | (0 << 8);
                                    break;
                                  case '#ff0000':
                                  //case '#a52a2a':
                                    newColor = (0x88 << 24) | (0 << 16) | (0 << 8);
                                    newC = '#880000';
                                    trans = 0;
                                    break;
                                  case '#00ff00':
                                    newColor = (0 << 24) | (0x88 << 16) | (0 << 8);
                                    newC = '#008800';
                                    trans = 0;
                                    break;
                                  default:
                                    //alert(color);
                                    newColor = 0x000000;//Color.inverse(color);//parseInt(color.replace('#', ''), 16);
                                    newC = '#000000'
                                }
                                if (newColor != null) {
                                  var result = floodFill(Racing.canvas, x, y, newColor, trans);
                                  if (result) {
                                    newCanvas = document.createElement('canvas');
                                    newCanvas.width = result.width + 20;
                                    newCanvas.height = result.height + 20;
                                    document.body.appendChild(newCanvas);
                                    newContext = newCanvas.getContext('2d');
                                    newContext.putImageData(result.image, 10 - result.x, 10 - result.y);
                                    var border = MarchingSquares.getBlobOutlinePoints(newCanvas);
                                    var polyLine = [];
                                    for (var k = 0; k < border.length; k += 2) {
                                      polyLine.push({
                                        x: border[k],
                                        y: border[k + 1]
                                      });
                                    }
                                    var corners = simplify(polyLine, 2, true);
                                    //alert((border.length / 2) + ' Points --> ' + corners.length + ' Corners');
                                    if (corners.length != 0) {
                                      for (var k = 0; k < corners.length; k++) {
                                        var corner = corners[k];
                                        var minDist = null;
                                        var x = corner.x;
                                        var y = corner.y;
                                        var bestPointIndex = null;
                                        var bestX = null;
                                        var bestY = null;
                                        for (var b = 0; b < border.length; b += 2) {
                                          var xDist = Math.abs(border[b] - x);
                                          var yDist = Math.abs(border[b + 1] - y);
                                          var dist = xDist + yDist
                                          if (minDist == null || dist < minDist) {
                                            minDist = dist;
                                            bestPointIndex = b / 2;
                                            bestX = border[b];
                                            bestY = border[b + 1];
                                          }
                                        }
                                        corners[k].x = bestX + result.x - 10;
                                        corners[k].y = bestY + result.y - 10;
                                        corners[k].index = bestPointIndex;
                                      }
                                      corners.sort(function(a, b) {
                                        return a.index < b.index ? -1 : 1;
                                      });
                                      var polygon = [];
                                      var corner = corners[0];
                                      polygon.push(Tiles.lambert(corner.x, corner.y));
                                      for (var k = 0; k < corners.length; k++) {
                                        corner = corners[k];
                                        polygon.push(Tiles.lambert(corner.x, corner.y));
                                      }
                                      polygons.push((Racing.layer == 'GRB_WGO' ? 'addComplexBaan([' : 'addComplexVoetpad([') + polygon.join(',') + ']);');
                                    }
                                  }
                                }
                              }
                              var layer = Racing.layer;
                              alert(layer);
                              if (RoadPieces.layers[layer] == null) {
                                RoadPieces.layers[layer] = [];
                              }
                              RoadPieces.layers[layer][i] = {
                                points: roadPiece,
                                border: border,
                                corners: corners,
                                color: newC
                              };
                              roadPieces[i] = {
                                points: roadPiece,
                                border: border,
                                corners: corners,
                                color: newC,
                                layer: layer
                              };
                              //RoadPieces.drawBorder(ctx, [roadPieces[i]]);
                              //alert(roadPieces[i]);
                            }
                            //alert('Tiles.lineIdsIndex: ' + Tiles.lineIdsIndex);
                            alert(polygons.join('\n'));
                            clearCanvas();
                            var ctx = Racing.context;
                            for (var l in RoadPieces.layers) {
                             // alert(l);
                              for (var i in RoadPieces.layers[l]) {
                                //alert(i);
                                ctx.globalCompositeOperation = l == 'GRB_WGO' ? 'source-atop' : 'source-over';
                                RoadPieces.drawBorder(ctx, RoadPieces.layers[l][parseInt(i)]);
                              }
                            }
                            if (Tiles.lineIdsIndex < Tiles.lineIds.length - 1) {
                              Tiles.lineIdsIndex++;
                              Tiles.load(Tiles.lineIds[Tiles.lineIdsIndex].ids, Tiles.lineIds[Tiles.lineIdsIndex].line);
                            } else {
                              alert('Done');
                            }
                          }
                          //Tiles.tilesToLoad--;
                          //alert(Tiles.tilesToLoad);
                        };
                        img.src = url;
                      });
                    }
                  });
                  /*var cols = [];
                  var rows = [];
                  for (var uniqueCol in Tiles.uniqueCols) {
                    cols.push(uniqueCol);
                  }
                  for (var uniqueRow in Tiles.uniqueRows) {
                    rows.push(uniqueRow);
                  }
                  cols.sort(Sort.float);
                  rows.sort(Sort.float);
                  Tiles.cols = cols;
                  Tiles.rows = rows;*/
                  Tiles.getGrid();
                  createCanvas(Tiles.cols, Tiles.rows);
                }
              }
            };
          });
        }
      }
    }
  },
  getGrid: function() {
    var cols = [];
    var rows = [];
    for (var uniqueCol in Tiles.uniqueCols) {
      cols.push(uniqueCol);
    }
    for (var uniqueRow in Tiles.uniqueRows) {
      rows.push(uniqueRow);
    }
    cols.sort(Sort.float);
    rows.sort(Sort.float);
    Tiles.cols = cols;
    Tiles.rows = rows;
    return {
      cols: cols,
      rows: rows
    };
  },
  lambert: function(x, y) {
    var cols = Tiles.cols;
    var rows = Tiles.rows;
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
  parseFileName: function(image) {
    //alert(image)
    var components = image.name.split('-');
    //alert(components);
    return {
      gemeente: components[0],
      straat: components[1],
      layer: components[2],
      bbox: components[3].replace('.png', '').split(','),
      saveName: components[3]
    };
  },
  getGridPos: function(image, grid) {
    var components = Tiles.parseFileName(image);
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
  check: function(img, layerName) {
    var fileName = img.gemeente + '-' + img.straat + '-' + layerName + '-' + img.saveName;
    for (var i = 0; i < Racing.entries.length; i++) {
      var entry = Racing.entries[i];
      var path = entry.fullPath;
      if (path.indexOf(fileName) != -1) {
        return true;
      }
    }
    return false;
  },
  saveFile: function(fileName, canvas) {
    chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
      entry.getFile(fileName, { create: true }, function(writableEntry) {
        var blob = new Blob([convertDataURIToBinary(canvas.toDataURL('image/png'))], { type: 'image/png' });
        writableEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            alert('Saved ' + fileName);
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          fileWriter.write(blob);
        });
      });
    });
  },
  save: function() {
    if (Tiles.toSave == null) {
      Tiles.toSave = [];
      for (var name in Racing.tileFiles) {
        Tiles.toSave.push(name);
      }
    }
    var fileName = Tiles.toSave[0].split('-').join('_').split(':').join('-');
    chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
      entry.getFile(fileName, { create: true }, function(writableEntry) {
        var s = Racing.tileFiles[Tiles.toSave[0]];
        var blob = new Blob([s], { type: 'text/plain' });
        writableEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + fileName);
            Tiles.toSave = Tiles.toSave.splice(1);
            if (Tiles.toSave.length > 0) {
              setTimeout(Tiles.save, 0);
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
}