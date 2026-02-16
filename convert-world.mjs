import { readFileSync, writeFileSync } from 'fs';
import { geoPath, geoEquirectangular } from 'd3-geo';
import * as topojson from 'topojson-client';

const topo = JSON.parse(readFileSync('/tmp/world-110m.json', 'utf8'));
const geo = topojson.feature(topo, topo.objects.countries);

const projection = geoEquirectangular()
  .scale(160)
  .translate([500, 280]);

const pathGen = geoPath().projection(projection);

// ISO 3166-1 numeric -> country name (comprehensive)
const isoNames = {
  '004':'Afghanistan','008':'Albania','012':'Algeria','016':'American Samoa',
  '020':'Andorra','024':'Angola','028':'Antigua and Barbuda','031':'Azerbaijan',
  '032':'Argentina','036':'Australia','040':'Austria','044':'Bahamas',
  '048':'Bahrain','050':'Bangladesh','051':'Armenia','052':'Barbados',
  '056':'Belgium','060':'Bermuda','064':'Bhutan','068':'Bolivia',
  '070':'Bosnia and Herzegovina','072':'Botswana','076':'Brazil','084':'Belize',
  '090':'Solomon Islands','092':'British Virgin Islands','096':'Brunei',
  '100':'Bulgaria','104':'Myanmar','108':'Burundi','112':'Belarus',
  '116':'Cambodia','120':'Cameroon','124':'Canada','132':'Cape Verde',
  '140':'Central African Republic','144':'Sri Lanka','148':'Chad','152':'Chile',
  '156':'China','158':'Taiwan','162':'Christmas Island','170':'Colombia',
  '174':'Comoros','175':'Mayotte','178':'Congo','180':'DR Congo',
  '188':'Costa Rica','191':'Croatia','192':'Cuba','196':'Cyprus',
  '203':'Czech Republic','204':'Benin','208':'Denmark','212':'Dominica',
  '214':'Dominican Republic','218':'Ecuador','222':'El Salvador',
  '226':'Equatorial Guinea','231':'Ethiopia','232':'Eritrea','233':'Estonia',
  '234':'Faroe Islands','238':'Falkland Islands','242':'Fiji','246':'Finland',
  '250':'France','258':'French Polynesia','260':'French Southern Territories',
  '262':'Djibouti','266':'Gabon','268':'Georgia','270':'Gambia',
  '275':'Palestine','276':'Germany','288':'Ghana','292':'Gibraltar',
  '296':'Kiribati','300':'Greece','304':'Greenland','308':'Grenada',
  '312':'Guadeloupe','316':'Guam','320':'Guatemala','324':'Guinea',
  '328':'Guyana','332':'Haiti','336':'Vatican City','340':'Honduras',
  '344':'Hong Kong','348':'Hungary','352':'Iceland','356':'India',
  '360':'Indonesia','364':'Iran','368':'Iraq','372':'Ireland',
  '376':'Israel','380':'Italy','384':'Ivory Coast','388':'Jamaica',
  '392':'Japan','398':'Kazakhstan','400':'Jordan','404':'Kenya',
  '408':'North Korea','410':'South Korea','414':'Kuwait','417':'Kyrgyzstan',
  '418':'Laos','422':'Lebanon','426':'Lesotho','428':'Latvia',
  '430':'Liberia','434':'Libya','438':'Liechtenstein','440':'Lithuania',
  '442':'Luxembourg','446':'Macau','450':'Madagascar','454':'Malawi',
  '458':'Malaysia','462':'Maldives','466':'Mali','470':'Malta',
  '474':'Martinique','478':'Mauritania','480':'Mauritius','484':'Mexico',
  '492':'Monaco','496':'Mongolia','498':'Moldova','499':'Montenegro',
  '500':'Montserrat','504':'Morocco','508':'Mozambique','512':'Oman',
  '516':'Namibia','520':'Nauru','524':'Nepal','528':'Netherlands',
  '531':'Curacao','533':'Aruba','540':'New Caledonia','548':'Vanuatu',
  '554':'New Zealand','558':'Nicaragua','562':'Niger','566':'Nigeria',
  '570':'Niue','574':'Norfolk Island','578':'Norway','580':'Northern Mariana Islands',
  '583':'Micronesia','584':'Marshall Islands','585':'Palau','586':'Pakistan',
  '591':'Panama','598':'Papua New Guinea','600':'Paraguay','604':'Peru',
  '608':'Philippines','612':'Pitcairn Islands','616':'Poland','620':'Portugal',
  '624':'Guinea-Bissau','626':'Timor-Leste','630':'Puerto Rico',
  '634':'Qatar','638':'Reunion','642':'Romania','643':'Russia',
  '646':'Rwanda','654':'Saint Helena','659':'Saint Kitts and Nevis',
  '660':'Anguilla','662':'Saint Lucia','666':'Saint Pierre and Miquelon',
  '670':'Saint Vincent and the Grenadines','674':'San Marino',
  '678':'Sao Tome and Principe','682':'Saudi Arabia','686':'Senegal',
  '688':'Serbia','694':'Sierra Leone','702':'Singapore','703':'Slovakia',
  '704':'Vietnam','705':'Slovenia','706':'Somalia','710':'South Africa',
  '716':'Zimbabwe','724':'Spain','728':'South Sudan','729':'Sudan',
  '732':'Western Sahara','740':'Suriname','748':'Eswatini','752':'Sweden',
  '756':'Switzerland','760':'Syria','762':'Tajikistan','764':'Thailand',
  '768':'Togo','776':'Tonga','780':'Trinidad and Tobago',
  '784':'United Arab Emirates','788':'Tunisia','792':'Turkey',
  '795':'Turkmenistan','798':'Tuvalu','800':'Uganda','804':'Ukraine',
  '807':'North Macedonia','818':'Egypt','826':'United Kingdom',
  '834':'Tanzania','840':'United States','854':'Burkina Faso',
  '858':'Uruguay','860':'Uzbekistan','862':'Venezuela','876':'Wallis and Futuna',
  '882':'Samoa','887':'Yemen','894':'Zambia',
  '010':'Antarctica','-99':'Northern Cyprus','536':'Undetermined',
};

