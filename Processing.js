window.$P = window.Processing = {
	init: function() {
		var layerName = 'GRB_WBN:Kruispunt';
		//$P.makeLayerFolder(layerName);
		//$S.removeLayerSinglePixels(layerName);
		//$S.split(layerName);
		//$S.join(layerName);
		$S.joinObjects(layerName);


		//$G.groupTiles('GRB_WBN,Baan');
		//$G.removeLayerSinglePixels('GRB_WBN,Kruispunt');
		//$G.splitGroups('GRB_WBN,Baan');
		//Grid.load(Thumbnails.generate);
		/*Grid.save(function() {
			alert('Grid saved');
		});*/
		/*Grid.load(function() {
			$P.layerSet = LayerSets.item('Kruispunt');
			var canvas = document.createElement('canvas');
			canvas.width = 512;
			canvas.height = 512;
			canvas.style.position = 'absolute';
			canvas.style.left = '0px';
			canvas.style.top = '0px';
			document.body.appendChild(canvas);
			$P.canvas = canvas;
			var saveCanvas = document.createElement('canvas');
			saveCanvas.width = 512;
			saveCanvas.height = 512;
			saveCanvas.style.position = 'absolute';
			saveCanvas.style.left = '600px';
			saveCanvas.style.top = '0px';
			document.body.appendChild(saveCanvas);
			$P.saveCanvas = saveCanvas;
			chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
				$P.rootFolder = entry;
				entry.getFile($P.layerSet.name + '/files.json', {}, function(fileEntry) {
					getTextFile(fileEntry).then(JSON.parse).then(function(files) {
						$P.polygons = {};
						$P.files = files;
						$P.fileIndex = 0;
						$P.processFinishedTile();
					});
				});
			});
		});*/
		/*Grid.load(function() {
			$P.output = {};
			Promise.all([
				getFileEntry('lines.json').then(getTextFile).then(JSON.parse),
				getFileEntry('points.json').then(getTextFile).then(JSON.parse)
			]).then(function(files) {
				$P.lines = files[0];
				$P.points = files[1];
				var pointIndex = $P.lines[$P.lineIndex][$P.pointIndex];
				$P.point = $P.points[pointIndex];
				//alert($P.point);
				$P.loadLayer();
			}, function(error) {
				alert(error);
			});
			$P.layerSet = LayerSets.item('Kruispunt');
			$P.layers = $P.layerSet.layers;
			var canvas = document.createElement('canvas');
			canvas.width = 512;
			canvas.height = 512;
			canvas.style.position = 'absolute';
			canvas.style.left = '0px';
			canvas.style.top = '0px';
			document.body.appendChild(canvas);
			$P.canvas = canvas;
			var saveCanvas = document.createElement('canvas');
			saveCanvas.width = 512;
			saveCanvas.height = 512;
			saveCanvas.style.position = 'absolute';
			saveCanvas.style.left = '600px';
			saveCanvas.style.top = '0px';
			document.body.appendChild(saveCanvas);
			$P.saveCanvas = saveCanvas;
			$P.lineIndex = 0;
			$P.pointIndex = 0;
			$P.layerIndex = 0;
		});*/
	},
	makeLayerFolder: function(layerName, opacityThreshold, fileNameFilter) {
		if (opacityThreshold) {
			$P.opacityThreshold = opacityThreshold;
		}
		Grid.load(function() {
			$P.start = new Date().getTime();
			$P.layer = layerName;
			$P.output = [];
			$P.createView();
			if (fileNameFilter) {
				$P.files = $P.files.filter(function(file) {
					return file.name.indexOf(fileNameFilter) != -1 ? file : null;
				});
			}
			$P.analyze = true;
			$P.foundRed = false;
			$P.process($P.files[0].name);
		});
	},
	tileObjectFound: function(coords) {
		var x = coords[0];
		var y = coords[1];
		var tileObject = floodFill($P.canvas, x, y, 0xff0000ff, 0xff);
		if (tileObject.width == 0 || tileObject.height == 0) {
			$P.tileObjectNotFound();
			return;
		}
		$P.saveCanvas.getContext('2d').clearRect(0, 0, 512, 512);
		$P.saveCanvas.getContext('2d').putImageData(tileObject.image, 0, 0);
		var result = MarchingSquares.getBlobOutlinePoints($P.saveCanvas);
		var theBorder = [];
		for (var borderIndex = 0; borderIndex < result.length / 2; borderIndex++) {
			var borderPoint = {
				x: result[borderIndex * 2],
				y: result[borderIndex * 2 + 1]
			};
			theBorder.push(borderPoint);
		}
		var corners = simplify(theBorder, 2, true);
		var polygon = [];
    var corner = corners[0];
    for (var k = 0; k < corners.length; k++) {
      corner = corners[k];
      var xPos = ($P.minX + (corner.x / 512) * ($P.maxX - $P.minX)).toString().split('.');
	    var yPos = ($P.maxY - (corner.y / 512) * ($P.maxY - $P.minY)).toString().split('.');
	    if (xPos.length > 1) {
	      xPos[1] = xPos[1].substr(0, 2);
	    }
	    if (yPos.length > 1) {
	      yPos[1] = yPos[1].substr(0, 2);
	    }
	    polygon.push('[' + xPos.join('.') + ',' + yPos.join('.') + ']');
    }
    $P.polygons['add' + $P.layerSet.objectName + '([' + polygon.join(',') + ']);'] = true;
    setTimeout(function() {
    	getTileObject($P.canvas).then($P.tileObjectFound, $P.tileObjectNotFound);
    }, 0);
	},
	tileObjectNotFound: function(text) {
		getNextTile().then($P.processFinishedTile, function(text) {
			alert(text);
			var polygons = [];
    	for (var polygon in $P.polygons) {
    		polygons.push(polygon);
    	}
    	alert(polygons.join('\n'));
		});
	},
	processFinishedTile: function() {
		var theFile = $P.files[$P.fileIndex];
		var imageName = $P.layerSet.name + '/' + theFile.join(',') + '.png';
		alert($P.fileIndex + ' ' + imageName);
		$P.rootFolder.getFile(imageName, {}, function(imageFile) {
			imageFile.file(function(file) {
				var layerName = $P.layerSet.name;
				var url = URL.createObjectURL(file);
				var img = document.createElement('img');
				img.onload = function(evt) {
					$P.minX = parseFloat(Grid.cols[parseInt(theFile[0].split(',')[0])]);
					$P.maxX = parseFloat(Grid.cols[parseInt(theFile[0].split(',')[2])]);
					$P.minY = parseFloat(Grid.rows[parseInt(theFile[0].split(',')[1])]);
					$P.maxY = parseFloat(Grid.rows[parseInt(theFile[0].split(',')[3])]);
					$P.canvas.getContext('2d').clearRect(0, 0, 512, 512);
					$P.canvas.getContext('2d').drawImage(evt.target, 0, 0);
					getTileObject($P.canvas).then($P.tileObjectFound, $P.tileObjectNotFound);
				}
				img.src = url;
			});
		});
	},
	loadLayer: function() {
		chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
			$P.rootFolder = entry;
			var layerName = $P.layers[$P.layerIndex].id;
			entry.getFile(layerName.split(':').join(',') + '/files.json', {}, function(fileEntry) {
				loadFile(fileEntry, $P.layerFilesLoaded);
       });
	  });
	},
	layerFilesLoaded: function(fileName, data) {
		var layerName = $P.layers[$P.layerIndex].id;
		var point = $P.point;
		var pointFound = false;
    var layerFiles = JSON.parse(data);
    for (var i = 0; i < layerFiles.length; i++) {
    	var layerFile = layerFiles[i];
    	$P.layerFile = layerFile;
    	var minX = parseFloat(Grid.cols[layerFile[0]]);
    	var maxX = parseFloat(Grid.cols[layerFile[2]]);
    	var minY = parseFloat(Grid.rows[layerFile[1]]);
    	var maxY = parseFloat(Grid.rows[layerFile[3]]);
    	if (minX <= point.x && point.x <= maxX && minY <= point.y && point.y <= maxY) {
    		pointFound = true;
    		$P.pixel = {
    			x: Math.round((point.x - minX) * 512 / (maxX - minX)),
					y: Math.round((maxY - point.y) * 512 / (maxY - minY))
    		};
    		var imageName = layerName.split(':').join(',') + '/' + layerFile.join(',') + '.png';
    		$P.rootFolder.getFile(imageName, {}, function(imageFile) {
					imageFile.file($P.layerTileLoaded);
    		});
				break;
    	}
    }
    if (!pointFound) {
    	$P.layerTileImageLoaded();
    }
	},
	layerTileLoaded: function(file) {
		var layerName = $P.layers[$P.layerIndex].id;
		var url = URL.createObjectURL(file);
    var img = document.createElement('img');
    img.onload = $P.layerTileImageLoaded;
    img.src = url;
	},
	layerTileImageLoaded: function(evt) {
		if (evt) {
			$P.canvas.getContext('2d').drawImage(evt.target, 0, 0);
		}
		if ($P.layerIndex < $P.layers.length - 1) {
			$P.layerIndex++;
			$P.loadLayer();
		} else {
			var layer = $P.layers[$P.layerIndex];
			var layerName = layer.id;
			var color = layer.color;
			var alpha = layer.alpha;
			var copyFloodFill = layer.fill == false ? false : true;
			var imageName = layerName.split(':').join(',') + '/' + $P.layerFile.join(',') + '.png';
			var point = $P.point;
			$P.layerIndex = 0;
			var x = $P.pixel.x;
			var y = $P.pixel.y;
			var imageData = $P.canvas.getContext('2d').getImageData(0, 0, 512, 512);
			if (!Racing.pixel(imageData.data, 512, x, y).equals({ r: 0, g: 0, b: 0, a: 0 })) {
				var result = floodFill($P.canvas, x, y, color, alpha);
				$P.saveCanvas.getContext('2d').putImageData(copyFloodFill ? result.image : $P.canvas.getContext('2d').getImageData(0, 0, 512, 512), 0, 0);
				var image = $P.png($P.saveCanvas);
				var name = imageName.split('/')[1].replace('.png', '').split(',');
				name = name[0] + ',' + name[1] + ',' + name[2] + ',' + name[3] + ',' + result.x + ',' + result.y + ',' + result.width + ',' + result.height + '.png';
				$P.output[name.replace('.png', '').split(',')] = true;
				name = $P.layerSet.name + '/' + name;
				File.createFolder($P.layerSet.name, function() {
					File.saveImage(name, image, function() {
						alert('Saved ' + name);
					});
				});
			} else {
				//alert('Transparent point');
			}
			var line = $P.lines[$P.lineIndex];
			if ($P.pointIndex < line.length - 1) {
				$P.pointIndex++;
				var pointIndex = line[$P.pointIndex];
				$P.point = $P.points[pointIndex];
				$P.layerIndex = 0;
				$P.canvas.getContext('2d').clearRect(0, 0, 512, 512);
				$P.loadLayer();
			} else {
				if ($P.lineIndex < $P.lines.length - 1) {
					$P.lineIndex++;
					$P.pointIndex = 0;
					var pointIndex = $P.lines[$P.lineIndex][$P.pointIndex];
					$P.point = $P.points[pointIndex];
					$P.layerIndex = 0;
					$P.canvas.getContext('2d').clearRect(0, 0, 512, 512);
					$P.loadLayer();
				} else {
					var files = [];
					for (var file in $P.output) {
						files.push(file.split(','));
					}
					File.save($P.layerSet.name + '/files.json', JSON.stringify(files), function() {
						alert('Done [' + (new Date().getTime() - $P.start) + ' ms]');
					});
				}
			}
		}
	},
	createView: function() {
		var layerDropdown = Dropdown.fromArray(LAYERS.items);
		layerDropdown.value = $P.layer;
		$P.files = Images.fromLayer(layerDropdown.value.split(':')[0]);
		var imagesDropdown = Dropdown.fromArray($P.files, 'name', 'name');
		var btnNext = document.createElement('button');
		btnNext.innerText = 'Next';
		btnNext.onclick = function() {
			$P.foundRed = false;
		};
		var body = document.body;
		body.insertBefore(btnNext, body.childNodes[0]);
		body.insertBefore(imagesDropdown, body.childNodes[0]);
		body.insertBefore(layerDropdown, body.childNodes[0]);
		var table = document.createElement('table');
		table.className = 'image';
		body.appendChild(table);
		var tr = table.insertRow();
		var tdLeftCanvas = tr.insertCell();
		tdLeftCanvas.align = 'right';
		var div = document.createElement('div');
		div.className = 'Menu';
		$P.leftCanvas = $P.raster(10, 10, 'left');
		tdLeftCanvas.appendChild($P.leftCanvas);
		tdLeftCanvas.appendChild(div);
		var divLeft = document.createElement('div');
		divLeft.style.width = '100%';
		var tableColors = document.createElement('table');
		tableColors.style.color = '#ffffff';
		tableColors.cellPadding = 0;
		tableColors.cellSpacing = 0;
		tdLeftCanvas.appendChild(tableColors);
		$P.leftColors = tableColors;
		$P.leftMenu = div;
		var tdRightCanvas = tr.insertCell();
		tdRightCanvas.align = 'right';
		var div = document.createElement('div');
		div.className = 'Menu';
		$P.rightCanvas = $P.raster(550, 10, 'right');
		tdRightCanvas.appendChild($P.rightCanvas);
		tdRightCanvas.appendChild(div);
		var tableColors = document.createElement('table');
		tableColors.style.color = '#ffffff';
		tableColors.cellPadding = 0;
		tableColors.cellSpacing = 0;
		tdRightCanvas.appendChild(tableColors);
		$P.rightColors = tableColors;
		$P.rightMenu = div;
		$P.leftCanvas.onmouseup = $P.rightCanvas.onmouseup = $P.mouseup;
	},
	process: function(fileName, opacityThreshold) {
		File.load(fileName, function(img) {
			var size = 512;
			var leftContext = $P.leftCanvas.getContext('2d');
			leftContext.clearRect(0, 0, size, size);
			leftContext.drawImage(img, 0, 0);
			var imageData = leftContext.getImageData(0, 0, size, size);
			if ($P.analyze) {
				$P.leftBackupImage = leftContext.getImageData(0, 0, size, size);
				var colors = Color.analyze(imageData);
				$P.showColors($P.leftColors, colors);
				$P.leftMenu.innerText = colors.colors.length + ' Colors';
			}
			if ($P.filterColors(imageData.data)) {
				if ($P.analyze) {
					var colors = Color.analyze(imageData);
					$P.showColors($P.rightColors, colors);
					$P.rightMenu.innerText = colors.colors.length + ' Colors';
				}
				var rightContext = $P.rightCanvas.getContext('2d');
				rightContext.putImageData(imageData, 0, 0);
				if ($P.analyze) {
					$P.rightBackupImage = rightContext.getImageData(0, 0, size, size);
				}
				File.createFolder($P.layer.split(':').join(','), function() {
					var image = $P.png($P.rightCanvas);
					var name = fileName.split('-')[3];
					var bbox = name.replace('.png', '').split(',');
					bbox[0] = Grid.cols.indexOf(bbox[0]);
					bbox[1] = Grid.rows.indexOf(bbox[1]);
					bbox[2] = Grid.cols.indexOf(bbox[2]);
					bbox[3] = Grid.rows.indexOf(bbox[3]);
					$P.output.push(bbox);
					name = bbox.join(',') + '.png';
					name = $P.layer.split(':').join(',') + '/' + name;
					File.saveImage(name, image, function() {
						if ($P.foundRed != true) {
							$P.nextImage();
						}
					});
				});
			} else {
				if ($P.foundRed != true) {
					$P.nextImage();
				}
			}
		});
	},
	nextImage: function() {
		$P.files = $P.files.slice(1);
		if ($P.files.length > 0) {
			$P.process($P.files[0].name);
		} else {
			File.save($P.layer.split(':').join(',') + '/files.json', JSON.stringify($P.output), function() {
				alert('Done [' + (new Date().getTime() - $P.start) + ' ms]');
			});
		}
	},
	png: function(canvas, indexedColor) {
		if (indexedColor) {
			var encoder = new CanvasTool.PngEncoder(canvas, {
				//bitDepth: 1,
				colourType: CanvasTool.PngEncoder.ColourType.INDEXED_COLOR
			});
			var png = encoder.convert();
			var dataUrl = 'data:image/png;base64,' + window.btoa(png);
			return convertDataURIToBinary(dataUrl);
		} else {
			return convertDataURIToBinary(canvas.toDataURL('image/png'));
		}
	},
	showColors: function(table, colors) {
		var V = {};
		for (var i in colors.colors) {
			var color = colors.colors[i];
			var value = color.value.split(',');
			var r = parseInt(value[0]);
			var g = parseInt(value[1]);
			var b = parseInt(value[2]);
			var a = parseInt(value[3]);
			var v = (r + g + b) / 3;
			if (V[v] == null) {
				V[v] = [];
			}
			V[v].push([r, g, b, a]);
		}
		var Vs = [];
		for (var v in V) {
			Vs.push({
				v: parseFloat(v),
				value: V[v]
			});
		}
		Vs.sort(function(a, b) {
			return a.v < b.v ? -1 : 1;
		});
		while (table.rows.length > 0) {
			table.deleteRow(0);
		}
		var tr = table.insertRow();
		for (var i = 0; i < Vs.length; i++) {
			var td = tr.insertCell();
			td.style.width = '32px';
			td.style.height = '16px';
			td.innerText = Vs[i].v.toFixed(1);
			var v = Vs[i].value[0];
			var name = '#' + ((v[0] << 16) | (v[1] <<  8) |	v[2]).toString(16);
			td.title = Vs[i].v + '\n' + name + ', ' + parseInt(v[3] / 2.55) + '%';
			td.style.backgroundColor = 'rgba(' + v.join(',') + ')';
			td.onmousedown = function() {
				$P.highlightCanvas = $P.leftCanvas;
				$P.highlight(this.title.split('\n')[1], $P.leftCanvas);
			};
			td.onmouseup = function() {
				$P.highlight();
			};
			if (i % 16 == 15) {
				tr = table.insertRow();
			}
		}
	},
	filterColors: function(data) {
		opacityThreshold = $P.opacityThreshold || 63;
		var empty = true;
		var thresholdMin, thresholdMax;
		var thresholds = LAYERS.item($P.layer).thresholds;
		for (var i = 0; i < data.byteLength; i += 4) {
			var r = data[i];
			var g = data[i + 1];
			var b = data[i + 2];
			var a = data[i + 3];
			var avg = (r + g + b) / 3;
			if (a < opacityThreshold) {
				data[i] = data[i + 1] = data[i + 2] = 0x00;
				data[i + 3] = 0x00;
			} else {
				var threshold = null;
				for (var j = 0; j < thresholds.length; j++) {
					if (avg >= thresholds[j].min && avg <= thresholds[j].max) {
						threshold = thresholds[j];
						break;
					}
				}
				if (threshold != null) {
					var color = threshold.color;
					if (color[0] != 0x00 || color[1] != 0x00 || color[2] != 0x00 || color[3] != 0x00) {
						empty = false;
					}
					if (color[0] == 0xff && color[1] == 0x00 && color[2] == 0x00) {
						alert('#' + ((r << 16) | (g <<  8) |	b).toString(16));
						$P.foundRed = true;
					}
					data[i] = color[0];
					data[i + 1] = color[1];
					data[i + 2] = color[2];
					data[i + 3] = color.length == 4 ? color[3] : 0xff;
				} else {
					data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0x00;
				}
				if ($P.foundRed == true) {
					return !empty;
				}
			}
		}
		return !empty;
	},
	color: function(color) {
		switch (color) {
			case '#cccccc':
			case '#b7b7b7':
				return 0x99999900;
			default:
				return 0x99999900;
		}
	},
	newColor: function(color) {
		switch (color) {
			case '#fa9b87':
				return '#00ff00';
			default:
				return null;
		}
	},
	highlight: function(color, canvas) {
		var ctx = $P.highlightCanvas.getContext('2d');
		var backupImage = $P.highlightCanvas.id == 'left' ? $P.leftBackupImage : $P.rightBackupImage;
		if (color != null) {
			$P.highlightImageData = ctx.createImageData(backupImage);
			$P.highlightImageData.data.set(backupImage.data);
			var data = $P.highlightImageData.data;
			var length = data.byteLength;
			for (var i = 0; i < length; i += 4) {
				var r = data[i];
				var g = data[i + 1];
				var b = data[i + 2];
				var a = data[i + 3];
				if (color.indexOf(r + ',' + g + ',' + b + ',' + a) != -1) {
					data[i] = 0;
					data[i + 1] = 0;
					data[i + 2] = 255;
					data[i + 3] = 255;
				}
			}
			ctx.putImageData($P.highlightImageData, 0, 0);
		} else {
			ctx.putImageData(backupImage, 0, 0);
		}
	},
	mouseup: function(evt) {
		var canvas = evt.target;
		var x = evt.offsetX;
		var y = evt.offsetY;
		var imageData = canvas.getContext('2d').getImageData(0, 0, 512, 512);
		var c = Racing.pixel(imageData.data, imageData.width, x, y);
		var color = c.toHex();
		alert('color=' + JSON.stringify(c));
		var v = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
		alert('v=' + v);
		alert('color=' + color);
		var newColor = $P.color(color);
		alert('newColor=' + newColor);
		floodFill(canvas, x, y, newColor, 255);
	},
	raster: function(x, y, id) {
		var size = 512;
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		canvas.id = id;
		return canvas;
	}
};