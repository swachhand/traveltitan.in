    // Tile layers
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
        
    const imageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});
    
    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    
    // Create a Uttarakhand bounded map of India with default options and layer
    const maxBoundArea = L.latLngBounds(L.latLng(28.712, 77.563), L.latLng(31.493, 81.071));
    const centerUK = maxBoundArea.getCenter();
    
    // Taken from https://storage.googleapis.com/soi_data/index.html
    const baseUrl = 'https://indianopenmaps.com/';
    const soiUrl = baseUrl + 'soi/osm/{z}/{x}/{y}.webp';
    const soiOptions = {
        bounds: maxBoundArea,
        attribution: '<a href="https://onlinemaps.surveyofindia.gov.in/FreeMapSpecification.aspx" target="_blank">1:50000 Open Series Maps</a> &copy; <a href="https://www.surveyofindia.gov.in/pages/copyright-policy" target="_blank">Survey Of India</a>'
    };
    const soi = L.tileLayer(soiUrl, soiOptions);

    const mapSoIUK = L.mapWithLabels("mapSoIUK", { center: centerUK, minZoom: 8, maxZoom:14, fullscreenControl: true, layers: [osmLayer, soi] });
    mapSoIUK.fitBounds(maxBoundArea);
    mapSoIUK.setMaxBounds(maxBoundArea);
    L.control.scale({position:'bottomright'}).addTo(mapSoIUK);
        
    // Add logo and tagline to the map
    let altitudeecstasy = L.control({position: "bottomleft"});
    altitudeecstasy.onAdd = function() {
        let div = L.DomUtil.create("div", "altitudeecstasy");
        div.innerHTML = 
            '<a href="https://traveltitan.in/"> <img src = "./leaflet/images/logo/aelogo.png" alt="Altitude Ecstasy"></a><hr>' +
            'Hi, I am <b>Altitude Ecstasy!</b><br>An adventurer of the rugged Himalayan landscape.';
        return div;
    };
    altitudeecstasy.addTo(mapSoIUK);

    const baseLayers = {
	    'OpenStreetMap': osmLayer,
	    'Eris Imagery': imageryLayer,
	    'OpenTopMap': openTopoMap
    };
    const overlayMaps = {
        'Survey of India(UK)': soi
    };
    
    fetch( './leaflet/data/uk/uk_district.geojson', {
        headers: {  
        "Content-Type": 'application/geo+json',
        "Accept": 'application/geo+json'
        }
    })
    .then((response) =>{
            
        return response.json();
    })
    .then((data) => {
            
        L.geoJson(data, {
			style: {
				weight: 2,
			    color: '#E53529',
			    dashArray: '4',
			    fillOpacity: 0
			},
			label: l=>l.feature.properties.name,
			labelPos: 'cc'
        }).addTo(mapSoIUK);
        })
        .catch((error) => {
            console.log(`Error processing json: ${error}`);
        })
    var grid = L.grid( {redraw: 'moveend' } ).addTo(mapSoIUK);
    L.control.layers(baseLayers, overlayMaps, { collapsed:false } ).addTo(mapSoIUK);
    L.control.opacity( overlayMaps, { label: 'Select Opacity' } ).addTo(mapSoIUK);
