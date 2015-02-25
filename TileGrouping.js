$G = window.TileGrouping = {
	tileSize: 512,
	groupTiles: function(layerName) {
		$G.start = new Date().getTime();
		$G.layerName = layerName;
		$G.fileIndex = 0;
		Grid.load(function() {
			Racing.chosenEntry.getFile($G.layerName + '/files.json', {}, function(fileEntry) {
				getTextFile(fileEntry).then(JSON.parse).then(function(files) {
					$G.files = files;
					$G.expands = [];
					var canvas = document.createElement('canvas');
					canvas.width = 512;
					canvas.height = 512;
					canvas.style.position = 'absolute';
					canvas.style.left = '0px';
					canvas.style.top = '0px';
					document.body.appendChild(canvas);
					$G.canvas = canvas;
					$G.context = canvas.getContext('2d');
					/*var saveCanvas = document.createElement('canvas');
					saveCanvas.width = 512;
					saveCanvas.height = 512;
					saveCanvas.style.position = 'absolute';
					saveCanvas.style.left = '600px';
					saveCanvas.style.top = '0px';
					document.body.appendChild(saveCanvas);
					$G.saveCanvas = saveCanvas;
					$G.saveContext = saveCanvas.getContext('2d');*/
					//$G.objectIndex = 0;
					//File.folder($G.layerName + '/Objects').then($G.loadTile);
					$G.loadTile();
				});
			});
		});
	},
	removeLayerSinglePixels: function(layerName) {
		$G.start = new Date().getTime();
		$G.layerName = layerName;
		$G.fileIndex = 0;
		Grid.load(function() {
			Racing.chosenEntry.getFile($G.layerName + '/Grouped/files.json', {}, function(fileEntry) {
				getTextFile(fileEntry).then(JSON.parse).then(function(files) {
					$G.files = files;
					File.folder($G.layerName + '/GroupedNoSinglePixels').then($G.removeSinglePixels);
				});
			});
		});
	},
	splitGroups: function(layerName) {
		$G.start = new Date().getTime();
		$G.layerName = layerName;
		$G.fileIndex = 0;
		Grid.load(function() {
			Racing.chosenEntry.getFile($G.layerName + '/Grouped/files.json', {}, function(fileEntry) {
				getTextFile(fileEntry).then(JSON.parse).then(function(files) {
					$G.files = files;
					$G.splitGroup();
				});
			});
		});
	},
	removeSinglePixels: function() {
		var file = $G.files[$G.fileIndex];
		var fileName = $G.layerName + '/Grouped/' + $G.fileIndex + '.png';
		File.loadImage(fileName).then(function(img) {
			function px(x, y) {
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
				for (var x = 1; x < w - 1; x++) {
					var c = px(x, y);
					if (c != px(x - 1, y - 1) && c != px(x, y - 1) && c != px(x + 1, y) &&
							c != px(x - 1, y) && c != px(x + 1, y) &&
							c != px(x - 1, y + 1) && c != px(x, y + 1) && c != px(x + 1, y + 1)) {
						var offset = (y * w + x) * 4;
						data[offset] = data[offset + 1] = data[offset + 2] = data[offset + 3] = 0;
					}
				}
			}
			context.putImageData(imageData, 0, 0);
			var image = $P.png(canvas);
			var file = $G.files[$G.fileIndex];
			var fileName = $G.layerName + '/GroupedNoSinglePixels/' + $G.fileIndex + '.png';
			File.saveImage(fileName, image, function() {
				alert('Saved ' + fileName);
				if ($G.fileIndex < $G.files.length - 1) {
					document.body.removeChild(document.querySelector('canvas'));
					$G.fileIndex++;
					$G.removeSinglePixels();
				} else {
					alert('Done [' + (new Date().getTime() - $G.start) + ' ms]');
				}
			});
		});
	},
	splitGroup: function() {
		var file = $G.files[$G.fileIndex];
		var fileName = $G.layerName + '/GroupedNoSinglePixels/' + $G.fileIndex + '.png';
		alert(fileName + ' ' + ($G.fileIndex + 1) + '/' + $G.files.length);
		File.loadImage(fileName).then(function(img) {
			var w = img.width;
			var h = img.height;
			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			canvas.style.position = 'absolute';
			canvas.style.left = '0px';
			canvas.style.top = '0px';
			document.body.appendChild(canvas);
			$G.canvas = canvas;
			var context = canvas.getContext('2d');
			context.drawImage(img, 0, 0, w, h);
			getTileObject($G.canvas).then($G.splitGroupFound, $G.splitGroupNotFound);
		});
	},
	splitGroupFound: function(coords) {
		//alert(coords);
		var x = coords[0];
		var y = coords[1];
		//var w = $G.canvas.width;
		//var h = $G.canvas.height;
		//var imageData = $G.canvas.getContext('2d').getImageData(0, 0, w, h);
		//var data = imageData.data;
		//var color = Racing.pixel(data, w, x, y);
		//alert(color);
		//if (color.a != 0) {
			var result = floodFill($G.canvas, x, y, 0xff0000ff, 0xff);
			alert(result);
			if (result.width != 1 && result.height != 1) {
				getTileObject($G.canvas).then($G.splitGroupFound, $G.splitGroupNotFound);
			} else {
				$G.splitGroupNotFound();
			}
		//} else {
			//alert(color);
		//}
	},
	splitGroupNotFound: function(error) {
		if (error) {
			alert(error);
		}
		if ($G.fileIndex < $G.files.length - 1) {
			document.body.removeChild(document.querySelector('canvas'));
			$G.fileIndex++;
			$G.splitGroup();
		} else {
			alert('Done');
		}
	},
	tileFound: function(coords) {
		var x = coords[0];
		var y = coords[1];
		var result = floodFill($G.canvas, x, y, 0xff0000ff, 0xff);
		//alert(result);
		var tile = {
			left: result.x == 0,
			right: result.x + result.width == 512,
			top: result.y == 0,
			bottom: result.y + result.height == 512
		}
		//alert(tile);
		var expands = $G.expands[$G.fileIndex];
		expands.left = expands.left || tile.left;
		expands.right = expands.right || tile.right;
		expands.top = expands.top || tile.top;
		expands.bottom = expands.bottom || tile.bottom;
		if (result.width != 1 && result.height != 1) {
			//$G.saveContext.clearRect(0, 0, 512, 512);
			//$G.saveContext.putImageData(result.image, 0, 0);
			//File.saveImage($G.layerName + '/Objects/' + $G.objectIndex + '.png', $P.png($G.saveCanvas), function() {
				//expands.objectIndex = $G.objectIndex;
				//alert(expands);
				/*getTileObject($G.canvas).then(function(coords) {
					$G.objectIndex++;
					$G.tileFound(coords);
				}, $G.tileNotFound);*/
			//});
			getTileObject($G.canvas).then($G.tileFound, $G.tileNotFound);
		} else {
			$G.nextTile();
		}
	},
	tileNotFound: function(error) {
		$G.nextTile();
	},
	loadTile: function() {
		var file = $G.files[$G.fileIndex];
		var fileName = $G.layerName + '/' + file.join(',') + '.png';
		$G.expands[$G.fileIndex] = {
			left: false,
			right: false,
			top: false,
			bottom: false,
			index: $G.fileIndex,
			name: fileName,
			used: false,
			file: file,
			tiles: []
		};
		alert(fileName + ' ' + ($G.fileIndex + 1) + '/' + $G.files.length);
		File.loadImage(fileName).then(function(img) {
			$G.context.clearRect(0, 0, 512, 512);
			$G.context.drawImage(img, 0, 0);
			getTileObject($G.canvas).then($G.tileFound, $G.tileNotFound);
		});
	},
	nextTile: function() {
		if ($G.fileIndex < $G.files.length - 1) {
			$G.fileIndex++;
			$G.loadTile();
		} else {
			for (var i = 0; i < $G.expands.length; i++) {
				$G.expandTile($G.expands[i]);
			}
			$G.groups = [];
			for (var i = 0; i < $G.expands.length; i++) {
				var expands = $G.expands[i];
				if (!expands.used) {
					expands.used = true;
					var tiles = {};
					tiles[i] = true;
					tiles = $G.addTiles(tiles, expands.tiles);
					var files = [];
					for (var fileIndex in tiles) {
						files.push($G.files[fileIndex].join(','));
					}
					$G.groups.push({
						files: files,
						tiles: tiles
					});
				}
			}
			$G.canvas.style.display = 'none';
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = '0px';
			div.style.top = '0px';
			document.body.appendChild(div);
			$G.div = div;
			$G.groupIndex = 0;
			File.folder($G.layerName + '/Grouped').then(function() {
				$G.groupFiles = {};
				$G.showGroup();
			});
		}
	},
	showGroup: function() {
		var group = $G.groups[$G.groupIndex];
		var files = group.files;
		var tiles = group.tiles;
		var size = $G.tileSize;
		var rowMin = Infinity;
		var rowMax = -Infinity;
		var colMin = Infinity;
		var colMax = -Infinity;
		for (var fileIndex in files) {
			var file = files[fileIndex].split(',');
			colMin = Math.min(colMin, parseInt(file[0]));
			rowMin = Math.min(rowMin, parseInt(file[1]));
			colMax = Math.max(colMax, parseInt(file[2]));
			rowMax = Math.max(rowMax, parseInt(file[3]));
		}
		var cols = colMax - colMin;
		var rows = rowMax - rowMin;
		//alert([size * cols, size * rows]);
		var canvas = document.createElement('canvas');
		canvas.width = size * cols;
		canvas.height = size * rows;
		var context = canvas.getContext('2d');
		$G.groupTiles = 0;
		$G.groupTilesLoaded = 0;
		for (var fileIndex in tiles) {
			var file = $G.files[fileIndex];
			$G.groupTiles++;
			File.loadImage($G.layerName + '/' + file.join(',') + '.png').then(function(img) {
				var name = img.name.split('/')[1].replace('.png', '').split(',');
				var x = parseInt(name[0]) - colMin;
				var y = (rows - 1) - (parseInt(name[1]) - rowMin);
				x *= size;
				y *= size;
				//alert([x, y]);
				context.strokeStyle = '#FF0000';
				//context.strokeRect(x, y, size, size);
				context.drawImage(img, x, y, size, size);
				$G.groupTilesLoaded++;
				if ($G.groupTiles == $G.groupTilesLoaded) {
					var image = $P.png(canvas);
					File.saveImage($G.layerName + '/Grouped/' + $G.groupIndex + '.png', image, function() {
						$G.groupFiles[files] = true;
						if ($G.groupIndex < $G.groups.length - 1) {
							$G.groupIndex++;
							$G.showGroup();
						} else {
							var groupFiles = [];
							for (var groupFile in $G.groupFiles) {
								groupFiles.push(groupFile.split(','));
							}
							File.save($G.layerName + '/Grouped/files.json', JSON.stringify(groupFiles), function() {
								alert('Done [' + (new Date().getTime() - $G.start) + ' ms]');
							});
						}
					});
				}
			});
		}
	},
	addTiles: function(tiles, tilesToAdd) {
		for (var i = 0; i < tilesToAdd.length; i++) {
			var tile2Add = tilesToAdd[i];
			var tile = $G.expands[tile2Add];
			if (tiles[tile2Add] == null && !tile.used) {
				tiles[tile2Add] = true;
				tile.used = true;
				tiles = $G.addTiles(tiles, tile.tiles);
			}
		}
		return tiles;
	},
	expandTile: function(expands) {
		function addTileIfFound(tileIndex) {
			if (tileIndex != null) {
				tiles.push(tileIndex);
			}
		}
		var file = expands.file;
		var tiles = expands.tiles;
		var x = parseInt(file[0]);
		var y = parseInt(file[1]);
		if (expands.right) {
			addTileIfFound($G.tileExists(x + 1, y));
		}
		if (expands.top) {
			addTileIfFound($G.tileExists(x, y + 1));
		}
		if (expands.left) {
			addTileIfFound($G.tileExists(x - 1, y));
		}
		if (expands.bottom) {
			addTileIfFound($G.tileExists(x, y - 1));
		}
	},
	tileExists: function(x, y) {
		for (var i = 0; i < $G.files.length; i++) {
			var file = $G.files[i];
			if (x == parseInt(file[0]) && y == parseInt(file[1])) {
				return i;
			}
		}
		return null;
	}
};