// --- 1. Configuration and Setup ---

const width = 1000;
const height = 600;

// IMPORTANT: Update this list with the exact country codes/names found in your GeoJSON!
const visitedCountries = ['USA', 'CAN', 'GBR', 'FRA']; 

// Define custom colors for the map
const visitedColor = '#10b981';   // Green for visited
const defaultColor = '#d1d5db';   // Gray for unvisited
const hoverColor = '#facc15';     // Yellow for hover highlight

// Select the SVG element defined in your HTML
const svg = d3.select("#map-container")
    .attr("width", width)
    .attr("height", height);

// Define the map projection (Mercator is standard for world maps)
const projection = d3.geoMercator()
    .scale(150)           // Adjusts the size of the map
    .center([0, 20])      // Centers the map around the prime meridian and equator
    .translate([width / 2, height / 2]); // Puts the map in the center of the SVG

// Creates the path generator, which converts GeoJSON coordinates into SVG 'd' attributes
const path = d3.geoPath().projection(projection);


// --- 2. DATA LOADING, DRAWING, AND INTERACTIONS ---

// **CORRECT PATH:** Loads 'world.json' from the root folder
d3.json("./world.json").then(function(data) {
    
    svg.append("g")
        .selectAll("path")
        .data(data.features) 
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("class", "country") 
        .attr("id", d => d.properties.name) 

        // --- Coloring Logic ---
        .style("fill", function(d) {
            const countryId = d.properties.name; 
            return visitedCountries.includes(countryId) ? visitedColor : defaultColor;
        })

        // --- Interaction Handlers (Hover and Click) ---
        .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("original-fill", d3.select(this).style("fill"))
              .style("fill", hoverColor); 
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
              .style("fill", d3.select(this).attr("original-fill")); 
        })
        .on("click", function(event, d) {
            const countryName = d.properties.name.toLowerCase();
            window.location.href = `/${countryName}.html`;
        });
});