$T = window.Thumbnails = {
	generate: function() {
		var canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 64;
		canvas.style.position = 'absolute';
		canvas.style.left = '0px';
		canvas.style.top = '0px';
		canvas.style.display = 'none';
		document.body.appendChild(canvas);
		var div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.height = '20px';
		div.style.backgroundColor = 'blue';
		document.body.appendChild(div);
		$T.div = div;
		$T.canvas = canvas;
		$T.context = canvas.getContext('2d');
		$T.count = 0;
		$T.entries = Images.fromEntries();
		$T.processsed = 0;
		File.folder('Thumbnails').then(function(folder) {
			var folders = {};
			$T.entries.forEach(function(image) {
				folders[image.name.split('-')[2]] = true;
			});
			for (var folderName in folders) {
				File.folder('Thumbnails/' + folderName).then(function(folder) {
					$T.entries.filter(function(image) {
						return image.name.split('-')[2] === folder.name ? image : null;
					}).forEach(function(image) {
						File.loadImage(image.name).then(function(img) {
							$T.count++;
							$T.context.clearRect(0, 0, 64, 64);
							$T.context.drawImage(img, 0, 0, 512, 512, 0, 0, 64, 64);
							var thumbnail = $P.png($T.canvas);
							File.saveImage('Thumbnails/' + image.name.split('-')[2] + '/' + image.name, thumbnail, function() {
								$T.processsed++;
								$T.div.style.width = parseInt($T.processsed * 100 / ($T.entries.length - 1)) + '%';
							});
						});
					});
				});
			}
		});
	}
};