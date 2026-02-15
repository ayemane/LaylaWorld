import { MapRegion, MapData } from './types';

// ============================================================
// World Map SVG Data
// Simplified polygons in a 1000x500 equirectangular-like projection
// X: 0 (180W) -> 1000 (180E),  Y: 0 (90N) -> 500 (90S)
// ============================================================

// --- Continents ---

const northAmerica: MapRegion = {
  id: 'north-america',
  name: 'North America',
  path: 'M 50,40 L 180,30 L 250,50 L 270,100 L 260,140 L 230,180 L 200,200 L 170,230 L 140,250 L 120,240 L 80,200 L 50,160 L 30,120 L 30,80 Z',
  labelX: 155,
  labelY: 130,
  funFact: 'North America has every type of climate, from frozen tundra to tropical beaches!',
};

const southAmerica: MapRegion = {
  id: 'south-america',
  name: 'South America',
  path: 'M 190,260 L 230,250 L 260,260 L 280,290 L 290,330 L 280,370 L 260,400 L 240,430 L 220,450 L 200,440 L 190,400 L 180,360 L 175,320 L 180,280 Z',
  labelX: 230,
  labelY: 340,
  funFact: 'South America is home to the Amazon Rainforest, which makes about 20% of the world\'s oxygen!',
};

const europe: MapRegion = {
  id: 'europe',
  name: 'Europe',
  path: 'M 430,40 L 480,35 L 530,50 L 560,70 L 550,100 L 530,120 L 510,140 L 480,150 L 450,140 L 430,120 L 420,90 L 420,60 Z',
  labelX: 480,
  labelY: 90,
  funFact: 'Europe has over 200 languages spoken across its many countries!',
};

const africa: MapRegion = {
  id: 'africa',
  name: 'Africa',
  path: 'M 430,160 L 470,150 L 520,160 L 550,190 L 560,230 L 560,270 L 550,310 L 530,350 L 510,380 L 490,390 L 470,380 L 450,350 L 440,310 L 430,270 L 420,230 L 420,190 Z',
  labelX: 490,
  labelY: 270,
  funFact: 'Africa is home to the Sahara Desert, the largest hot desert in the world!',
};

const asia: MapRegion = {
  id: 'asia',
  name: 'Asia',
  path: 'M 560,30 L 640,25 L 720,30 L 800,50 L 840,80 L 850,120 L 840,160 L 810,200 L 770,220 L 720,230 L 670,220 L 620,200 L 580,170 L 560,140 L 550,100 L 550,60 Z',
  labelX: 700,
  labelY: 120,
  funFact: 'Asia is the biggest continent and more than half the people on Earth live there!',
};

const australiaOceania: MapRegion = {
  id: 'australia-oceania',
  name: 'Australia/Oceania',
  path: 'M 780,300 L 830,290 L 880,300 L 900,330 L 890,360 L 870,380 L 840,390 L 810,380 L 790,360 L 780,330 Z',
  labelX: 840,
  labelY: 340,
  funFact: 'Australia is the only continent that is also a single country!',
};

const antarctica: MapRegion = {
  id: 'antarctica',
  name: 'Antarctica',
  path: 'M 200,470 L 350,460 L 500,465 L 650,460 L 800,470 L 820,485 L 700,495 L 500,498 L 300,495 L 180,485 Z',
  labelX: 500,
  labelY: 480,
  funFact: 'Antarctica is the coldest place on Earth — it can get as cold as -128 degrees Fahrenheit!',
};

// --- Countries ---

const unitedStates: MapRegion = {
  id: 'united-states',
  name: 'United States',
  path: 'M 70,110 L 120,105 L 175,110 L 200,120 L 210,140 L 195,155 L 170,165 L 130,170 L 100,165 L 75,150 L 65,135 Z',
  labelX: 140,
  labelY: 138,
  funFact: 'The United States has 50 states, and Alaska is so big it could fit Texas inside it twice!',
};

const canada: MapRegion = {
  id: 'canada',
  name: 'Canada',
  path: 'M 60,50 L 120,42 L 190,45 L 240,55 L 250,75 L 230,95 L 190,105 L 140,105 L 90,100 L 60,85 L 50,65 Z',
  labelX: 150,
  labelY: 75,
  funFact: 'Canada has more lakes than all other countries combined!',
};

const mexico: MapRegion = {
  id: 'mexico',
  name: 'Mexico',
  path: 'M 90,175 L 130,170 L 165,175 L 180,190 L 170,210 L 150,225 L 130,235 L 110,225 L 95,210 L 85,195 Z',
  labelX: 135,
  labelY: 200,
  funFact: 'Mexico invented chocolate — the ancient Aztecs drank it as a spicy drink!',
};

const brazil: MapRegion = {
  id: 'brazil',
  name: 'Brazil',
  path: 'M 210,275 L 250,265 L 275,280 L 280,310 L 270,340 L 255,365 L 235,375 L 215,365 L 200,340 L 195,310 L 200,285 Z',
  labelX: 238,
  labelY: 320,
  funFact: 'Brazil is home to the Amazon River, which carries more water than any other river on Earth!',
};

const argentina: MapRegion = {
  id: 'argentina',
  name: 'Argentina',
  path: 'M 215,380 L 240,375 L 255,390 L 250,415 L 240,435 L 225,445 L 210,435 L 200,415 L 205,395 Z',
  labelX: 228,
  labelY: 410,
  funFact: 'Argentina is famous for the tango dance and has huge grasslands called the Pampas!',
};

