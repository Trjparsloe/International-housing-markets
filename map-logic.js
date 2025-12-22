/* ======================================================================
   1. MAP CONFIGURATION & PROJECTION
   ====================================================================== */
const width = 1200;  
const height = 750;

const countryNameLookup = {
    '250': 'France',
    '392': 'Japan',
    '410': 'Korea',
    '512': 'Oman',
    '010': 'Antarctica'
};

const interactiveCountries = Object.keys(countryNameLookup);

const cityMarkets = [
    { id: 'HKG', name: 'Hong_Kong', coords: [114.1694, 22.3193] },
    { id: 'BER', name: 'Berlin', coords: [13.4050, 52.5200] }
];

const interactiveColor = '#f97316'; 
const cityDefaultColor = "#2dd4bf"; 
const defaultColor = '#d1d5db';     
const hoverColor = '#facc15';       

const svg = d3.select("#map-container");

// Only initialize projection if we are on the map page
const projection = d3.geoNaturalEarth1()
    .scale(245) 
    .center([0, 0])       
    .rotate([-11, 0]) // Fixed New Zealand split
    .translate([width / 2, height / 2.2]); 

const path = d3.geoPath().projection(projection);

/* ======================================================================
   2. DRAWING THE MAP (PROTECTED)
   ====================================================================== */
if (svg.node()) {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function(topoData) {
        
        const tag = d3.select("#country-tag");
        let countries = topojson.feature(topoData, topoData.objects.countries);

        let refinedFeatures = [];

        countries.features.forEach(d => {
            const id = String(d.id).padStart(3, '0');
            if (id === '250' && d.geometry.type === "MultiPolygon") {
                d.geometry.coordinates.forEach((coords, index) => {
                    const isMainland = coords[0][0][0] > -10; 
                    refinedFeatures.push({
                        type: "Feature",
                        id: isMainland ? '250' : `999-${index}`,
                        properties: d.properties,
                        geometry: { type: "Polygon", coordinates: coords }
                    });
                });
            } else {
                refinedFeatures.push(d);
            }
        });

        svg.append("g")
            .selectAll("path")
            .data(refinedFeatures) 
            .enter()
            .append("path")
            .attr("d", path) 
            .attr("class", "country") 
            .style("fill", d => {
                const id = String(d.id).padStart(3, '0');
                if (id === '010') return defaultColor; 
                return interactiveCountries.includes(id) ? interactiveColor : defaultColor;
            })
            .style("pointer-events", d => {
                const id = String(d.id).padStart(3, '0');
                return interactiveCountries.includes(id) ? "all" : "none";
            })
            .on("mouseover", function(event, d) {
                const id = String(d.id).padStart(3, '0');
                if (!interactiveCountries.includes(id)) return;
                d3.select(this).style("cursor", "pointer");
                if (id !== '010') {
                    tag.style("display", "block").text(countryNameLookup[id]);
                    d3.select(this).style("fill", hoverColor).style("stroke", "#ffffff").style("stroke-width", "2px");
                }
            })
            .on("mousemove", event => {
                tag.style("top", (event.pageY - 45) + "px").style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function(event, d) {
                const id = String(d.id).padStart(3, '0');
                tag.style("display", "none");
                if (id !== '010' && interactiveCountries.includes(id)) {
                    d3.select(this).style("fill", interactiveColor).style("stroke", "white").style("stroke-width", "0.5px");
                }
                d3.select(this).style("cursor", "default");
            })
            .on("click", (event, d) => {
                const id = String(d.id).padStart(3, '0');
                if (!interactiveCountries.includes(id)) return;
                window.location.href = id === '010' ? `/Antarctica.html` : `/${countryNameLookup[id]}.html`;
            });

        svg.append("g")
            .selectAll("circle")
            .data(cityMarkets)
            .enter()
            .append("circle")
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1])
            .attr("r", 6.5) 
            .attr("fill", cityDefaultColor) 
            .attr("stroke", "#ffffff")        
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                tag.style("display", "block").text(d.name.replace('_', ' '));
                d3.select(this).transition().duration(200).attr("r", 9).attr("fill", hoverColor).attr("stroke", "#000");
            })
            .on("mousemove", event => {
                tag.style("top", (event.pageY - 45) + "px").style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function() {
                tag.style("display", "none");
                d3.select(this).transition().duration(200).attr("r", 6.5).attr("fill", cityDefaultColor).attr("stroke", "#ffffff");
            })
            .on("click", (event, d) => { window.location.href = `/${d.name}.html`; });
    });
}
