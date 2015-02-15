$G = window.TileGrouping = {
	tileFound: function(coords) {
		var x = coords[0];
		var y = coords[1];
		var result = floodFill($G.canvas, x, y, 0xff0000ff, 0xff);
		var expands = $G.expands[$G.fileIndex];
		expands.left = expands.left || result.x == 0;
		expands.right = expands.right || result.x + result.width == 512;
		expands.top = expands.top || result.y == 0;
		expands.bottom = expands.bottom || result.y + result.height == 512;
		if (result.width != 1) {
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
			processed: false,
			used: false,
			file: file,
			tiles: []
		};
		alert(fileName + ' ' + $G.fileIndex);
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
			alert('Done');
			for (var i = 0; i < $G.files.length; i++) {
				$G.expandTile($G.expands[i]);
			}
			var groups = [];
			for (var i = 0; i < $G.expands.length; i++) {
				var expands = $G.expands[i];
				if (!expands.used) {
					expands.used = true;
					var tiles = {};
					tiles[i] = true;
					tiles = $G.addTiles(tiles, expands.tiles);
					var files = [];
					var rowMin = Infinity;
					var rowMax = -Infinity;
					var colMin = Infinity;
					var colMax = -Infinity;
					for (var fileIndex in tiles) {
						var file = $G.files[fileIndex];
						files.push(file.join(','));
						rowMin = Math.min(rowMin, parseInt(file[0]));
						rowMax = Math.max(rowMax, parseInt(file[2]));
						colMin = Math.min(colMin, parseInt(file[1]));
						colMax = Math.max(colMax, parseInt(file[3]));
					}
					groups.push({
						files: files,
						tiles: tiles
					});
				}
			}
			alert(groups);
			$G.canvas.style.display = 'none';
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.top = '0px';
			document.body.appendChild(div);
			for (var i = 0; i < 1/*groups.length*/; i++) {
				var files = groups[i].files;
				var tiles = groups[i].tiles;
				var rowMin = Infinity;
				var rowMax = -Infinity;
				var colMin = Infinity;
				var colMax = -Infinity;
				for (var fileIndex in files) {
					var file = files[fileIndex].split(',');
					rowMin = Math.min(rowMin, parseInt(file[0]));
					rowMax = Math.max(rowMax, parseInt(file[2]));
					colMin = Math.min(colMin, parseInt(file[1]));
					colMax = Math.max(colMax, parseInt(file[3]));
				}
				var canvas = document.createElement('canvas');
				canvas.width = 128 * (colMax - colMin);
				canvas.height = 128 * (rowMax - rowMin);
				div.appendChild(canvas);
				var context = canvas.getContext('2d');
				context.strokeStyle = '#FF0000';
				alert(files);
				alert([rowMin, rowMax, colMin, colMax]);
				for (var fileIndex in tiles) {
					var file = $G.files[fileIndex];
					File.loadImage($G.layerName + '/' + file.join(',') + '.png').then(function(img) {
						var name = img.name.split('/')[1].replace('.png', '').split(',');
						var x = parseInt(name[0]) * 128;
						var y = parseInt(name[1]) * 128;
						context.strokeRect(x, -128 + canvas.height - y, 128, 128);
						context.drawImage(img, x, -128 + canvas.height - y, 128, 128);
					});
				}
			}
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
			if (parseInt(file[0]) == x && parseInt(file[1]) == y) {
				return i;
			}
		}
		return null;
	}
};