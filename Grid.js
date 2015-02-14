window.Grid = {
	load: function(callback) {
		getFileEntry('grid.json').then(getTextFile).then(JSON.parse).then(function(grid) {
			Grid.cols = grid.cols;
			Grid.rows = grid.rows;
			callback();
		});
	},
	save: function(callback) {
		var uniqueCols = {};
		var uniqueRows = {};
		Images.fromEntries().forEach(function(image) {
			var bbox = image.name.split('-')[3].replace('.png', '').split(',');
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
		var grid = {
			cols: cols,
			rows: rows
		};
		var fileName = 'grid.json';
		chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
		  entry.getFile(fileName, { create: true }, function(writableEntry) {
		    var s = JSON.stringify(grid);
		    var blob = new Blob([s], { type: 'text/plain' });
		    writableEntry.createWriter(function(fileWriter) {
		      fileWriter.onwriteend = function(e) {
		      	callback();
		      };
		      fileWriter.onerror = function(e) {
		        console.log('Save failed: ' + e.toString());
		      };
		      fileWriter.write(blob);
		    });
		  });
		});
	}
};