// Fun facts for well-known countries (fallback for others)
const funFacts = {
  'United States': 'The United States has 50 states and is home to the Grand Canyon!',
  'Canada': 'Canada has more lakes than all other countries combined!',
  'Mexico': 'Mexico invented chocolate — the ancient Aztecs drank it as a spicy drink!',
  'Brazil': 'Brazil is home to the Amazon River, which carries more water than any other river!',
  'Argentina': 'Argentina is famous for the tango dance and huge grasslands called the Pampas!',
  'United Kingdom': 'The United Kingdom includes England, Scotland, Wales, and Northern Ireland!',
  'France': 'France is famous for the Eiffel Tower and delicious croissants!',
  'Germany': 'Germany is where the gummy bear was invented in 1922!',
  'Spain': 'Spain has a tomato-throwing festival called La Tomatina!',
  'Italy': 'Italy is shaped like a boot and is where pizza was invented!',
  'Russia': 'Russia is the biggest country in the world — it spans 11 time zones!',
  'China': 'China built the Great Wall, which is over 13,000 miles long!',
  'Japan': 'Japan has more than 6,800 islands and super-fast bullet trains!',
  'India': 'India invented the number zero and makes the most movies every year!',
  'Egypt': 'Egypt is famous for the pyramids — the Great Pyramid has over 2 million stone blocks!',
  'South Africa': 'South Africa has three capital cities and penguins on its beaches!',
  'Australia': 'Australia has animals found nowhere else, like kangaroos and platypuses!',
  'Saudi Arabia': 'Saudi Arabia is mostly desert and turns ocean water into drinking water!',
  'Colombia': 'Colombia produces the most emeralds in the world!',
  'Peru': 'Peru is home to Machu Picchu, an ancient city high in the mountains!',
  'Chile': 'Chile is the longest country in the world from north to south!',
  'Venezuela': 'Venezuela has the tallest waterfall in the world — Angel Falls!',
  'Nigeria': 'Nigeria has over 500 different languages spoken!',
  'Kenya': 'Kenya is famous for safaris where you can see lions, elephants, and giraffes!',
  'Tanzania': 'Mount Kilimanjaro, the tallest mountain in Africa, is in Tanzania!',
  'Ethiopia': 'Ethiopia is where coffee was first discovered!',
  'Morocco': 'Morocco is in Africa but is only 9 miles from Europe across the sea!',
  'DR Congo': 'The Congo has the second largest rainforest in the world!',
  'Madagascar': 'Most animals on Madagascar are found nowhere else on Earth!',
  'Algeria': 'Algeria is the largest country in Africa!',
  'Libya': 'The Sahara Desert covers most of Libya!',
  'Sudan': 'Sudan has more pyramids than Egypt!',
  'South Korea': 'South Korea invented the metal printing press before Europe!',
  'North Korea': 'North Korea and South Korea are still technically at war since 1950!',
  'Indonesia': 'Indonesia has over 17,000 islands — more than any country!',
  'Thailand': 'Thailand is the only Southeast Asian country never colonized by Europeans!',
  'Vietnam': 'Vietnam is the largest exporter of black pepper in the world!',
  'Philippines': 'The Philippines has over 7,600 islands!',
  'Pakistan': 'Pakistan has the second tallest mountain in the world — K2!',
  'Afghanistan': 'Afghanistan is one of the oldest countries with over 5,000 years of history!',
  'Iran': 'Iran was once called Persia and has a history going back thousands of years!',
  'Iraq': 'Iraq is called the Cradle of Civilization — writing was invented there!',
  'Turkey': 'Turkey sits on two continents — Europe and Asia!',
  'Greece': 'Greece is where the Olympic Games were invented over 2,700 years ago!',
  'Poland': 'Poland is home to the largest castle in the world — Malbork Castle!',
  'Ukraine': 'Ukraine is the largest country entirely in Europe!',
  'Sweden': 'Sweden invented dynamite, the zipper, and Spotify!',
  'Norway': 'Norway has fjords — deep valleys filled with ocean water!',
  'Finland': 'Finland has more saunas than cars!',
  'Iceland': 'Iceland has geysers that shoot hot water high into the air!',
  'Ireland': 'Ireland is called the Emerald Isle because it is so green!',
  'Portugal': 'Portuguese explorers were the first Europeans to reach Japan!',
  'Switzerland': 'Switzerland makes the best chocolate and cheese!',
  'Austria': 'Mozart, one of the greatest musicians ever, was born in Austria!',
  'Romania': 'Romania is home to the legend of Dracula!',
  'Hungary': 'Hungary invented the Rubik\'s Cube!',
  'Mongolia': 'Mongolia has more horses than people!',
  'Kazakhstan': 'Kazakhstan is the largest landlocked country in the world!',
  'Nepal': 'Nepal has Mount Everest, the tallest mountain on Earth!',
  'Myanmar': 'Myanmar has over 2,000 pagodas in the city of Bagan!',
  'Cuba': 'Cuba is the largest island in the Caribbean!',
  'New Zealand': 'New Zealand was the first country to give women the right to vote!',
  'Papua New Guinea': 'Papua New Guinea has over 800 languages — more than any country!',
  'Greenland': 'Greenland is the largest island in the world but is mostly covered in ice!',
  'Antarctica': 'Antarctica is the coldest place on Earth — no country owns it!',
};

