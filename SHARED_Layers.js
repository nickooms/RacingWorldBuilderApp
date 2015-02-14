window.LAYERS = {
  items: [{
    id: 'ortho',
    name: 'Luchtfoto'
  }, {
    id: 'Baan',
    name: 'Baan'
  }, {
    id: 'Kruispunt',
    name: 'Kruispunt'
  }, {
    id: 'GRB_WBN',
    name: 'GRB - WBN - wegbaan',
    thresholds: [{
      min: 64,
      max: 189,
      color: [0xb7, 0xb7, 0xb7]
    }, {
      min: 189,
      max: 204,
      color: [0xcc, 0xcc, 0xcc]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WBN:Baan',
    name: 'GRB - WBN - wegbaan : Baan',
    thresholds: [{
      min: 193,
      max: 204,
      color: [0xcc, 0xcc, 0xcc]
    }, {
      min: 64,
      max: 193,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WBN:Kruispunt',
    name: 'GRB - WBN - wegbaan : Kruispunt',
    thresholds: [{
      min: 189,
      max: 204,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 64,
      max: 189,
      color: [0xb7, 0xb7, 0xb7]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WGO',
    name: 'GRB - WGO - wegopdeling',
    thresholds: [{
      min: 64,
      max: 64,
      color: [0xbf, 0x00, 0xc8]
    }, {
      min: 85,
      max: 130.5,
      color: [0xbf, 0x00, 0xc8]
    }, {
      min: 21,
      max: 85,
      color: [0x98, 0x4c, 0x00]
    }, {
      min: 132,
      max: 157,
      color: [0xff, 0xd7, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WGO:Purple',
    name: 'GRB - WGO - wegopdeling : Purple',
    thresholds: [{
      min: 64,
      max: 64,
      color: [0xbf, 0x00, 0xc8]
    }, {
      min: 85,
      max: 130.5,
      color: [0xbf, 0x00, 0xc8]
    }, {
      min: 21,
      max: 85,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 132,
      max: 157,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WGO:Brown',
    name: 'GRB - WGO - wegopdeling : Brown',
    thresholds: [{
      min: 64,
      max: 64,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 85,
      max: 130.5,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 21,
      max: 85,
      color: [0x98, 0x4c, 0x00]
    }, {
      min: 132,
      max: 157,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WGO:Yellow',
    name: 'GRB - WGO - wegopdeling : Yellow',
    thresholds: [{
      min: 64,
      max: 64,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 85,
      max: 130.5,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 21,
      max: 85,
      color: [0x00, 0x00, 0x00, 0x00]
    }, {
      min: 132,
      max: 157,
      color: [0xff, 0xd7, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WVB',
    name: 'GRB - WVB - wegverbinding',
    thresholds: [{
      min: 128,
      max: 232,
      color: [0x80, 0x80, 0x80]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WKN',
    name: 'GRB - WKN - wegknoop',
    thresholds: [{
      min: 15,
      max: 30,
      color: [0x00, 0x00, 0xff]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WRI',
    name: 'GRB - WRI - putdeksel',
    thresholds: [{
      min: 42.5,
      max: 104,
      color: [0x00, 0x00, 0xff]
    }, {
      min: 104,
      max: 139,
      color: [0x00, 0xff, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WPI',
    name: 'GRB - WPI - puntvormige inrichting',
    thresholds: [{
      min: 21,
      max: 250,
      color: [0x94, 0x36, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WTI',
    name: 'GRB - WTI - transversale weginrichting',
    thresholds: [{
      min: 21,
      max: 250,
      color: [0xff, 0x00, 0xff]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_WLI',
    name: 'GRB - WLI - longitudinale weginrichting',
    thresholds: [{
      min: 19,
      max: 219,
      color: [0xff, 0xff, 0x00]
    }, {
      min: 219,
      max: 239,
      color: [0x00, 0xff, 0xff]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_TRN',
    name: 'GRB - TRN - terrein',
    thresholds: [{
      min: 21,
      max: 250,
      color: [0xcc, 0xcc, 0xcc]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_ADP',
    name : 'GRB - ADP - administratief perceel',
    thresholds: [{
      min: 128,
      max: 235,
      color: [0xff, 0xf6, 0xc9]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_ADP_Grens',
    name: 'GRB - ADP - administratief perceel grens',
    thresholds: [{
      min: 28,
      max: 128,
      color: [0xcf, 0x92, 0x00]
    }, {
      min: 0,
      max: 255,
      color: [0xff, 0x00, 0x00]
    }]
  }, {
    id: 'GRB_GBG',
    name: 'GRB - GBG - gebouw aan de grond',
    thresholds: [{
      min: 160.1,
      max: 179.9,
      color: [0xfa, 0x9b, 0x87]
    }, {
      min: 160.1,
      max: 180,
      color: [0xfa, 0x9b, 0x87]
    }, {
      min: 160,
      max: 160,
      color: [0xfa, 0x7d, 0x69]
    }, {
      min: 120.1,
      max: 159.9,
      color: [0xfa, 0x7d, 0x69]
    }]
  }],
  item: function(id) {
    var layers = LAYERS.items;
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (layer.id === id) {
        return layer;
      }
    }
  }
};