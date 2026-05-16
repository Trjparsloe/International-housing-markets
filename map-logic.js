/* ======================================================================
   1. MAP CONFIGURATION & PROJECTION
   ====================================================================== */
const width = 1200;  
const height = 750;

const countryNameLookup = {
    '392': 'Japan',
    '512': 'Oman',
    '276': 'Germany',
    '010': 'Antarctica'
};

// Maps 3-digit numeric ISOs to 2-letter codes for FlagCDN
const flagCodesLookup = { 
    '392': 'jp', // Japan
    '512': 'om', // Oman
    '276': 'de'  // Germany
};

const interactiveCountries = Object.keys(countryNameLookup);

const cityMarkets = [
    // { id: 'HKG', name: 'Hong_Kong', coords: [114.1694, 22.3193] }
];

const interactiveColor = '#f97316'; 
const cityDefaultColor = '#f97316'; 
const defaultColor = '#d1d5db';    
const hoverColor = '#facc15';      

const svg = d3.select("#map-container");

const projection = d3.geoNaturalEarth1()
    .scale(245) 
    .center([0, 0])       
    .rotate([-11, 0]) 
    .translate([width / 2, height / 2.2]); 

const path = d3.geoPath().projection(projection);

/* ======================================================================
   2. DRAWING THE MAP (UPDATED FOR ORIGINAL MODERNIST SHADOW BOX + FLAGS)
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
                    const lon = coords[0][0][0];
                    const lat = coords[0][0][1];

                    // Identify Mainland France and Corsica
                    const isMainland = lon > -10; 
                    const isCorsica = (lon > 8 && lon < 10 && lat > 41 && lat < 43);

                    refinedFeatures.push({
                        type: "Feature",
                        // Link Mainland and Corsica, separate others (Guiana, etc.)
                        id: (isMainland || isCorsica) ? '250' : `999-${index}`,
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
                    const countryName = countryNameLookup[id];
                    const countryCode = flagCodesLookup[id];

                    // Maintains original modernist shadow box structure by wrapping elements safely inside
                    let tooltipHtml = `<div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">`;
                    tooltipHtml += `<div>${countryName}</div>`;
                    
                    if (countryCode) {
                        tooltipHtml += `<img src="https://flagcdn.com/w40/${countryCode}.png" style="display: block; width: 30px; height: auto; border-radius: 1px; border: 1px solid rgba(255,255,255,0.15);" alt="${countryName} flag">`;
                    }
                    tooltipHtml += `</div>`;

                    // Keep your original CSS display properties by resetting to block if flex broke it
                    tag.style("display", "block").html(tooltipHtml);
                    
                    // HIGHLIGHT ALL PIECES OF THIS COUNTRY
                    svg.selectAll("path")
                       .filter(node => String(node.id).padStart(3, '0') === id)
                       .style("fill", hoverColor)
                       .style("stroke", "#ffffff")
                       .style("stroke-width", "2px");
                }
            })
            .on("mousemove", event => {
                // Adjust vertical offset (-65) slightly to account for the flag height so it doesn't clip the cursor
                tag.style("top", (event.pageY - 65) + "px").style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function(event, d) {
                const id = String(d.id).padStart(3, '0');
                tag.style("display", "none");
                d3.select(this).style("cursor", "default");

                if (id !== '010' && interactiveCountries.includes(id)) {
                    // RESET ALL PIECES OF THIS COUNTRY
                    svg.selectAll("path")
                       .filter(node => String(node.id).padStart(3, '0') === id)
                       .style("fill", interactiveColor)
                       .style("stroke", "white")
                       .style("stroke-width", "0.5px");
                }
            })
            .on("click", (event, d) => {
                const id = String(d.id).padStart(3, '0');
                if (!interactiveCountries.includes(id)) return;
                window.location.href = id === '010' ? `Antarctica.html` : `${countryNameLookup[id]}.html`;
            });

        /* ======================================================================
           3. CITY DOTS (With High-Contrast Halo)
           ====================================================================== */
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
            .attr("stroke-width", 3)   
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                const cityName = d.name.replace('_', ' ');
                tag.style("display", "block").html(`<div>${cityName}</div>`);

                d3.select(this).transition().duration(200)
                    .attr("r", 9)
                    .attr("fill", hoverColor)
                    .attr("stroke", "#000000") 
                    .attr("stroke-width", 2);
            })
            .on("mousemove", event => {
                tag.style("top", (event.pageY - 45) + "px").style("left", (event.pageX + 15) + "px");
            })
            .on("mouseout", function() {
                tag.style("display", "none");
                d3.select(this).transition().duration(200)
                    .attr("r", 6.5)
                    .attr("fill", cityDefaultColor)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 3);
            })
            .on("click", (event, d) => { window.location.href = `${d.name}.html`; });
    });
}