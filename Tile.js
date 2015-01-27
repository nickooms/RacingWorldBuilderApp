window.Tile = {
	loaded: function(evt) {
    var size = Racing.tileSize;
    var grid = Racing.grid;
    var cols = grid.cols;
    var rows = grid.rows;
    var img = evt.target;
    var pos = img.pos;
    var col = pos.col;
    var row = pos.row;
    Racing.imagesToLoad--;
    Racing.context.drawImage(img, col * size, row * size, size, size);
    if (Racing.imagesToLoad == 0) {
      Racing.imageData = Racing.context.getImageData(0, 0, Racing.canvas.width, Racing.canvas.height);
      /*if (Racing.layer != 'GRB_WBN') {
	      var data = Racing.imageData.data;
	      var cs = {};
	      for (var i = 0; i < data.length; i += 4) {
	      	var r = data[i];
	      	var g = data[i + 1];
	      	var b = data[i + 2];
	      	var a = data[i + 3];*/
	      	//if (a == 0xFF)
	      	/*switch (g) {
	      		case 0xFF:
	      		case 0x00:
	      		case 0x77:
	      			break;
	      		default:*/
	      			
		      			/*var c = r * 0x10000 + g * 0x100 + b;
		      			if (cs[c] == null) {
		      				cs[c] = 0;
		      			}
		      			cs[c]++;*/
		      		/*if (Math.abs(r - b) > 10) {
		      			data[i + 0] = 0xFF;
		      			data[i + 1] = 0;
		      			data[i + 2] = 0;
		      			data[i + 3] = 0xFF;
		      		}*/
		      		//}
	      	//}
	      /*}
	      //alert(cs);
	      //return;
	      Racing.context.putImageData(Racing.imageData, 0, 0);
	    }*/
      Points.load(function(points) {
        var minX = cols[0];
        var maxX = cols[cols.length - 1];
        var minY = rows[0];
        var maxY = rows[rows.length - 1];
        var canvas = Racing.canvas;
        var w = canvas.width;
        var h = canvas.height;
        Racing.uniquePoints = Points.unique(points);
        Lines.load(function(lines) {
          var minX = cols[0];
          var maxX = cols[cols.length - 1];
          var minY = rows[0];
          var maxY = rows[rows.length - 1];
          Racing.cols = cols;
          Racing.rows = rows;
          var canvas = Racing.canvas;
          var w = canvas.width;
          var h = canvas.height;
          var points = Racing.points;
          var uniquePoints = Racing.uniquePoints;
          var ctx = Racing.context;
          //alert('===========================================================================');
          //if (Racing.roadPieces == null) {
          Racing.roadPieces = RoadPieces.get(lines, points, cols, rows);
          //}
        	//var roadPieces = Racing.roadPieces.map(function(roadPiece) {
        	//	return roadPiece.points;
        	//});
          //alert('===========================================================================');
          var imageData = Racing.imageData;
          var newCanvas, newContext;
          var polygons = [];
     return
          for (var i = 0; i < roadPieces.length; i++) {
            var roadPiece = roadPieces[i].points;
            //alert('RoadPiece ' + i + ' = ' + JSON.stringify(roadPiece));
            for (var j = 0; j < roadPiece.length; j++) {
              var point = points[roadPiece[j]];
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
                  alert(color);
                  newColor = 0x000000;//Color.inverse(color);//parseInt(color.replace('#', ''), 16);
                  newC = '#000000'
              }
              //newColor = parseInt((r + g + b) / 3).toString(16)
              if (newColor != null) {
                var result = floodFill(Racing.canvas, x, y, newColor, trans);
                if (result) {
                  newCanvas = document.createElement('canvas');
                  newCanvas.width = result.width + 20;
                  newCanvas.height = result.height + 20;
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
                    polygon.push(Racing.lambert(corner.x, corner.y));
                    for (var k = 0; k < corners.length; k++) {
                      corner = corners[k];
                      polygon.push(Racing.lambert(corner.x, corner.y));
                    }
                    polygons.push((Racing.layer == 'GRB_WGO' ? 'addComplexBaan([' : 'addComplexVoetpad([') + polygon.join(',') + ']);');
                  }
                }
              }
            }
            var layer = Racing.layer;
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
          //if (Racing.layer != 'GRB_WGO') clearCanvas();
          clearCanvas();
          for (var l in RoadPieces.layers) {
          	for (var i in RoadPieces.layers[l]) {
          		ctx.globalCompositeOperation = l == 'GRB_WGO' ? 'source-atop' : 'source-over';
          		RoadPieces.drawBorder(ctx, RoadPieces.layers[l][parseInt(i)]);
          	}
          }
          //RoadPieces.drawBorder(ctx, roadPieces);
          alert('===========================================================================');
          alert(polygons.join('\n'));
          Racing.points = null;
          Racing.lines = null;
          if (Racing.layer != 'GRB_WGO') {

          	Images.drawLayer(Images.images, 'GRB_WGO');
          } else {

          }
          //Racing.tileSize = parseInt(document.body.clientWidth / (Racing.cols.length - 1));
          //Racing.canvas.style.width = ((cols.length - 1) * Racing.tileSize) + 'px';
          //Racing.canvas.style.height = ((rows.length - 1) * Racing.tileSize) + 'px';
        });
      });
    }
  }
};