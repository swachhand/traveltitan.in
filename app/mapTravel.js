// Tile layers
const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
const imageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});
        
// Create a centered map of India with default options and layer
const mapIndia = L.map("mapIndia", {center: [20.59, 78.96], zoomDelta: 0.5, zoomSnap: 0.5, zoom: 5, fullscreenControl: true, defaultExtentControl: true, layers: [osmLayer]});
L.control.scale({position:'bottomright'}).addTo(mapIndia);

// Add coming soon marker
const indiaMarker = L.icon({
    iconUrl: "./leaflet/images/markers/india.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -27],
});
L.marker([20.59, 78.96], {icon: indiaMarker} ).bindPopup("<h3>Hello internet!</h3><hr><p>Work in progress, more places coming soon...</p>").addTo(mapIndia).openPopup();

// Add logo and tagline to the map
let altitudeecstasy = L.control({position: "bottomleft"});
altitudeecstasy.onAdd = function() {
let div = L.DomUtil.create("div", "altitudeecstasy");
    div.innerHTML = 
        '<a href="https://traveltitan.in/"> <img src = "./leaflet/images/logo/aelogo.png" alt="Altitude Ecstasy"></a><hr>' +
        'Hi, I am <b>Altitude Ecstasy!</b><br>' + 
        'This page serves as a chronicle of my journey through the passage of time. With each marker on the map, I navigate the landscapes of existence, evoking contours of thought and emotion.';
        return div;
    };
altitudeecstasy.addTo(mapIndia);

function iconByName(name) {
	return '<i class="icon icon-'+name+'"></i>';
}

function geojsonToOverLayer(url, name) {
    // Create a marker to display on the map
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
    } )
    .then((response) =>{
        
        return response.json();
    })
    .then((data) => {
        
        var geojsonGroup = L.geoJson(data, {
            
            onEachFeature : function(feature, layer) {
                layer.bindPopup('<div align="center"><h2>' + layer.feature.properties.name + '</h2><hr><p>' + layer.feature.properties.description + ' (' + layer.feature.properties.visited + ')' + '</p> <img src = ./leaflet/images/popups/' + layer.feature.properties.image + ' height=166px width:250px"> </div>', { maxWidth: "250"});
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
		}]
}];

/*	    
// Add baseLayers to map
var panelLayersTravel = L.control.panelLayers(baseLayers, null, {collapsibleGroups: true, collapsed: true});
        
panelLayersTravel.addOverlay(
    {
    active: true,
	name: "Beach",
	icon: iconByName('landforms_beach'),
	layer: geojsonToOverLayer('landforms_beach', 'https://traveltitan.in/leaflet/data/landforms_beach.geojson')
	}, "Beach", "Landforms");

mapIndia.addControl(panelLayersTravel);
        
panelLayersTravel.addOverlay(
    {
    active: true,
    name: "Sand dune",
	icon: iconByName('landforms_desert'),
    layer: geojsonToOverLayer('landforms_desert', 'https://traveltitan.in/leaflet/data/landforms_desert.geojson')
}, "Sand dune", "Landforms");

mapIndia.addControl(panelLayersTravel);
*/	    

// Set object for marker layers
var overLayers = [
    /*
    {
    group: "Landmarks",
    collapsed: true,
    layers: [
        {
	    name: "Fort|Palace",
        icon: iconByName('landmarks_fort'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
        {
		name: "Monument",
        icon: iconByName('landmarks_monument'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
        {
		name: "Misc",
        icon: iconByName('landmarks_misc'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    }
    ]},
    */
    {
    group: "Landforms",
    collapsed: true,
    layers: [
	    {
	    active: true,
		name: "Beach",
        icon: iconByName('landforms_beach'),
        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/landforms_beach.geojson', 'landforms_beach')
	    },
	    /*{
		name: "Folklore",
        icon: iconByName('landforms_folklore'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },*/
        {
        active: true,
	    name: "Lake",
        icon: iconByName('landforms_lake'),
        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/landforms_lake.geojson', 'landforms_lake')
	    },
	    {
	    active: true,
	    name: "Sand dune",
        icon: iconByName('landforms_desert'),
        layer: geojsonToOverLayer('https://traveltitan.in/leaflet/data/landforms_desert.geojson', 'landforms_desert')
	    }/*,
	    {
	    name: "Viewpoint",
        icon: iconByName('landforms_viewpoint'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
	    {
	    name: "Waterfall",
        icon: iconByName('landforms_waterfall'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    }*/
    ]},
    /*
    {
    group: "Temples",
    collapsed: true,
    layers: [
	    {
	    name: "Dravidian",
        icon: iconByName('temples_dravidian'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
	    {
	    name: "Kathkuni",
        icon: iconByName('temples_kathkuni'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
	    {
	    name: "Nagara",
        icon: iconByName('temples_nagara'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
	    {
	    name: "Rockcut",
        icon: iconByName('temples_rockcut'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    },
	    {
	    name: "Misc",
        icon: iconByName('temples_misc'),
        layer: L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png')
	    }
    ]},
    */
];

// Add baseLayers and overLayers to map
var panelLayersTravel = L.control.panelLayers(baseLayers, overLayers, {collapsibleGroups: true, collapsed: true});
mapIndia.addControl(panelLayersTravel);