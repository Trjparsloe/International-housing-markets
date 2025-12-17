/* ======================================================================
   1. CONFIGURATION AND SETUP (D3 MAP)
   ====================================================================== */

const width = 1000;
const height = 600;

// Lookup table to map the 3-letter GeoJSON code (ADM0_A3) to your HTML file name.
const countryNameLookup = {
    'FRA': 'France',
    'DEU': 'Berlin',
    'JPN': 'Japan',
    'KOR': 'Korea',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'OMN': 'Oman',
    'ATA': 'Antarctica'
};

// Controls coloring and interaction.
const interactiveCountries = ['FRA', 'DEU', 'JPN', 'KOR', 'ITA', 'ESP', 'OMN', 'ATA'];

// Custom colors for the map
const interactiveColor = '#f97316'; // Orange
const defaultColor = '#d1d5db';     // Gray
const hoverColor = '#facc15';       // Yellow

// Select the SVG element
const svg = d3.select("#map-container")
    .attr("width", width)
    .attr("height", height);

// Define the map projection
const projection = d3.geoMercator()
    .scale(150)           
    .center([0, 20])      
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);


/* ======================================================================
   2. DATA LOADING AND MAP INTERACTIONS
   ====================================================================== */

d3.json("./world.json").then(function(data) {
    
    svg.append("g")
        .selectAll("path")
        .data(data.features) 
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("class", "country") 
        .attr("id", d => d.properties.adm0_a3)

        // Coloring Logic
        .style("fill", function(d) {
            const countryId = d.properties.adm0_a3; 
            if (interactiveCountries.includes(countryId)) {
                return interactiveColor;
            }
            return defaultColor;
        })

        // Hover Handlers
        .on("mouseover", function(event, d) {
            const countryId = d.properties.adm0_a3;
            if (!interactiveCountries.includes(countryId)) return; 

            d3.select(this)
              .attr("original-fill", d3.select(this).style("fill"))
              .style("fill", hoverColor)
              .style("stroke", "black")
              .style("stroke-width", "2px")
              .style("cursor", "pointer"); 
        })
        .on("mouseout", function(event, d) {
            const countryId = d.properties.adm0_a3;
            if (!interactiveCountries.includes(countryId)) return;
            
            d3.select(this)
              .style("fill", d3.select(this).attr("original-fill")) 
              .style("stroke", "none")
              .style("stroke-width", "0px")
              .style("cursor", "default");
        })

        // Click Handler (Redirection)
        .on("click", function(event, d) {
            const countryId = d.properties.adm0_a3;
            if (!interactiveCountries.includes(countryId)) return; 
            
            const fileName = countryNameLookup[countryId];
            if (fileName) {
                 window.location.href = `/${fileName}.html`;
            } else {
                 console.error(`Missing file name lookup for: ${countryId}`);
            }
        });
});

/* ======================================================================
   3. SHUFFLED SEQUENTIAL CAROUSEL (IMPROVED RANDOM START)
   ====================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel__track');
    if (!track) return;

    let slides = Array.from(track.children);
    const intervalTime = 4000;
    let currentSlideIndex = 0;

    // 1. Shuffle Function
    const shuffleSlides = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // 2. Perform Shuffle
    slides = shuffleSlides(slides);

    // 3. RE-ORDER THE DOM: This physically moves the <li> elements in your HTML
    // to match the new shuffled order. This prevents the "flash" of the original first image.
    slides.forEach(slide => {
        slide.classList.remove('current-slide'); // Clean slate
        track.appendChild(slide); // Moves the element to the end of the list in new order
    });

    // 4. Set the new first image as visible
    slides[0].classList.add('current-slide');

    const moveToNextSlide = () => {
        const currentSlide = slides[currentSlideIndex];
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        const nextSlide = slides[currentSlideIndex];

        currentSlide.classList.remove('current-slide');
        nextSlide.classList.add('current-slide');
    };

    setInterval(moveToNextSlide, intervalTime);
});