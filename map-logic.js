// --- 1. Configuration and Setup ---

const width = 1000;
const height = 600;

// Lookup table to map the 3-letter GeoJSON code (ADM0_A3) to your HTML file name.
// The value must match the capitalized file name (e.g., 'Italy' for Italy.html).
const countryNameLookup = {
    'FRA': 'France',
    'DEU': 'Germany',
    'JPN': 'Japan',
    'KOR': 'Korea',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'OMN': 'Oman',
    'ATA': 'Antarctica'
    // ADD ALL YOUR PAGES HERE!
};

// NEW SIMPLIFIED LIST: This list controls ALL coloring and interaction.
// CRITICAL: Must use the 3-letter codes found in your GeoJSON.
const interactiveCountries = ['FRA', 'DEU', 'JPN', 'KOR', 'ITA', 'ESP', 'OMN', 'ATA'];

// Define custom colors for the map
const interactiveColor = '#f97316'; // Orange
const defaultColor = '#d1d5db';    // Gray
const hoverColor = '#facc15';      // Yellow

// Select the SVG element defined in your HTML
const svg = d3.select("#map-container")
    .attr("width", width)
    .attr("height", height);

// Define the map projection (Mercator is standard for world maps)
const projection = d3.geoMercator()
    .scale(150)           
    .center([0, 20])      
    .translate([width / 2, height / 2]);

// Creates the path generator
const path = d3.geoPath().projection(projection);


// --- 2. DATA LOADING, DRAWING, AND INTERACTIONS ---

// Correct path to load 'world.json' from the root folder
d3.json("./world.json").then(function(data) {
    
    svg.append("g")
        .selectAll("path")
        .data(data.features) 
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("class", "country") 
        .attr("id", d => d.properties.adm0_a3)

        // --- Coloring Logic (Single Check) ---
        .style("fill", function(d) {
            const countryId = d.properties.adm0_a3; 
            
            if (interactiveCountries.includes(countryId)) {
                return interactiveColor;
            }
            
            return defaultColor;
        })

        // --- Interaction Handlers (Hover and Click use the same list) ---
        .on("mouseover", function(event, d) {
            const countryId = d.properties.adm0_a3;
            
            if (!interactiveCountries.includes(countryId)) {
                return; 
            }

            d3.select(this)
              .attr("original-fill", d3.select(this).style("fill"))
              .style("fill", hoverColor)
              .style("stroke", "black")
              .style("stroke-width", "2px")
              .style("cursor", "pointer"); 
        })
        .on("mouseout", function(event, d) {
            const countryId = d.properties.adm0_a3;

            if (!interactiveCountries.includes(countryId)) {
                return;
            }
            
            d3.select(this)
              .style("fill", d3.select(this).attr("original-fill")) 
              .style("stroke", "none")
              .style("stroke-width", "0px")
              .style("cursor", "default");
        })

        // --- Interaction Handlers (Click) ---
        .on("click", function(event, d) {
            const countryId = d.properties.adm0_a3;
            
            // Exit if not an interactive country
            if (!interactiveCountries.includes(countryId)) {
                return; 
            }
            
            // NEW LOGIC: Use the lookup table to find the capitalized file name (e.g., 'Italy')
            const fileName = countryNameLookup[countryId];
            
            // Only redirect if a file name was found in the lookup table
            if (fileName) {
                 window.location.href = `/${fileName}.html`;
            } else {
                 // Optional: Log an error if a country is in the list but not in the lookup table
                 console.error(`Missing file name lookup for: ${countryId}`);
            }
        });
});