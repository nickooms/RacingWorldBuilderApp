window.RoadPieces = {
	items: null,
	layers: {},
	drawBorder: function(context, roadPiece) {
		var corners = roadPiece.corners;
		if (corners != null && corners.length > 0) {
			context.fillStyle = roadPiece.color;
			context.beginPath();
	    var corner = corners[0];
	    context.moveTo(corner.x, corner.y);
	    for (var k = 0; k < corners.length; k++) {
	      corner = corners[k];
	      context.lineTo(corner.x, corner.y);
	    }
	    corner = corners[0]
	    context.moveTo(corner.x, corner.y);
	    context.fill();
	  }
  },
	get: function(lines, points, cols, rows) {
		if (RoadPieces.items != null) {
			return RoadPieces.items;
		}
		/*var canvas = Racing.canvas;
		var w = canvas.width;
    var h = canvas.height;
    var minX = cols[0];
    var maxX = cols[cols.length - 1];
    var minY = rows[0];
    var maxY = rows[rows.length - 1];*/
    var uniquePoints = Racing.uniquePoints;
    alert(uniquePoints);
		roadPieces = [];
		var lineIds = [];
	  for (var i = 0; i < lines.length; i++) {
	    var roadPiece = {};
	    roadPieces.push(roadPiece);
	    var line = lines[i];
	    console.log('Line ' + (i + 1) + '/' + lines.length + ' = ' + JSON.stringify(line));
	    var ids = [];
	    for (var j = 0; j < line.length; j++) {
	    	ids.push(line[j]);
	      line[j] = points[line[j]];
	    }
	    lineIds.push({
	    	lineId: i,
	    	line: line,
	    	ids: ids
	    });
	    /*for (var j = 0; j < line.length - 1; j++) {
	      var point1 = line[j];
	      var x1 = parseInt(w / (maxX - minX) * (point1.x - minX));
	      var y1 = parseInt(h / (maxY - minY) * (maxY - point1.y));
	      var color1 = Racing.pixel(Racing.imageData.data, w, x1, y1);
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
	      var color2 = Racing.pixel(Racing.imageData.data, w, x2, y2);
	      if (color1.equals(color2)) {
	        roadPiece[point1.Point] = true;
	        roadPiece[point2.Point] = true;
	      } else {
	        roadPiece = {};
	        roadPieces.push(roadPiece);
	        roadPiece[point2.Point] = true;
	      }
	    }*/
	  }
	  Tiles.lineIds = lineIds;
	  Tiles.lineIdsIndex = 0;
	  Tiles.load(Tiles.lineIds[Tiles.lineIdsIndex].ids, Tiles.lineIds[Tiles.lineIdsIndex].line);
	  //alert('===========================================================================');
	  /*for (var i = 0; i < roadPieces.length; i++) {
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
	        alert('RoadPiece ' + i + ' ' + JSON.stringify(roadPiece) + ' = RoadPiece ' + index + ' ' + JSON.stringify(roadPieces[index]));
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
	  RoadPieces.items = roadPieces;*/
	 }
};