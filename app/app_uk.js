    // Tile layers
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
        
    const imageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});
        
    const hikingWaymarkedTrails = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    
    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    
    // Create a Uttarakhand bounded map of India with default options and layer
    const maxBoundArea = L.latLngBounds(L.latLng(28.723, 77.572), L.latLng(31.462, 81.047));
    const centerUK = maxBoundArea.getCenter();
    const mapUK = L.mapWithLabels("mapUK", { center: centerUK, minZoom: 7, fullscreenControl: true, defaultExtentControl: true, layers: [osmLayer] });
    mapUK.fitBounds(maxBoundArea);
    L.control.scale({position:'bottomright'}).addTo(mapUK);
    
    // Thanks to https://storage.googleapis.com/soi_data/index.html
    const baseUrl = 'https://indianopenmaps.com/';
    const soiUrl = baseUrl + 'soi/osm/{z}/{x}/{y}.webp';
    const soiOptions = {
        maxZoom: 20,
        maxNativeZoom: 14,
        bounds: maxBoundArea,
        attribution: '<a href="https://onlinemaps.surveyofindia.gov.in/FreeMapSpecification.aspx" target="_blank">1:50000 Open Series Maps</a> &copy; <a href="https://www.surveyofindia.gov.in/pages/copyright-policy" target="_blank">Survey Of India</a>'
    };
    const soiLayer = L.tileLayer(soiUrl, soiOptions);
        
    // Add logo and tagline to the map
    let altitudeecstasy = L.control({position: "bottomleft"});
    altitudeecstasy.onAdd = function() {
        let div = L.DomUtil.create("div", "altitudeecstasy");
        div.innerHTML = 
            '<a href="https://traveltitan.in/"> <img src = "./leaflet/images/logo/aelogo.png" alt="Altitude Ecstasy"></a><hr>' +
            'Hi, I am <b>Altitude Ecstasy!</b><br>An adventurer of the rugged Himalayan landscape.';
        return div;
    };
    altitudeecstasy.addTo(mapUK);
    
    // Add sidepanel as specified in the html file
    const panelLeft = L.control.sidepanel('mySidePanel', { pushControls: true, startTab: 'tab-1' }).addTo(mapUK);
        
    // Add a pop-up about Uttarakhand
    const introMessage = '<div align="justify">From the ancient temples nestled amidst lush green valleys to the challenging treks that lead to breathtaking peaks and passes, every step in Uttarakhand reveals a story of spiritual opulence and captivating natural allure.</div><div align="center"><a href="https://uttarakhandtourism.gov.in/"><img src = ./leaflet/images/logo/uklogo.png height=150px></a><br>Use the left panel to view more information and right panel to explore Uttarakhand.</div>';
    L.popup().setLatLng(centerUK).setContent(introMessage).openOn(mapUK);
        
    //Loader gif
    const controlLoader = L.control.loader().addTo(mapUK);
    controlLoader.show();

	function iconByName(name) {
	   return '<i class="icon icon-'+name+'"></i>';
    }

    function geojsonToOverLayer(url, name) {
	   // Create a custom marker to display on the map
	   let layerMarkerIcon = L.icon({
            iconUrl: './leaflet/images/markers/' + name + '.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -27],
        });

        //Process GeoJSON file
        let layerMarkers = L.markerClusterGroup();
        fetch( url, {
            headers: {  
            "Content-Type": 'application/geo+json',
            "Accept": 'application/geo+json'
            }
        })
        .then((response) =>{
            
            return response.json();
        })
        .then((data) => {
            
            var geojsonGroup = L.geoJson(data, {
                onEachFeature : function(feature, layer) {
                    var message = '<div align="center"><h3>' + layer.feature.properties.name + '</h3><hr><p>' + layer.feature.properties.description;
                    if (layer.feature.properties.visited) message += ' (' + layer.feature.properties.visited + ')</p>';
                    if (layer.feature.properties.image) message += '<p><img src = ./leaflet/images/popups/' + layer.feature.properties.image + ' height=166px"></p></div>';
                    layer.bindPopup( message);
                },
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, { icon: layerMarkerIcon });
                }
            });
            layerMarkers.addLayer(geojsonGroup);
        })
        .catch((error) => {
            console.log(`Error processing json: ${error}`);
        });
        return layerMarkers;
    }
                
    // Set object for the basemaps
    var baseLayers = [
	{
	    group: "Base Map",
        collapsed: true,
		layers: [
		{
			name: "OpenStreetMap",
            icon: iconByName('basemaps_osm'),
		    layer: osmLayer
		},
		{
		    name: "Eris Imagery",
            icon: iconByName('basemaps_eris'),
		    layer: imageryLayer
		},
		{
		    name: "OpenTopoMap",
            icon: iconByName('basemaps_osm'),
		    layer: openTopoMap
		}]
	    }];

        // Set object for marker layers
        var overLayers = [
            {
            group: "Administrative",
            collapsed: true,
            layers: [
	            {
	            active: true,
		        name: "State",
		        icon: iconByName('uk_district'),
	            layer: (() => {
				    var l = L.geoJson([], {
				        style: {
				                weight: 3,
			                    color: '#E54561',
			                    fillOpacity: 0,
				        }}
                    );
					$.getJSON('./leaflet/data/uk/uk_state.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            {
	            active: true,
		        name: "Districts",
		        icon: iconByName('uk_district'),
		        layer: (() => {
				    var l = L.geoJson([], {
				        style: {
				                weight: 2,
			                    color: '#E53529',
			                    dashArray: '4',
			                    fillOpacity: 0
				        },
				        label: l=>l.feature.properties.name,
				        labelPos: 'cc',
				        labelStyle:l=>({ 
                            background: 'green', 
                            border: 'solid 2px white', padding: '0 5px',
                            borderRadius: '6px', color: 'white', textShadow: 'none', textAlign: 'center'
                        }),
				        onEachFeature: (feature, layer)=>{
                            var message = '<div align="center"><h2>' + layer.feature.properties.name + '</h2><hr><p>' + layer.feature.properties.description;
                            if (layer.feature.properties.website) message += '<br><a href="https://' + layer.feature.properties.website +'" target="_blank">Website</a>';
                            if (layer.feature.properties.image) message += '</p> <img src = ./leaflet/images/popups/' + layer.feature.properties.image + ' height=166px"> </div>';
                            layer.bindPopup( message);
                        } }
                    );
					$.getJSON('./leaflet/data/uk/uk_district.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            {
		        name: "Archaeology",
		        icon: iconByName('landmarks_monument'),
		        layer: (() => {
		            let layerMarkers = L.markerClusterGroup();
				    var l = L.geoJson([], {
				        onEachFeature: (feature, layer)=>{ layer.bindTooltip( feature.properties.name, { className: 'custom-tooltip' }); },
				        pointToLayer: (feature, latlng) => { return L.circleMarker(latlng, { color: '#D51C3F', fillColor: '#D51C3F', fillOpacity: 0.5, weight: 3, radius: 11}); }
				    }
                    );
					$.getJSON('./leaflet/data/uk/uk_asi.geojson', j => {
						l.addData(j);
						layerMarkers.addLayer(l);
					});
					return layerMarkers;
				})()
	            }
            ]},
            {
            group: "Spiritual",
            collapsed: true,
            layers: [
	            {
		        name: "Dhams",
		        icon: iconByName('temples_misc'),
		        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/uk_dham.geojson', 'temples_misc')
	            },
                {
		        name: "Kedar",
		        icon: iconByName('temples_kathkuni'),
		        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/uk_kedar.geojson', 'temples_kathkuni')
	            },
                {
		        name: "Badri",
		        icon: iconByName('temples_nagara'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/uk_badri.geojson', 'temples_nagara')
	            },
	            {
		        name: "Prayags",
		        icon: iconByName('uk_prayag'),
		        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/uk_prayag.geojson', 'uk_prayag')
	            }
            ]},
            {
            group: "Adventure",
            collapsed: true,
            layers: [
	            /*{
		        name: "Caves",
		        icon: iconByName('landforms_cave'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/ukbadri.geojson', 'landforms_cave')
	            },*/
	            {
		        name: "Glacial Lakes (NRSC)",
		        icon: iconByName('landforms_lake'),
		        layer: (() => {
		            let layerMarkers = L.markerClusterGroup();
				    var l = L.geoJson([], {
				        onEachFeature: (feature, layer)=>{ layer.bindTooltip('LakeType - ' + feature.properties.LakeType + '<br>Area - ' + feature.properties.Area, { className: 'custom-tooltip'}); },
				        pointToLayer: (feature, latlng) => { return L.circleMarker(latlng, { color: '#44BBFF', fillColor: '#44BBFF', fillOpacity: 0.5, weight: 3, radius: 11}); }
				    }
                    );
					$.getJSON('./leaflet/data/uk/uk_glacial_lakes.geojson', j => {
						l.addData(j);
						layerMarkers.addLayer(l);
					});
					return layerMarkers;
				})()
	            },
	            /*{
		        name: "Meadows",
		        icon: iconByName('landforms_camping'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/ukbadri.geojson', 'landforms_camping')
	            },*/
	            {
		        name: "Passes",
		        icon: iconByName('landforms_pass'),
		        layer: (() => {
		            let layerMarkers = L.markerClusterGroup();
				    var l = L.geoJson([], {
				        onEachFeature: (feature, layer)=>{ layer.bindTooltip( feature.properties.name, { className: 'custom-tooltip' }); },
				        pointToLayer: (feature, latlng) => { return L.circleMarker(latlng, { color: '#B94D0E', fillColor: '#B94D0E', fillOpacity: 0.5, weight: 3, radius: 11}); }
				    }
                    );
					$.getJSON('./leaflet/data/uk/uk_passes.geojson', j => {
						l.addData(j);
						layerMarkers.addLayer(l);
					});
					return layerMarkers;
				})()
	            },
	            /*{
		        name: "Places",
		        icon: iconByName('landforms_viewpoint'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/ukbadri.geojson', 'landforms_viewpoint')
	            },*/
	            {
		        name: "Rivers",
		        icon: iconByName('landforms_river'),
		        layer: (() => {
				    var l = L.geoJson([], {
                        style: { weight: 1.5, color: '#115BFB', fillOpacity: 0.2, dashArray: "10,5", dashSpeed: -15 },
                        pointToLayer: (feature, latlng) => { return L.polyline.antPath(latlngs); },
				        label: l=>l.feature.properties.name,
				        labelPos: 'cc',
				        labelStyle: { color: '#115BFB', fontStyle: 'italic'}
				        }
                    );
					$.getJSON('./leaflet/data/uk/uk_river.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            {
		        name: "Streams",
		        icon: iconByName('landforms_river'),
		        layer: (() => {
				    var l = L.geoJson([], {
                        style: { weight: 1.5, color: '#115BFB', fillOpacity: 0.2, dashArray: "10,5", dashSpeed: -15 },
                        pointToLayer: (feature, latlng) => { return L.polyline.antPath(latlngs); },
				        label: l=>l.feature.properties.name,
				        labelPos: 'cc',
				        labelStyle: { color: '#115BFB', fontStyle: 'italic'}
				        }
                    );
					$.getJSON('./leaflet/data/uk/uk_stream.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            /*{
		        name: "Treks",
		        icon: iconByName('landmarks_trek'),
		        layer: (() => {
				    var l = L.geoJson([], {
				        style: {
				                weight: 3,
			                    color: '#B94D0E',
			                    dashArray: '3',
			                    fillOpacity: 0.5
				        },
			            label: l=>l.feature.properties.name,
				        labelPos: 'cc',
				        labelStyle: { color: '#B94D0E', fontStyle: 'italic'}
				    }
                    );
					$.getJSON('./leaflet/data/uk/uk_sample_treks.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            {
		        name: "Peaks Vista",
		        icon: iconByName('landforms_viewpoint'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/uk_viewpoints.geojson', 'landforms_viewpoint')
	            },
	            {
		        name: "Waterfalls",
		        icon: iconByName('landforms_waterfall'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/ukbadri.geojson', 'landforms_waterfall')
	            },*/
	            {
		        name: "Wetlands (2012)",
		        icon: iconByName('landforms_lake'),
		        layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/uk_wetlands.geojson', 'landforms_lake')
	            },
	            {
		        name: "Wildlife",
		        icon: iconByName('landforms_wildlife'),
		        layer: (() => {
				    var l = L.geoJson([], {
				        style: {
				                weight: 3,
			                    color: '#32CD32',
			                    fillOpacity: 0.3,
			                    dashArray: "10,5", dashSpeed: -15
				        },
				        label: l=>l.feature.properties.name,
				        labelPos: 'cc',
				        onEachFeature: (feature, layer)=>{ if (feature.geometry.type === 'Point') {
				            layer.bindTooltip(feature.properties.name, {className: 'custom-tooltip' });
				        }}
				    }
                    );
					$.getJSON('./leaflet/data/uk/uk_wildlife.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            }
            ]},
            {
            group: "Maps",
            collapsed: true,
            layers: [
                {
		        name: "SoI Map Index",
		        icon: iconByName('basemaps_topo'),
		        layer: (() => {
				    var l = L.geoJson([], {
				        style: {
				                weight: 1,
			                    color: '#FF5733',
			                    dashArray: '3',
			                    fillOpacity: 0
				        },
				        onEachFeature: (feature, layer)=>{
                            layer.bindTooltip('Sheet No - ' + feature.properties.Sheet_No + '<br>OSM No - ' + feature.properties.OSM_No, { className: 'custom-tooltip'});
                        } }
                    );
					$.getJSON('./leaflet/data/uk/uk_SoI.geojson', j => {
						l.addData(j);
					});
					return l;
				})()
	            },
	            {
			    name: "Open Series Map",
                icon: iconByName('basemaps_topo'),
		        layer: soiLayer
		        }
            ]}
	    ];

    // Add baseLayers to map
	var panelLayersIndia = L.control.panelLayers(baseLayers, overLayers, {collapsibleGroups: true, collapsed: true} );
	mapUK.addControl(panelLayersIndia);
    /*   
        panelLayersIndia.addOverlay(
            {
            active: true,
		    name: "Dham",
		    icon: iconByName('temples_misc'),
		    layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/ukdham.geojson', 'temples_misc')
	    }, "Dham", "Ecstasy");
        mapUK.addControl(panelLayersIndia);
        
        panelLayersIndia.addOverlay(
            {
            active: true,
		    name: "Kedar",
		    icon: iconByName('temples_nagara'),
		    layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/ukkedar.geojson', 'temples_nagara')
	    }, "Kedar", "Ecstasy");
        mapUK.addControl(panelLayersIndia);
        
        panelLayersIndia.addOverlay(
            {
            active: true,
		    name: "Badri",
		    icon: iconByName('temples_kathkuni'),
		    layer: geojsonToOverLayer( 'https://traveltitan.in/leaflet/data/uk/ukbadri.geojson', 'temples_kathkuni')
	    }, "Badri", "Ecstasy");
        mapUK.addControl(panelLayersIndia);
        
        panelLayersIndia.addOverlay(
            {
            active: true,
		    name: "Prayag",
		    icon: iconByName('landforms_waterfall'),
		    layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/uk/ukprayag.geojson', 'landforms_waterfall')
	    }, "Prayag", "Ecstasy");
        mapUK.addControl(panelLayersIndia);
    */
    controlLoader.hide();
    const grid = L.grid( {redraw: 'moveend' } ).addTo(mapUK);