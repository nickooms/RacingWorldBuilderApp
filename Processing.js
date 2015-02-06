Processing = {
	//TEST_FILE: 'Stabroek-Markt-GRB_ADP_Grens-152454.66090932,221763.61019389,152488.52764372,221797.47692829.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WBN-152691.72805012,221899.07713149,152725.59478452,221932.94386589.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WGO-152556.26111252,221831.34366269,152590.12784692,221865.21039709.png',
	TEST_FILE: 'Stabroek-Markt-GRB_GBG-152488.52764372,221763.61019389,152522.39437812,221797.47692829.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_TRN-152488.52764372,221831.34366269,152522.39437812,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WKN-152556.26111252,221831.34366269,152590.12784692,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WLI-152488.52764372,221831.34366269,152522.39437812,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WPI-152454.66090932,221831.34366269,152488.52764372,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WRI-152556.26111252,221831.34366269,152590.12784692,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WTI-152556.26111252,221899.07713149,152590.12784692,221932.94386589.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_WVB-152556.26111252,221797.47692829,152590.12784692,221831.34366269.png',
	//TEST_FILE: 'Stabroek-Markt-ortho-152522.39437812,221831.34366269,152556.26111252,221865.21039709.png',
	//TEST_FILE: 'Stabroek-Markt-GRB_ADP-152522.39437812,221899.07713149,152556.26111252,221932.94386589.png',
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
		alert(Processing.highlightCanvas.id);
		var ctx = Processing.highlightCanvas.getContext('2d');
		var backupImage = Processing.highlightCanvas.id == 'left' ? Processing.leftBackupImage : Processing.rightBackupImage;
		if (color != null) {
			alert('mousedown ' + color.length);
			Processing.highlightImageData = ctx.createImageData(backupImage);
			Processing.highlightImageData.data.set(backupImage.data);
			var data = Processing.highlightImageData.data;
			var length = data.byteLength;
			for (var i = 0; i < length; i += 4) {
				var r = data[i];
				var g = data[i + 1];
				var b = data[i + 2];
				var a = data[i + 3];
				if (color.indexOf(r + ',' + g + ',' + b + ',' + a) != -1) {
					data[i] = 255;
					data[i + 1] = 255;
					data[i + 2] = 0;
					data[i + 3] = 255;
				}
			}
			ctx.putImageData(Processing.highlightImageData, 0, 0);
		} else {
			alert('mouseup');
			ctx.putImageData(backupImage, 0, 0);
		}
	},
	init: function() {
		var layerDropdown = Dropdown.fromArray(LAYERS.items);
		layerDropdown.value = 'GRB_GBG';
		var imagesDropdown = Dropdown.fromArray(Images.fromEntries().filter(function(entry) {
			return entry.name.indexOf(layerDropdown.value) != -1 ? entry : null;
		}), 'name', 'name');
		document.body.insertBefore(imagesDropdown, document.body.childNodes[0]);
		document.body.insertBefore(layerDropdown, document.body.childNodes[0]);
		Processing.layer = Processing.TEST_FILE.split('-')[2];
		File.load(Processing.TEST_FILE, function(img) {
			var size = 512;
			var table = document.createElement('table');
			table.className = 'image';
			document.body.appendChild(table);
			var tr = table.insertRow();
			var tdLeftCanvas = tr.insertCell();
			tdLeftCanvas.align = 'right';
			var div = document.createElement('div');
			div.className = 'Menu';
			Processing.leftCanvas = Processing.raster(10, 10, 'left');
			tdLeftCanvas.appendChild(Processing.leftCanvas);
			tdLeftCanvas.appendChild(div);
			var divLeft = document.createElement('div');
			divLeft.style.width = '100%';
			var leftContext = Processing.leftCanvas.getContext('2d');
			leftContext.drawImage(img, 0, 0);
			Processing.leftBackupImage = leftContext.getImageData(0, 0, size, size);
			var imageData = leftContext.getImageData(0, 0, size, size);
			var data = imageData.data;
			var colors = Color.analyze(imageData);
			var V = {};
			for (var i in colors.colors) {
				var color = colors.colors[i];
				var value = color.value.split(',');
				var r = parseInt(value[0]);
				var g = parseInt(value[1]);
				var b = parseInt(value[2]);
				var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
				if (V[v] == null) {
					V[v] = [];
				}
				V[v].push([r, g, b]);
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
			var tableColors = document.createElement('table');
			tableColors.style.color = '#ffffff';
			tableColors.cellPadding = 0;
			tableColors.cellSpacing = 0;
			tdLeftCanvas.appendChild(tableColors);
			var trColors = tableColors.insertRow();
			for (var i = 0; i < Vs.length; i++) {
				var tdColor = trColors.insertCell();
				tdColor.style.width = '32px';
				tdColor.style.height = '16px';
				tdColor.innerText = Vs[i].v.toFixed(1);
				tdColor.title = Vs[i].value[0].join(',');
				tdColor.style.backgroundColor = 'rgb(' + Vs[i].value[0].join(',') + ')';
				if (i % 16 == 15) {
					trColors = tableColors.insertRow();
				}
			}
			div.appendChild(Processing.colorMenu(colors, Processing.leftCanvas));
			Processing.filterColors(data);
			var colors = Color.analyze(imageData);
			var tdRightCanvas = tr.insertCell();
			tdRightCanvas.align = 'right';
			var div = document.createElement('div');
			div.className = 'Menu';
			Processing.rightCanvas = Processing.raster(550, 10, 'right');
			div.appendChild(Processing.colorMenu(colors, Processing.rightCanvas));
			tdRightCanvas.appendChild(Processing.rightCanvas);
			tdRightCanvas.appendChild(div);
			var rightContext = Processing.rightCanvas.getContext('2d');
			rightContext.putImageData(imageData, 0, 0);
			Processing.rightBackupImage = rightContext.getImageData(0, 0, size, size);
			Processing.leftCanvas.onmouseup = Processing.rightCanvas.onmouseup = Processing.mouseup;
		});
	},
	filterColors: function(data) {
		var thresholdMin, thresholdMax;
		for (var i = 0; i < data.byteLength; i += 4) {
			var r = data[i];
			var g = data[i + 1];
			var b = data[i + 2];
			var a = data[i + 3];
			var avg = (r + g + b) / 3;
			switch (Processing.layer) {
				case 'GRB_WBN':
					if (a != 0) {
						a = data[i + 3] = 255;
						if (193 <= avg && avg <= 204) {
							r = data[i] = 204;
							g = data[i + 1] = 204;
							b = data[i + 2] = 204;
						} else {
							r = data[i] = 183;
							g = data[i + 1] = 183;
							b = data[i + 2] = 183; 
						}
					}
					break;
				case 'GRB_GBG':
					var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
					var thresholds = [{
						min: 150.17,
						max: 173.04,
						value: 0xcf
					}, {
						min: 173.74,
						max: 173.76,
						color: [0xfa, 0x9b, 0x87],
						value: 0x7f
					}, {
						min: 150.12,
						max: 150.16,
						color: [0xfa, 0x7d, 0x69],
						value: 0x3f
					}, {
						min: 11.05,
						max: 150.12,
						value: 0x00
					}];
					var threshold = null;
					for (var j = 0; j < thresholds.length; j++) {
						if (v >= thresholds[j].min && v <= thresholds[j].max) {
							threshold = thresholds[j];
							break;
						}
					}
					if (threshold != null) {
						if (threshold.color) {
							data[i] = threshold.color[0];
							data[i + 1] = threshold.color[1];
							data[i + 2] = threshold.color[2];
						} else {
							data[i] = data[i + 1] = data[i + 2] = threshold.value;
						}
						data[i + 3] = 0xff;
					} else {
						data[i] = data[i + 1] = data[i + 2] = 0x00;
						data[i + 3] = 0x00;
					}
					break;
			}
		}
	},
	colorMenu: function(colors, canvas) {
		var ul = document.createElement('ul');
		ul.canvas = canvas;
		ul.style.textAlign = 'left';
		ul.style.listStyleType = 'none';
    ul.style.display = 'list-item';
		for (var item in colors) {
			var li = document.createElement('li');
			li.onmouseover = function() {
				Processing.highlightCanvas = this.parentNode.canvas;
				Processing.highlightImageData = Processing.highlightCanvas.getContext('2d').getImageData(0, 0, 512, 512);
				var ul = this.getElementsByTagName('ul')[0];
				ul.style.display = '';
			}
			li.onmouseout = function() {
				var ul = this.getElementsByTagName('ul')[0];
				ul.style.display = 'none';
			}
			li.appendChild(document.createTextNode(colors[item].length + ' ' + item));
			var ulColors = document.createElement('ul');
			ulColors.style.display = 'none';
			ulColors.style.listStyleType = 'none';
			for (var i = 0; i < colors[item].length; i++) {
				var liColors = document.createElement('li');
				liColors.style.backgroundColor = 'rgba(' + colors[item][i].value + ')';
				liColors.title = colors[item][i].value;
				liColors.onmouseover = function() {
					var col = this.title.split(',');
					Processing.highlightColor = {
						r: parseInt(col[0]),
						g: parseInt(col[1]),
						b: parseInt(col[2]),
						a: parseInt(col[3])
					};
					Processing.highlight(Processing.highlightColor);
				};
				liColors.onmouseout = function() {
					Processing.highlight();
				};
				liColors.appendChild(document.createTextNode(colors[item][i].count));
				ulColors.appendChild(liColors);
			}
			li.appendChild(ulColors);
			ul.appendChild(li);
		}
		return ul;
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
		var newColor = Processing.color(color);
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