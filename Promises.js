var getFileEntry = function(fileName) {
	return new Promise(function(resolve, reject) {
		for (var fileEntry of Racing.entries) {
			if (fileEntry.name.indexOf(fileName) != -1) {
				resolve(fileEntry);	
			}
		}
		reject(fileName + ' was not found');
	});
};
var getTextFile = function(fileEntry) {
	return new Promise(function(resolve, reject) {
		fileEntry.file(function(file) {
    	var reader = new FileReader();
    	reader.onload = function(evt) {
      	resolve(evt.target.result);
    	};
    	reader.onerror = function(error) {
    		reject(error);
    	}
    	reader.readAsText(file);
  	});
	});
};
var getTileObject = function(canvas) {
	return new Promise(function(resolve, reject) {
		var context = canvas.getContext('2d');
		var imageData = context.getImageData(0, 0, 512, 512);
		var data = imageData.data;
		var x, y, offset, r, g, b, a, isNotEmpty, isNotProcessed;
		for (y = 0; y < 512; y++) {
			for (x = 0; x < 512; x++) {
				offset = (512 * y + x) * 4;
				r = data[offset];
				g = data[offset + 1];
				b = data[offset + 2];
				a = data[offset + 3];
				isNotEmpty = r != 0 || g != 0 || b != 0;
				if (isNotEmpty) {
					isNotProcessed = !(r == 0xff && g == 0 && b == 0 && a == 0xff);
					if (isNotProcessed) {
						//alert([x, y]);
						resolve([x, y, [r, g, b, a]]);
						return;
					}
				}
			}
		}
		reject('Every pixel is empty or processed');
	});
};
var getNextTile = function() {
	return new Promise(function(resolve, reject) {
		if ($P.fileIndex < $P.files.length - 1) {
			$P.fileIndex++;
			resolve();
		} else {
			reject('All tiles processed');
		}
	});
}