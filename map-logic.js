// --- 1. Configuration and Setup ---

const width = 1000;
const height = 600;

// NEW SIMPLIFIED LIST: This list now represents ALL countries that are both visited 
// AND have a dedicated page (e.g., GBR, JPN, GER). 
// These countries will be the only ones colored and interactive.
// CRITICAL: Update this list with the 3-letter codes from your GeoJSON!
const interactiveCountries = ['FRA', 'DEU', 'JPN', 'KOR', 'ITA', 'ESP', 'OMN']; // EXAMPLE LIST - UPDATE WITH YOUR COUNTRIES!

// Define custom colors for the map
// We are only using ONE color now for the interactive countries.
const interactiveColor = '#3b82f6'; // Blue (using the page color, but feel free to change)
const defaultColor = '#d1d5db';    // Gray for non-interactive
const hoverColor = '#facc15';      // Yellow for hover highlight

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
            
            // Check if the country is in our single list
            if (interactiveCountries.includes(countryId)) {
                return interactiveColor; // Blue (or whatever color you choose)
            }
            
            // Default (GRAY)
            return defaultColor;
        })

        // --- Interaction Handlers (Hover and Click use the same list) ---
        .on("mouseover", function(event, d) {
            const countryId = d.properties.adm0_a3;
            
            // Exit if not an interactive country
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

            // Exit if not an interactive country
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
            
            const countryName = countryId.toLowerCase();
            window.location.href = `/${countryName}.html`;
        });
});