const unitedKingdom: MapRegion = {
  id: 'united-kingdom',
  name: 'United Kingdom',
  path: 'M 435,62 L 445,58 L 452,62 L 453,72 L 450,82 L 443,85 L 436,80 L 433,72 Z',
  labelX: 443,
  labelY: 72,
  funFact: 'The United Kingdom includes England, Scotland, Wales, and Northern Ireland!',
};

const france: MapRegion = {
  id: 'france',
  name: 'France',
  path: 'M 440,95 L 460,90 L 475,95 L 480,110 L 475,120 L 460,125 L 445,120 L 438,110 Z',
  labelX: 460,
  labelY: 108,
  funFact: 'France is famous for the Eiffel Tower, and French people eat about 30,000 tons of snails every year!',
};

const germany: MapRegion = {
  id: 'germany',
  name: 'Germany',
  path: 'M 475,75 L 495,72 L 508,78 L 510,92 L 505,105 L 492,108 L 480,103 L 473,90 Z',
  labelX: 492,
  labelY: 90,
  funFact: 'Germany is where the gummy bear was invented in 1922!',
};

const spain: MapRegion = {
  id: 'spain',
  name: 'Spain',
  path: 'M 425,118 L 450,115 L 468,120 L 470,135 L 460,145 L 440,148 L 425,142 L 420,130 Z',
  labelX: 445,
  labelY: 132,
  funFact: 'Spain has a tomato-throwing festival called La Tomatina where people throw tomatoes at each other!',
};

const italy: MapRegion = {
  id: 'italy',
  name: 'Italy',
  path: 'M 490,110 L 500,108 L 508,115 L 512,130 L 508,145 L 500,155 L 493,150 L 488,135 L 487,120 Z',
  labelX: 500,
  labelY: 130,
  funFact: 'Italy is shaped like a boot and is where pizza was invented!',
};

const russia: MapRegion = {
  id: 'russia',
  name: 'Russia',
  path: 'M 530,30 L 600,25 L 700,28 L 790,35 L 830,50 L 840,70 L 820,85 L 770,90 L 700,85 L 630,80 L 570,70 L 540,55 Z',
  labelX: 680,
  labelY: 55,
  funFact: 'Russia is the biggest country in the world — it spans 11 time zones!',
};

const china: MapRegion = {
  id: 'china',
  name: 'China',
  path: 'M 690,110 L 740,105 L 780,115 L 800,135 L 795,160 L 775,175 L 745,180 L 715,175 L 695,155 L 685,135 Z',
  labelX: 742,
  labelY: 145,
  funFact: 'China built the Great Wall, which is so long it would stretch from New York to Los Angeles and back!',
};

const japan: MapRegion = {
  id: 'japan',
  name: 'Japan',
  path: 'M 825,105 L 835,100 L 843,105 L 845,118 L 840,132 L 833,138 L 825,132 L 822,118 Z',
  labelX: 833,
  labelY: 118,
  funFact: 'Japan has more than 6,800 islands and is home to super-fast bullet trains!',
};

const india: MapRegion = {
  id: 'india',
  name: 'India',
  path: 'M 660,160 L 690,155 L 710,165 L 715,185 L 705,210 L 690,225 L 670,220 L 655,205 L 650,185 Z',
  labelX: 682,
  labelY: 190,
  funFact: 'India has the most movies made every year and invented the number zero!',
};

const egypt: MapRegion = {
  id: 'egypt',
  name: 'Egypt',
  path: 'M 490,155 L 515,152 L 530,160 L 532,178 L 522,190 L 505,192 L 492,185 L 488,170 Z',
  labelX: 510,
  labelY: 172,
  funFact: 'Egypt is famous for its pyramids — the Great Pyramid is made of over 2 million stone blocks!',
};

const southAfrica: MapRegion = {
  id: 'south-africa',
  name: 'South Africa',
  path: 'M 475,350 L 505,345 L 525,355 L 528,370 L 518,382 L 500,388 L 480,382 L 472,368 Z',
  labelX: 500,
  labelY: 367,
  funFact: 'South Africa has three capital cities and is home to penguins on its beaches!',
};

const australia: MapRegion = {
  id: 'australia',
  name: 'Australia',
  path: 'M 790,305 L 830,295 L 870,305 L 890,325 L 885,350 L 865,370 L 840,378 L 815,372 L 795,355 L 785,332 Z',
  labelX: 838,
  labelY: 338,
  funFact: 'Australia has animals found nowhere else on Earth, like kangaroos and platypuses!',
};

const saudiArabia: MapRegion = {
  id: 'saudi-arabia',
  name: 'Saudi Arabia',
  path: 'M 560,155 L 590,150 L 615,158 L 620,175 L 610,192 L 590,198 L 570,192 L 558,178 Z',
  labelX: 588,
  labelY: 175,
  funFact: 'Saudi Arabia is mostly desert and has no rivers — but it turns ocean water into drinking water!',
};

// --- Assemble all regions ---

const allRegions: MapRegion[] = [
  // Continents
  northAmerica,
  southAmerica,
  europe,
  africa,
  asia,
  australiaOceania,
  antarctica,
  // Countries
  unitedStates,
  canada,
  mexico,
  brazil,
  argentina,
  unitedKingdom,
  france,
  germany,
  spain,
  italy,
  russia,
  china,
  japan,
  india,
  egypt,
  southAfrica,
  australia,
  saudiArabia,
];

export const WORLD_MAP: MapData = {
  id: 'world',
  name: 'World',
  viewBox: '0 0 1000 500',
  regions: allRegions,
};

export function getWorldRegions(): MapRegion[] {
  return allRegions;
}
