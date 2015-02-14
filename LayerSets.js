window.LayerSets = {
	items: [{
		id: 'Kruispunt',
		name: 'Kruispunt',
		objectName: 'ComplexBaan',
		layers: [{
			id: 'GRB_WBN:Kruispunt'
		}, {
			id: 'GRB_WGO:Purple',
			color: 0x80808000,
			alpha: 0xff
		}]
	}, {
		id: 'Baan',
		name: 'Baan',
		objectName: 'ComplexBaan',
		layers: [{
			id: 'GRB_WBN:Baan'
		}, {
			id: 'GRB_WGO:Purple',
			color: 0xaaaaaa00,
			alpha: 0xff
		}]
	}, {
		id: 'VoetpadKruispunt',
		name: 'VoetpadKruispunt',
		objectName: 'ComplexVoetpad',
		layers: [{
			id: 'GRB_WBN:Kruispunt'
		}, {
			id: 'Kruispunt',
			color: 0x00000000,
			alpha: 0x00,
			fill: false
		}]
	}, {
		id: 'VoetpadBaan',
		name: 'VoetpadBaan',
		objectName: 'ComplexVoetpad',
		layers: [{
			id: 'GRB_WBN:Baan'
		}, {
			id: 'Baan',
			color: 0x00000000,
			alpha: 0x00,
			fill: false
		}]
	}],
	item: function(id) {
    var layerSets = LayerSets.items;
    for (var i = 0; i < layerSets.length; i++) {
      var layerSet = layerSets[i];
      if (layerSet.id === id) {
        return layerSet;
      }
    }
  }
};