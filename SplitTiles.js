$S = window.SplitTiles = {
	removeLayerSinglePixels: function(layerName) {
		$S.start = new Date().getTime();
		$S.layerName = layerName.replace(':', ',');
		Grid.load(function() {
			File.loadJSON($S.layerName + '/files.json').then(function(files) {
				$S.files = files;
				$S.fileIndex = 0;
				File.folder($S.layerName + '/Cleaned').then($S.removeSinglePixels);
			});
		});
	},
	split: function(layerName) {
		$S.start = new Date().getTime();
		$S.layerName = layerName.replace(':', ',');
		$S.fileIndex = 0;
		Grid.load(function() {
			File.loadJSON($S.layerName + '/files.json').then(function(files) {
				$S.files = files;
				$S.output = [];
				$S.canvas = $C.create($C.LEFT);
				$S.context = $S.canvas.getContext('2d');
				$S.saveCanvas = $C.create($C.RIGHT);
				$S.saveContext = $S.saveCanvas.getContext('2d');
				File.folder($S.layerName + '/Split').then($S.loadTile);
			});
		});
	},
	join: function(layerName) {
		$S.start = new Date().getTime();
		$S.layerName = layerName.replace(':', ',');
		Grid.load(function() {
			File.loadJSON($S.layerName + '/Split/files.json').then(function(files) {
				$S.files = files;
				$S.canvas = $C.create({
					position: 'absolute',
					left: '0px',
					top: '0px',
					width: 2 * 512,
					height: 2 * 512
				});
				$S.context = $S.canvas.getContext('2d');
				$S.toTest = [];
				$S.testIndex = 0;
				for (var i = 0; i < files.length; i++) {
					var file = $S.files[i];
					file.tiles = [];
					if (file.touches.right) {
						for (var j = 0; j < files.length; j++) {
							var touchFile = $S.files[j];
							if (touchFile.touches.left && touchFile.col == file.col + 1 && touchFile.row == file.row) {
								$S.toTest.push([i, j, 'right']);
							}
						}
					}
					if (file.touches.bottom) {
						for (var j = 0; j < files.length; j++) {
							var touchFile = $S.files[j];
							if (touchFile.touches.top && touchFile.col == file.col && touchFile.row == file.row - 1) {
								$S.toTest.push([i, j, 'bottom']);
							}
						}
					}
				}
				$S.testJoin();
			});
		});
	},
	joinObjects: function(layerName) {
		$S.start = new Date().getTime();
		$S.layerName = layerName.replace(':', ',');
		Grid.load(function() {
			File.loadJSON($S.layerName + '/Split/joined.json').then(function(objects) {
				$S.objects = objects;
				$S.objectIndex = 0;
				File.folder($S.layerName + '/Joined').then($S.joinObject);
			});
		});
	},
	removeSinglePixels: function() {
		var file = $S.files[$S.fileIndex];
		var fileName = $S.layerName + '/' + file.join(',') + '.png';
		File.loadImage(fileName).then(function(img) {
			function p(x, y) {
				var offset = (y * w + x) * 4;
				var r = data[offset];
				var g = data[offset + 1];
				var b = data[offset + 2];
				var a = data[offset + 3];
				return (r << 24) | (g << 16) | (b << 8) | a;
			}
			var w = img.width;
			var h = img.height;
			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			canvas.style.position = 'absolute';
			canvas.style.left = '0px';
			canvas.style.top = '0px';
			document.body.appendChild(canvas);
			var context = canvas.getContext('2d');
			context.drawImage(img, 0, 0, w, h);
			var imageData = context.getImageData(0, 0, w, h);
			var data = imageData.data;
			for (var y = 1; y < h - 1; y++) {
				var yT = y - 1;
				var yB = y + 1;
				for (var x = 1; x < w - 1; x++) {
					var xL = x - 1;
					var xR = x + 1;
					var c = p(x, y);
					if (c != p(xL, yT) && c != p(x, yT) && c != p(xR, yT) && c != p(xL, y) && c != p(xR, y) && c != p(xL, yB) && c != p(x, yB) && c != p(xR, yB)) {
						var offset = (y * w + x) * 4;
						data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
					}
				}
			}
			context.putImageData(imageData, 0, 0);
			var image = $P.png(canvas);
			var file = $S.files[$S.fileIndex];
			var fileName = $S.layerName + '/Cleaned/' + file.join(',') + '.png';
			File.saveImage(fileName, image, function() {
				alert('Saved ' + fileName + ' ' + ($S.fileIndex + 1) + '/' + $S.files.length);
				if ($S.fileIndex < $S.files.length - 1) {
					document.body.removeChild(document.querySelector('canvas'));
					$S.fileIndex++;
					$S.removeSinglePixels();
				} else {
					alert('Done [' + (new Date().getTime() - $S.start) + ' ms]');
				}
			});
		});
	},
	joinObject: function() {
		var object = $S.objects[$S.objectIndex];
		$S.colMin = Infinity;
		$S.rowMin = Infinity;
		$S.colMax = -Infinity;
		$S.rowMax = -Infinity;
		for (var i = 0; i < object.length; i++) {
			var file = object[i].split(',');
			var col = parseInt(file[0]);
			var row = parseInt(file[1]);
			$S.colMin = Math.min($S.colMin, col);
			$S.rowMin = Math.min($S.rowMin, row);
			$S.colMax = Math.max($S.colMax, col);
			$S.rowMax = Math.max($S.rowMax, row);
		}
		$S.xMin = Grid.cols[$S.colMin];
		$S.yMin = Grid.rows[$S.rowMin];
		$S.xMax = Grid.cols[$S.colMax];
		$S.yMax = Grid.rows[$S.rowMax];
		alert([$S.xMin, $S.yMin, $S.xMax, $S.yMax]);
		$S.cols = 1 + $S.colMax - $S.colMin;
		$S.rows = 1 + $S.rowMax - $S.rowMin;
		var canvas = document.createElement('canvas');
		canvas.width = $S.cols * 512;
		canvas.height = $S.rows * 512;
		canvas.style.position = 'absolute';
		canvas.style.left = '0px';
		canvas.style.top = '0px';
		document.body.appendChild(canvas);
		$S.canvas = canvas;
		$S.context = $S.canvas.getContext('2d');
		$S.tiles = object;
		$S.tileIndex = 0;
		$S.joinTile();
	},
	joinTile: function() {
		var file = $S.tiles[$S.tileIndex].split(',');
		var col = parseInt(file[0]);
		var row = parseInt(file[1]);
		File.loadImage($S.layerName + '/Split/' + file.join(',') + '.png').then(function(img) {
			$S.context.drawImage(img, (col - $S.colMin) * 512, ($S.rows - 1 - (row - $S.rowMin)) * 512);
			if ($S.tileIndex < $S.tiles.length - 1) {
				$S.tileIndex++;
				$S.joinTile();
			} else {
				var image = $P.png($S.canvas);
				var name = $S.layerName + '/Joined/' + $S.objectIndex + '.png';
				File.saveImage(name, image, function() {
					alert('Saved ' + name);
					if ($S.objectIndex < $S.objects.length - 1) {
						document.body.removeChild(document.querySelector('canvas'));
						$S.objectIndex++;
						$S.joinObject();
					} else {
						alert('Done [' + (new Date().getTime() - $S.start) + ' ms]');
					}
				});
			}
		});
	},
	testJoin: function() {
		$S.test = $S.toTest[$S.testIndex];
		alert('Test ' + ($S.testIndex + 1) + '/' + $S.toTest.length);
		$S.file = $S.files[$S.test[0]];
		$S.touchFile = $S.files[$S.test[1]];
		$S.direction = $S.test[2];
		$S.context.clearRect(0, 0, 2 * 512, 2 * 512);
		File.loadImage($S.layerName + '/Split/' + $S.file.name + '.png').then(function(img) {
			$S.context.drawImage(img, 0, 0);
			File.loadImage($S.layerName + '/Split/' + $S.touchFile.name + '.png').then(function(img) {
				switch ($S.direction) {
					case 'right':
						$S.context.drawImage(img, 512, 0);
						break;
					case 'bottom':
						$S.context.drawImage(img, 0, 512);
						break;
				}
				floodFill($S.canvas, $S.file.center.x, $S.file.center.y, 0x00000000, 0x00);
				var isEmpty = $C.isEmpty($S.canvas);
				if (isEmpty) {
					$S.file.tiles.push($S.test[1]);
					$S.touchFile.tiles.push($S.test[0]);
				}
				if ($S.testIndex < $S.toTest.length - 1) {
					$S.testIndex++;
					$S.testJoin();
				} else {
					var objects = {};
					for (var i = 0; i < $S.files.length; i++) {
						var file = $S.files[i];
						var tiles = file.tiles;
						var object = {};
						object[i] = true;
						$S.addTiles(object, tiles);
						tiles = [];
						for (var tile in object) {
							tiles.push(parseInt(tile));
						}
						tiles.sort();
						objects[tiles] = true;
					}
					var tiles = [];
					for (var object in objects) {
						var tile = [];
						for (var i = 0; i < object.split(',').length; i++) {
							var file = $S.files[parseInt(object.split(',')[i])];
							tile.push(file.name);
						}
						tiles.push(tile);
					}
					File.save($S.layerName + '/Split/joined.json', JSON.stringify(tiles), function() {
						alert('Done [' + (new Date().getTime() - $S.start) + ' ms]');
					});
				}
			});
		});
	},
	addTiles: function(object, tiles) {
		for (var i = 0; i < tiles.length; i++) {
			var tile = tiles[i];
			if (object[tile] == null) {
				object[tile] = true;
				var file = $S.files[tile];
				$S.addTiles(object, file.tiles);
			}
		}
	},
	loadTile: function() {
		var file = $S.files[$S.fileIndex];
		var fileName = $S.layerName + '/Cleaned/' + file.join(',') + '.png';
		alert(fileName + ' ' + ($S.fileIndex + 1) + '/' + $S.files.length);
		File.loadImage(fileName).then(function(img) {
			$S.context.clearRect(0, 0, 512, 512);
			$S.context.drawImage(img, 0, 0);
			getTileObject($S.canvas).then($S.tilePieceFound, $S.tilePieceNotFound);
		});
	},
	tilePieceFound: function(coords) {
		var x = coords[0];
		var y = coords[1];
		var piece = floodFill($S.canvas, x, y, 0xff0000ff, 0xff);
		if (piece.width != 1 && piece.height != 1) {
			var touches = {
				left: piece.x == 0,
				right: piece.x + piece.width == 512,
				top: piece.y == 0,
				bottom: piece.y + piece.height == 512
			}
			$S.saveContext.clearRect(0, 0, 512, 512);
			$S.saveContext.putImageData(piece.image, 0, 0);
			var image = $P.png($S.saveCanvas);
			var file = $S.files[$S.fileIndex];
			var name = file[0] + ',' + file[1] + ',' + piece.x + ',' + piece.y;
			var fileName = $S.layerName + '/Split/' + name + '.png';
			File.saveImage(fileName, image, function() {
				$S.output.push({
					name: name,
					col: parseInt(file[0]),
					row: parseInt(file[1]),
					center: {
						x: x,
						y: y
					},
					location: {
						x: piece.x,
						y: piece.y,
						width: piece.width,
						height: piece.height
					},
					touches: touches
				});
				getTileObject($S.canvas).then($S.tilePieceFound, $S.tilePieceNotFound);
			});
		} else {
			$S.nextTile();
		}
	},
	tilePieceNotFound: function(error) {
		$S.nextTile();
	},
	nextTile: function() {
		if ($S.fileIndex < $S.files.length - 1) {
			$S.fileIndex++;
			$S.loadTile();
		} else {
			File.save($S.layerName + '/Split/files.json', JSON.stringify($S.output), function() {
				alert('Done [' + (new Date().getTime() - $S.start) + ' ms]');
			});
		}
	}
};