function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// Skip very small island nations that won't render visibly
const skipCodes = new Set([
  '016','020','028','044','048','052','060','090','092','096',
  '132','162','174','175','196','212','234','258','260','270',
  '292','296','308','312','316','336','344','388','414','438',
  '442','446','462','470','474','480','492','500','520','531',
  '533','540','548','554','570','574','580','583','584','585',
  '612','626','630','634','638','654','659','660','662','666',
  '670','674','678','694','702','748','776','780','784','795',
  '798','876','882','-99','536',
]);

const results = [];

for (const f of geo.features) {
  const code = f.id;
  const name = isoNames[code];
  if (!name || skipCodes.has(code)) continue;

  const d = pathGen(f);
  if (!d) continue;

  const centroid = pathGen.centroid(f);
  if (!centroid || isNaN(centroid[0])) continue;

  // Skip if too small to be meaningful (area < 20 sq pixels)
  const area = pathGen.area(f);
  if (area < 20) continue;

  const id = toId(name);
  const fact = funFacts[name] || `${name} is a country with its own unique culture and history!`;

  results.push({
    id,
    name,
    path: d,
    labelX: Math.round(centroid[0]),
    labelY: Math.round(centroid[1]),
    funFact: fact,
  });
}

console.log('Total countries:', results.length);
console.log('Total path bytes:', results.reduce((s, r) => s + r.path.length, 0));

// Generate TypeScript
let ts = `import type { MapRegion, MapData } from './types';

const regions: MapRegion[] = [\n`;

for (const r of results) {
  ts += `  {\n`;
  ts += `    id: '${r.id}',\n`;
  ts += `    name: '${r.name}',\n`;
  ts += `    path: '${r.path}',\n`;
  ts += `    labelX: ${r.labelX},\n`;
  ts += `    labelY: ${r.labelY},\n`;
  ts += `    funFact: '${r.funFact.replace(/'/g, "\\'")}',\n`;
  ts += `  },\n`;
}

ts += `];

export const WORLD_MAP: MapData = {
  id: 'world',
  name: 'World',
  viewBox: '0 0 1000 560',
  regions,
};

export function getWorldRegions(): MapRegion[] {
  return regions;
}
`;

writeFileSync('/Users/ayemane/dev/LaylaWorld/src/mapexplorer/maps/world.ts', ts);
console.log('Written world.ts');
