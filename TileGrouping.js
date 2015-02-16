$G = window.TileGrouping = {
	tileSize: 512,
	groupTiles: function() {
		$G.start = new Date().getTime();
		$G.layerName = 'GRB_WBN,Baan';
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
					$G.loadTile();
				});
			});
		});
	},
	tileFound: function(coords) {
		var x = coords[0];
		var y = coords[1];
		var result = floodFill($G.canvas, x, y, 0xff0000ff, 0xff);
		var expands = $G.expands[$G.fileIndex];
		expands.left = expands.left || result.x == 0;
		expands.right = expands.right || result.x + result.width == 512;
		expands.top = expands.top || result.y == 0;
		expands.bottom = expands.bottom || result.y + result.height == 512;
		if (result.width != 1 && result.height != 1) {
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
			alert('Done');
			$G.canvas.style.display = 'none';
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.top = '0px';
			document.body.appendChild(div);
			$G.div = div;
			$G.groupIndex = 0;
			File.folder($G.layerName + '/Grouped').then(function() {
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
			colMax = Math.max(colMax, parseInt(file[2]));
			rowMin = Math.min(rowMin, parseInt(file[1]));
			rowMax = Math.max(rowMax, parseInt(file[3]));
		}
		var canvas = document.createElement('canvas');
		canvas.width = size * (colMax - colMin);
		canvas.height = size * (rowMax - rowMin);
		var context = canvas.getContext('2d');
		$G.groupTiles = 0;
		$G.groupTilesLoaded = 0;
		for (var fileIndex in tiles) {
			var file = $G.files[fileIndex];
			$G.groupTiles++;
			File.loadImage($G.layerName + '/' + file.join(',') + '.png').then(function(img) {
				var name = img.name.split('/')[1].replace('.png', '').split(',');
				var h = rowMax - rowMin;
				var x = (parseInt(name[0]) - colMin);
				var y = (h - 1) - (parseInt(name[1]) - rowMin);
				x *= size;
				y *= size;
				context.drawImage(img, x, y, size, size);
				$G.groupTilesLoaded++;
				if ($G.groupTiles == $G.groupTilesLoaded) {
					var image = $P.png(canvas);
					File.saveImage($G.layerName + '/Grouped/' + files.join(' ') + '.png', image, function() {
						if ($G.groupIndex < $G.groups.length - 1) {
							$G.groupIndex++;
							$G.showGroup();
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
		var x = parseInt(expands.file[0]);
		var y = parseInt(expands.file[1]);
		if (expands.right) {
			var tileIndex = $G.tileExists(x + 1, y);
			if (tileIndex != null) {
				expands.tiles.push(tileIndex);
			}
		}
		if (expands.top) {
			var tileIndex = $G.tileExists(x, y + 1);
			if (tileIndex != null) {
				expands.tiles.push(tileIndex);
			}
		}
		if (expands.left) {
			var tileIndex = $G.tileExists(x - 1, y);
			if (tileIndex != null) {
				expands.tiles.push(tileIndex);
			}
		}
		if (expands.bottom) {
			var tileIndex = $G.tileExists(x, y - 1);
			if (tileIndex != null) {
				expands.tiles.push(tileIndex);
			}
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