/* ======================================================================
   1. CONFIGURATION (CINEMATIC RESPONSIVE SETUP)
   ====================================================================== */
const width = 1200;  // Internal coordinate system
const height = 700;

const countryNameLookup = {
    '250': 'France',
    '392': 'Japan',
    '410': 'Korea',
    '380': 'Italy',
    '724': 'Spain',
    '512': 'Oman',
    '010': 'Antarctica'
};

const interactiveCountries = Object.keys(countryNameLookup);

// Cities list
const cityMarkets = [
    { id: 'HKG', name: 'Hong_Kong', coords: [114.1694, 22.3193] },
    { id: 'BER', name: 'Berlin', coords: [13.4050, 52.5200] }
];

const interactiveColor = '#f97316'; 
const cityDefaultColor = "#2dd4bf"; // Bright Architectural Teal
const defaultColor = '#d1d5db';     
const hoverColor = '#facc15';       

const svg = d3.select("#map-container");

const projection = d3.geoNaturalEarth1()
    .scale(215) 
    .translate([width / 2, 380]); // Pushed down to 380 to keep Antarctica in frame

const path = d3.geoPath().projection(projection);

/* ======================================================================
   2. DRAWING THE MAP
   ====================================================================== */
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function(topoData) {
    
    const tag = d3.select("#country-tag");
    const countries = topojson.feature(topoData, topoData.objects.countries);

    // --- LAYER 1: COUNTRIES ---
    svg.append("g")
        .selectAll("path")
        .data(countries.features) 
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("class", "country") 
        .style("fill", d => {
            const id = String(d.id).padStart(3, '0');
            if (id === '010') return defaultColor; // Antarctica hidden
            return interactiveCountries.includes(id) ? interactiveColor : defaultColor;
        })
        .on("mouseover", function(event, d) {
            const id = String(d.id).padStart(3, '0');
            if (!interactiveCountries.includes(id)) return;
            
            d3.select(this).style("cursor", "pointer");

            if (id !== '010') {
                tag.style("display", "block").text(countryNameLookup[id]);
                d3.select(this)
                  .style("fill", hoverColor)
                  .style("stroke", "#000")
                  .style("stroke-width", "1.5px");
            }
        })
        .on("mousemove", event => {
            // Updated tag positioning for wider layouts
            tag.style("top", (event.pageY - 45) + "px").style("left", (event.pageX + 15) + "px");
        })
        .on("mouseout", function(event, d) {
            const id = String(d.id).padStart(3, '0');
            if (!interactiveCountries.includes(id)) return;

            tag.style("display", "none");
            if (id !== '010') {
                d3.select(this)
                  .style("fill", interactiveColor)
                  .style("stroke", "white") // Matches CSS default
                  .style("stroke-width", "0.5px");
            }
            d3.select(this).style("cursor", "default");
        })
        .on("click", (event, d) => {
            const id = String(d.id).padStart(3, '0');
            if (interactiveCountries.includes(id)) window.location.href = `/${countryNameLookup[id]}.html`;
        });

    // --- LAYER 2: CITIES ---
    svg.append("g")
        .selectAll("circle")
        .data(cityMarkets)
        .enter()
        .append("circle")
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("r", 6.5) // Slightly larger for the bigger map
        .attr("fill", cityDefaultColor) 
        .attr("stroke", "#ffffff")        
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            tag.style("display", "block").text(d.name.replace('_', ' '));
            d3.select(this)
              .transition().duration(200)
              .attr("r", 9)
              .attr("fill", hoverColor)
              .attr("stroke", "#000");
        })
        .on("mousemove", event => {
            tag.style("top", (event.pageY - 45) + "px").style("left", (event.pageX + 15) + "px");
        })
        .on("mouseout", function() {
            tag.style("display", "none");
            d3.select(this)
              .transition().duration(200)
              .attr("r", 6.5)
              .attr("fill", cityDefaultColor)
              .attr("stroke", "#ffffff");
        })
        .on("click", (event, d) => { window.location.href = `/${d.name}.html`; });

}); 

/* ======================================================================
   3. SHUFFLED SEQUENTIAL CAROUSEL
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel__track');
    if (!track) return;

    let slides = Array.from(track.children);
    const intervalTime = 4000;
    let currentSlideIndex = 0;

    const shuffleSlides = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    slides = shuffleSlides(slides);
    slides.forEach(slide => {
        slide.classList.remove('current-slide');
        track.appendChild(slide);
    });

    if(slides.length > 0) slides[0].classList.add('current-slide');

    const moveToNextSlide = () => {
        const currentSlide = slides[currentSlideIndex];
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        const nextSlide = slides[currentSlideIndex];

        currentSlide.classList.remove('current-slide');
        nextSlide.classList.add('current-slide');
    };

    setInterval(moveToNextSlide, intervalTime);
});