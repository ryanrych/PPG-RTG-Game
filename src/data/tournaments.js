// Real college golf tournament schedule, sourced from tournaments.csv.
// Embedded as raw CSV text so future season updates are a straight paste.
// "Host" is who runs the event, not the full field — the data doesn't give
// us real per-team schedules, so buildCollegeSchedule() (see
// collegeSeason.js) works with what's here: each team's own hosted event
// (if any), its conference championship, and a seeded-random sampling of
// the rest of the stroke-play calendar to fill out a season.
const TOURNAMENTS_CSV = `Id,Name,Location,Course,Format,Host
244551,Underclass Elite Showcase,"Silvis, IL",TPC at Deere Run - Silvis - IL,Stroke Play,
243253,NCAA DI Men's National Championship- Match Play,"Carlsbad, California",Omni La Costa RS - Carlsbad - California,Match Play,
243252,NCAA DI Men's National Championship- Stroke Play,"Carlsbad, California",Omni La Costa RS - Carlsbad - California,Stroke Play,
244773,NCAA DI Men's Championship - Top 8 Playoff,"Carlsbad, California",Omni La Costa RS - Carlsbad - California,Stroke Play,
238601,Golfweek National Golf Invitational,"Maricopa, Arizona",Southern Dunes GC - Maricopa - Arizona,Stroke Play,
243254,NCAA Winston-Salem Regional,"Bermuda Run, NC",Bermuda Run CC - Bermuda Run - NC,Stroke Play,
243255,NCAA Marana Regional,"Marana, Arizona",The Gallery GC - Marana - Arizona,Stroke Play,
243258,NCAA Columbus Regional,"Columbus, Ohio",Ohio State University GC - Columbus - Ohio,Stroke Play,
243259,NCAA Bryan Regional,"Bryan, Texas",Traditions Club at Texas A&M - Bryan - Texas,Stroke Play,
243261,NCAA Corvallis Regional,"Corvallis, OR",Trysting Tree GC - Corvallis - OR,Stroke Play,
243264,NCAA Athens Regional,"Athens, Georgia",University of Georgia GCS - Athens - Georgia,Stroke Play,
242765,2026 PGA WORKS Collegiate Championship - Men's DI Team,"West Palm, Florida",The Park at West Palm,Stroke Play,
242768,2026 PGA WORKS Collegiate Championship - Men's Individual,"West Palm, Florida",The Park at West Palm,Stroke Play,
240005,2026 Big West Men's Golf Championship,"La Quinta , California",La Quinta Country Club,Stroke Play,
240164,2026 Summit League Men's Golf Championship,"Mesa, AZ",Longbow GC - Mesa - AZ,Stroke Play,
240304,2026 CU1 Mountain West Men's Golf Championship,"Tucson, Arizona",Omni Tucson National Resort - Tucson - Arizona,Stroke Play,
244563,Mid-American Men's Golf Championship 2026,"Zionsville, Indiana",Holliday Farms,Stroke Play,Central Michigan
239967,2026 BIG EAST Men's Golf Championships,"Hardeeville, South Carolina",Riverton Pointe Golf and Country Club,Stroke Play,
239794,Big Ten Men's Golf Championships,"North Plains, Oregon",Pumpkin Ridge GC - North Plains - Oregon,Stroke Play,
240291,West Coast Conference Men's Golf Championship - Match Play,"Fairfield, CA",Green Valley CC - Fairfield - CA,Match Play,
240240,West Coast Conference Men's Golf Championship,"Fairfield, CA",Green Valley CC - Fairfield - CA,Stroke Play,
238584,2026 MAAC Men's Golf Championship,"Lake Buena Vista, Florida",Walt Disney World - Lake Buena Vista - Florida,Stroke Play,
241762,2026 Conference USA Men's Golf Championship - Match Play,"Texarkana, AR",Texarkana CC - Texarkana - AR,Match Play,
243205,Sun Belt Conference Men's Championship Match Play,"Madison, MS",Annandale GC - Madison - MS,Match Play,
244548,2026 MAAC Men's Golf Championship,"Lake Buena Vista, Florida",Walt Disney World - Lake Buena Vista - Florida,Stroke Play,
238691,2026 OVC Men's Golf Championship - Match Play,"West Lafayette, Indiana",Birck Boilermaker GC - West Lafayette - Indiana,Match Play,
239629,2026 SoCon Men's Golf Championship,"West Columbia, South Carolina",Solina GC - West Columbia - South Carolina,Stroke Play,
239632,Big 12 Men's Golf Championship,"Hutchinson, Kansas",Prairie Dunes CC - Hutchinson - Kansas,Stroke Play,
239888,2026 American Conference Men's Golf Championship,"Sarasota, FL",Ritz - Sarasota - FL,Stroke Play,
241757,2026 Conference USA Men's Golf Championship - Stroke Play,"Texarkana, AR",Texarkana CC - Texarkana - AR,Stroke Play,
242538,2026 WAC Men's Golf Championship,"McKinney, Texas",Stonebridge Ranch CC - McKinney - Texas,Stroke Play,
242781,2026 Big South Men's Golf Championship (Match Play),"Saint Helena Island, South Carolina",Ocean Creek GCS at Fripp Island Resort - Saint Helena Island - South Carolina,Match Play,
242923,Big Sky Conference Championship,"Litchfield Park, AZ",Wigwam Resort - Litchfield Park - Arizona,Stroke Play,
243204,Sun Belt Conference Men's Championship,"Madison, MS",Annandale GC - Madison - MS,Stroke Play,
244394,2026 Atlantic 10 Men's Golf Championship,"Orlando, Florida",Evermore Resort Golf Club - Orlando - Florida,Stroke Play,
238690,2026 OVC Men's Golf Championship - Stroke Play,"West Lafayette, Indiana",Birck Boilermaker GC - West Lafayette - Indiana,Stroke Play,
241041,2026 Missouri Valley Conference Men's Golf Championship,"Waterloo, IL",Annbriar GCS - Waterloo - IL,Stroke Play,
242780,2026 Big South Men's Golf Championship (Stroke Play),"Saint Helena Island, South Carolina",Ocean Creek GCS at Fripp Island Resort - Saint Helena Island - South Carolina,Stroke Play,
244036,2026 CAA Men's Golf Championship,"St. Helena Island, SC",Dataw Island Club - St. Helena Island - SC,Stroke Play,
239966,2026 ACC Men's Golf Championship - Match Play,"Lake Powell, Florida",Shark's Tooth GC - Lake Powell - Florida,Match Play,
244037,2026 Horizon League Men's Golf Championship,"Howey-In-The-Hills, FL",Mission Inn Resort - Howey-In-The-Hills - FL,Stroke Play,
240112,Ivy League Men's Golf Championship,"Springfield, NJ",Baltusrol GC - Springfield - NJ,Stroke Play,
242447,2026 Patriot League Men's Golf Championship,"West Point, NY",West Point GCS - West Point - NY,Stroke Play,
244171,2026 NEC Men's Golf Championships,"Ellicott City, Maryland",Turf Valley Resort - Ellicott City - Maryland,Stroke Play,
244177,SEC Men's Golf Championship (Match Play),"St Simons Island, GA",Sea Island GC - St Simons Island - GA,Match Play,
239965,2026 ACC Men's Golf Championship - Stroke Play,"Lake Powell, Florida",Shark's Tooth GC - Lake Powell - Florida,Stroke Play,
244176,2026 SEC Men's Golf Championship (Stroke Play),"St Simons Island, GA",Sea Island GC - St Simons Island - GA,Stroke Play,
241132,2026 Atlantic Sun Conference Men's Golf Championship,"Valdosta, GA",Kinderlou Forest GC - Valdosta - GA,Stroke Play,
240398,2026 Southland Conference Men's Golf Championship,"Kerrville, TX",The Club At Comanche Trace - Kerrville - TX,Stroke Play,
239593,Battle For Idaho,"Boise, ID",Hillcrest CC - Boise - ID,Stroke Play,Boise State
239736,UAB Vs. Chattanooga,"Huntsville, AL",The Ledges CC  - Huntsville - AL,Match Play,UAB
239912,Hawkeye Invitational,"Riverside, IA",Blue Top Ridge At Riverside - Riverside - IA,Stroke Play,Iowa
244279,Battle of Idaho,"Boise, ID",Hillcrest CC - Boise - ID,Stroke Play,Boise State
238254,The Muirfield Shootout,"Dublin, Ohio",CC at Muirfield Village - Dublin - Ohio,Stroke Play,Miami (OH)
238678,2026 Rutherford Intercollegiate,"State College, PA",Penn State University GCSs - State College - PA,Stroke Play,Penn State
238920,Hoosier Collegiate Invitational,"Bloomington, IN",The Pfau Course At Indiana University - Bloomington - IN,Stroke Play,Indiana
238893,The Roar-EE Invitational,"Kingston, NY",Wiltwyck GC - Kingston - NY,Stroke Play,Columbia
239399,79th Western Intercollegiate,"Santa Cruz, CA",Pasatiempo GC - Santa Cruz - CA,Stroke Play,San Jose State
244124,2026 SWAC Men's Golf Championship,"Birmingham, AL",Oxmoor Valley - Birmingham - AL,Stroke Play,
238365,Ford Collegiate,"Richmond Hill, GA",The Ford Field & River Club - Richmond Hill - GA,Stroke Play,Georgia Southern
238498,Wofford Invitational,"Spartanburg, SC",CC Of Spartanburg - Spartanburg - SC,Stroke Play,Wofford
238718,Arkansas State Spring Invitational,"Jonesboro, Arkansas",RidgePointe CC - Jonesboro - Arkansas,Stroke Play,Arkansas State
238719,Mountaineer Invitational at Pete Dye,"Bridgeport, WV",Pete Dye GC - Bridgeport - WV,Stroke Play,West Virginia
238723,Mossy Oak Collegiate,"West Point, Mississippi",Mossy Oak GC - West Point - Mississippi,Stroke Play,Mississippi State
238762,Bluegrass Collegiate Invitational,"Lexington, Kentucky",University Club of Kentucky - Lexington - Kentucky,Stroke Play,Kentucky
238839,Lewis Chitengwa Memorial,"Charlottesville, VA",Birdwood Golf At Boar'S Head Resort - Charlottesville - VA,Stroke Play,Virginia
238941,The Shark Invitational,"Glen Cove, NY",Nassau CC - Glen Cove - NY,Stroke Play,Long Island
243346,Bridgeport Collegiate Individual,"Bridgeport, West Virginia",Bridgeport CC - Bridgeport - West Virginia,Stroke Play,West Virginia
239990,Wright State Invitational by Joes Landscaping,"Springboro, Ohio",Heatherwoode GC - Springboro - Ohio,Stroke Play,Wright State
242581,ABARTA Coca-Cola Collegiate Invitational,"Easton, PA",Northampton CC - Easton - PA,Stroke Play,Lafayette College
238782,El Macero Classic,"El Macero, CA",El Macero CC - El Macero - CA,Stroke Play,UC Davis
239162,Princeton Invitational,"Princeton, NJ",Springdale GC - Princeton - NJ,Stroke Play,Princeton
239293,Tar Heel Intercollegiate,"Chapel Hill, NC",Finley GC - Chapel Hill - NC,Stroke Play,North Carolina
239477,Robert Kepler Invitational,"Columbus, OH",Columbus CC - Columbus - OH,Stroke Play,Ohio State
238883,The Thunderbird Collegiate,"Phoenix, Arizona",Papago GCS - Phoenix - Arizona,Stroke Play,Arizona State
239566,Carpenter-Chaney Classic,"Paris, Kentucky",Houston Oaks GCS - Paris - Kentucky,Match Play,Morehead State
238598,Golfweek/Stifel Spring Challenge,"Pawley's Island, SC",True Blue GC - Pawley's Island - SC,Stroke Play,
238900,Wildcat Spring Invitational,"Galloway Township, New Jersey",Galloway National GC - Galloway Township - New Jersey,Stroke Play,Villanova
238969,Racer Intercollegiate,"Paducah, KY",CC Of Paducah - Paducah - KY,Stroke Play,Murray State
238981,NKU Jewell Invitational,"Batavia, Ohio",Elks Run GC - Batavia - Ohio,Stroke Play,Northern Kentucky
239098,Giles-Spratley Collegiate,"Midlothian, VA",Independence GC - Midlothian - VA,Stroke Play,Richmond
239401,UCSB Gaucho Invite,"Santa Barbara, California",Sandpiper GC - Santa Barbara - California,Stroke Play,UC Santa Barbara
239556,Tiger Invitational,"Columbia, MO",The Club At Old Hawthorne - Columbia - MO,Stroke Play,Missouri
239744,Irish Creek Intercollegiate,"Kannapolis, North Carolina",The Club at Irish Creek - Kannapolis - North Carolina,Stroke Play,Appalachian State
239903,Calusa Cup,"Naples, FL",Calusa Pines GC - Naples - FL,Stroke Play,Iowa
240280,TSU Big Blue Intercollegiate,"Old Hickory, Tennessee",Hermitage GCS - Old Hickory - Tennessee,Stroke Play,Tennessee State
238862,Mason Rudolph Championship,"Franklin, Tennessee",Vanderbilt Legends Club - Franklin - Tennessee,Stroke Play,Vanderbilt
239993,Augusta Haskins Award Invitational,"Augusta, Georgia",Forest Hills GC - Augusta - Georgia,Stroke Play,Augusta
239206,WIU Intercollegiate,"Silvis, IL",TPC at Deere Run - Silvis - IL,Stroke Play,Western Illinois
239747,Wyoming Cowboy Classic,"Maricopa, Arizona",Southern Dunes GC - Maricopa - Arizona,Stroke Play,Wyoming
238479,UNCW Seahawk Intercollegiate,"Wilmington, North Carolina",CC of Landfall - Wilmington - North Carolina,Stroke Play,UNCW
238812,Don Benbow Butler Spring Invitational,"Indianapolis, IN",Highland GCC - Indianapolis - IN,Stroke Play,Butler
238978,Maridoe Collegiate,"Carrollton, TX",Maridoe GC - Carrollton - TX,Stroke Play,North Texas
239326,Memphis Intercollegiate: Spirited by Old Dominick,"Cordova, TN",Colonial CC - Cordova - TN,Stroke Play,Memphis
239396,Mobile Bay Intercollegiate,"Semmes, AL",Magnolia Grove - Semmes - AL,Stroke Play,South Alabama
240072,SeattleU Redhawk Invitational Presented by L.A.B. GOLF,"University Place, Washington",Chambers Bay GC - University Place - WA,Stroke Play,Seattle
238889,Columbia Spring Invitational,"Springfield, PA",Rolling Green GC - Springfield - PA,Stroke Play,Columbia
240036,2026 Cutter Creek Intercollegiate,"Snow Hill, North Carolina",Cutter Creek GC - Snow Hill - North Carolina,Stroke Play,East Carolina
238968,BATTLE AT RUM POINTE,"Berlin, Maryland",Rum Pointe Seaside Golf Links - Berlin - Maryland,Stroke Play,Iona
239221,The Goodwin,"Stanford, California",Stanford Golf Course,Stroke Play,Stanford
239433,Sweetens Cove Intercollegiate,"South Pittsburg, Tennessee",Sweetens Cove GC - South Pittsburg - Tennessee,Match Play,Miami (OH)
238270,Bridgestone Collegiate Invitational,"Napa, California",Silverado CC & Resort - Napa - California,Stroke Play,Central Michigan
238528,Austin Peay Intercollegiate,"Dickson, Tennessee",Greystone GC - Dickson - Tennessee,Stroke Play,Austin Peay State
238768,AAMU D1 Invitational by The Underground,"Hampton, GA",Crystal Lake GCC - Hampton - GA,Stroke Play,Alabama A&M
238842,Golden Horseshoe Intercollegiate,"Williamsburg, VA",Golden Horseshoe GC - Williamsburg - VA,Stroke Play,William & Mary
238873,UC San Diego Invitational,"La Jolla, California",Torrey Pines GCS - La Jolla - California,Stroke Play,UC San Diego
239256,"Bell Bank ""Pay It Forward"" Collegiate","Litchfield Park, AZ",Wigwam Resort - Litchfield Park - Arizona,Stroke Play,Minnesota
239389,Valspar Collegiate Invitational,"Palm City, FL",Floridian National GC - Palm City - FL,Stroke Play,Houston
239533,The Duck Invitational,"Eugene, Oregon",Eugene CC - Eugene - Oregon,Stroke Play,Oregon
239564,Keene Trace Collegiate,"Nicholasville, KY",Keene Trace GC - Nicholasville - KY,Stroke Play,Morehead State
243688,Hootie Intercollegiate,"Awendaw, SC",Bulls Bay GC - Awendaw - SC,Stroke Play,Charleston
239621,Linger Longer Invitational,"Eatonton, Georgia",Great Waters at Reynolds Lake Oconee - Eatonton - Georgia,Stroke Play,Mercer
240137,The Carpetbagger Classic,"Urbana, Maryland",Worthington Manor GC - Urbana - Maryland,Stroke Play,Binghamton
238853,Pauma Valley Invitational presented by Heads Up,"Pauma Valley, California",Pauma Valley CC - Pauma Valley - California,Stroke Play,Loyola Marymount
238756,2026 ECU Intercollegiate at Brook Valley,"Greenville, North Carolina",Brook Valley CC - Greenville - North Carolina,Stroke Play,East Carolina
238913,Seminole Intercollegiate,"Tallahassee, Florida",Seminole Legacy GC - Tallahassee - FL,Stroke Play,Florida State
239036,The Michael A. Marino Classic,"Myrtle Beach, SC","Dunes Golf & Beach Club, The - Myrtle Beach - SC",Stroke Play,Coastal Carolina
239371,Arizona Thunderbirds Intercollegiate,"Tucson, Arizona",Tucson CC - Tucson - Arizona,Stroke Play,Arizona
239388,All American Intercollegiate,"Humble, TX",GC Of Houston - Humble - TX,Stroke Play,Houston
243156,All American Individual,"Humble, TX",GC Of Houston - Humble - TX,Stroke Play,Houston
239899,Southern Intercollegiate,"Athens, GA",Athens CC - Athens - GA,Stroke Play,Georgia
238366,Schenkel Invitational,"Statesboro, GA",Forest Heights CC - Statesboro - GA,Stroke Play,Georgia Southern
238925,Peoples Championship,"St. Simons Island, Georgia",Sea Island Resort - St. Simons Island - Georgia,Stroke Play,Western Carolina
240125,Babygrande Donald Ross Collegiate,"Southern Pines, North Carolina",Mid Pines Inn & GC - Southern Pines - North Carolina,Stroke Play,George Mason
238630,2026 Jackrabbit Invitational,"Boulder City, NV",Boulder Creek GC - Boulder City - NV,Stroke Play,South Dakota State
238750,The Desimone Invitational,"Daly City, California",Lake Merced GC,Stroke Play,California
238773,R.E. Lamkin Invitational,"Chula Vista, California",San Diego CC - Chula Vista - California,Stroke Play,San Diego
239158,The Johnnie-O at Sea Island,"St Simons Island, Georgia",Sea Island Resort - St. Simons Island - Georgia,Stroke Play,Rutgers
239369,Surf Club Invitational,"North Myrtle Beach, South Carolina",Surf Golf & Beach Club - North Myrtle Beach - South Carolina,Stroke Play,Appalachian State
239475,Cleveland Golf Palmetto Intercollegiate,"Aiken, South Carolina",Palmetto GC - Aiken - South Carolina,Stroke Play,USCA
240021,Louisiana Classics,"Lafayette, Louisiana",Oakbourne CC - Lafayette - Louisiana,Stroke Play,Louisiana
240063,Sacred Heart Spring Break Invite,"Orange Park, FL",Eagle Harbor GC - Orange Park - FL,Stroke Play,Sacred Heart
240181,ASU Spring Classic,"Montgomery, AL",Arrowhead CC - Montgomery - AL,Stroke Play,Alabama State
243520,Bandon Dunes Championship,"Bandon, OR",Bandon Dunes - Bandon - OR,Stroke Play,Idaho
239531,The Hayt,"Ponte Vedra Beach, FL",Sawgrass CC - Ponte Vedra Beach - FL,Stroke Play,North Florida
238778,CABO COLLEGIATE,"Cabo San Lucas, Baja California Sur",Twin Dolphin Club,Stroke Play,Arkansas
238954,The Watney,"Fresno, California",San Joaquin CC - Fresno - CA,Stroke Play,Fresno State
239149,Sam Ryder Intercollegiate,"Daytona Beach, FL",Lpga International - Daytona Beach - FL,Stroke Play,Stetson
239284,Golden Nugget Invitational,"Lake Charles, LA",The CC At The Golden Nugget - Lake Charles - LA,Stroke Play,Lamar
239540,Colin Montgomerie-HCU Inv.,"Sweetwater, TX",Sweetwater CC - Sweetwater - TX,Stroke Play,Houston Christian
239597,Southern Highlands Collegiate,"Las Vegas, Nevada",Southern Highlands GC - Las Vegas - Nevada,Stroke Play,UNLV
238465,Colleton River Collegiate,"Bluffton, SC",Colleton River Club - Bluffton - SC,Stroke Play,Michigan State
239746,Wyoming Desert Intercollegiate,"Palm Desert, California",Classic Club - Palm Desert - California,Stroke Play,Wyoming
240019,Lake Las Vegas Invitational,"Henderson, Nevada",Reflection Bay GC - Henderson - Nevada,Stroke Play,Louisiana
238338,Dorado Beach Collegiate,"DORADO, PR",Tpc Dorado Beach - DORADO - PR,Stroke Play,UNCG
238654,Military City Collegiate,"San Antonio, TX",Tpc San Antonio - San Antonio - TX,Stroke Play,UTSA
238767,2026 Gulf Coast Collegiate,"New Orleans, LA",English Turn GCC - New Orleans - LA,Stroke Play,New Orleans
242904,Arcis HBCU Championship (DI Men),"Weston, FL",The Club At Weston Hills - Weston - FL,Stroke Play,Miles
238413,The Savannah Intercollegiate,"Savannah, GA",Club At Savannah Harbor - Savannah - GA,Stroke Play,
239157,Coach Sykes Individual,"Raleigh, North Carolina",Lonnie Poole GCS - Raleigh - North Carolina,Stroke Play,NC State
240384,Freedom Classic,"Statesboro, GA",Forest Heights CC - Statesboro - GA,Match Play,Georgia Southern
238776,The Prestige,"La Quinta, CA",Pga West - La Quinta - CA,Stroke Play,UC Davis
238780,The Prestige Individual,"Indio, California",GC at Terra Lago - Indio - California,Stroke Play,UC Davis
239245,Watersound Invitational,"WaterSound, FL",The Third Golf Course at Watersound Club,Stroke Play,Alabama
238523,Loyola Intercollegiate,"Goodyear, Arizona",Palm Valley GC - Goodyear - Arizona,Stroke Play,Loyola Maryland
239387,Border Olympics,"Laredo, Texas",Laredo CC - Laredo - TX,Stroke Play,Houston
239395,Hal Williams Collegiate,"Semmes, AL",Magnolia Grove - Semmes - AL,Stroke Play,South Alabama
243005,Wexford Intercollegiate,"Hilton Head Island, SC",Wexford GC - Hilton Head Island - SC,Stroke Play,Francis Marion
239170,Gators Invitational,"Gainesville, FL",Mark Bostick GC at UF,Stroke Play,Florida
238577,John A. Burns Intercollegiate,"Lihue, Hawaii",Ocean Course at Hokuala,Stroke Play,Hawaii
239447,Puerto Rico Classic,"RIO GRANDE, PR",Grand Reserve GC - RIO GRANDE - PR,Stroke Play,Purdue
238337,Palmas del Mar Collegiate,"Humacao, Puerto Rico",Palmas Del Mar CC Flamboyan - Humacao - Puerto Rico,Stroke Play,UNCG
239165,Bentwater Intercollegiate,"Montgomery, TX",Bentwater CC - Montgomery - TX,Stroke Play,Sam Houston
239201,Lake Jovita Invitational,"Dade City, Florida",Lake Jovita GCC - Dade City - Florida,Stroke Play,Ball State
238367,Thomas Sharkey Individual Collegiate,"Statesboro, GA",Georgia Southern University GCS - Statesboro - GA,Stroke Play,Georgia Southern
239040,Amer Ari Invitational,"Kohala Coast, Hawaii",Mauna Lani Resort Golf - Kohala Coast - Hawaii,Stroke Play,Hawaii-Hilo
239018,Compadres Collegiate,"Playa del Carmen, Quintana Roo",Iberostar Playa Paraiso GC - Playa del Carmen - Quintana Roo,Stroke Play,UTRGV
239169,SeaBest Invitational,"Atlantic Beach, FL",Atlantic Beach CC,Stroke Play,Jacksonville
240110,Bill Cullum Invitational,"Somis, California",Saticoy CC - Somis - California,Stroke Play,CSU Northridge
239402,Southwestern Invitational,"Westlake Village, CA",North Ranch CC - Westlake Village - CA,Stroke Play,Pepperdine
239193,N.I.T.,"Tucson, Arizona",Omni Tucson National Resort  - Tucson - AZ,Stroke Play,Arizona
239173,Pablo Creek Cup  JU vs. Georgia Southern,"Jacksonville, FL",Pablo Creek GC - Jacksonville - FL,Match Play,Jacksonville
240275,Vintage Club Shootout,"Indian Wells, CA",The Vintage Club - Indian Wells - CA,Match Play,Stanford
238628,Copper Cup,"Laguna Niguel, CA",El Niguel CC - Laguna Niguel - CA,Match Play,UCLA
242382,2025 SWAC Men's Fall Golf Tournament,"Birmingham, AL",Oxmoor Valley - Birmingham - AL,Stroke Play,
238566,Pearl at Kalauao Invitational,"Aiea, HI",Pearl CC - Aiea - HI,Stroke Play,Hawaii
240114,Big Five Championship,"Plymouth Meeting, Pennsylvania",,Stroke Play,Penn
239238,Fripp Island Intercollegiate,"Saint Helena Island, South Carolina",Ocean Creek GCS at Fripp Island Resort - Saint Helena Island - South Carolina,Stroke Play,USC Upstate
238574,Ka'anapali Classic by OUTRIGGER,"Lahaina, HI",Kaanapali GR - Lahaina - HI,Stroke Play,Hawaii
242251,East Lake Cup - Match Play,"Atlanta, Georgia",East Lake GC - Atlanta - Georgia,Match Play,
238648,The Preserve Golf Club Collegiate,"Carmel, California",Santa Lucia Preserve - Carmel - California,Stroke Play,Cal Poly
238671,The Clerico,"Tulsa, Oklahoma",Southern Hills CC - Tulsa - Oklahoma,Stroke Play,Oral Roberts
238793,Florida Atlantic Invitational,"West Palm, Florda",Panther National,Stroke Play,Florida Atlantic
238967,WYKAGYL COLLEGIATE,"New Rochelle, New York",Wykagyl CC - New Rochelle - New York,Stroke Play,Iona
239194,The MO State Intercollegiate,"Ozark, MO",Millwood GRQC - Ozark - MO,Stroke Play,Missouri State
239209,ODU/Kilmarlic Intercollegiate,"Harbinger, NC",Kilmarlic GC - Harbinger - NC,Stroke Play,Old Dominion
242247,Metropolitan Intercollegiate Championship,"West Orange, NJ",Montclair GC - West Orange - NJ,Stroke Play,Wagner
239495,East Lake Cup - Stroke Play,"Atlanta, Georgia",East Lake GC - Atlanta - Georgia,Stroke Play,
239033,Lehigh Invitational,"Bethlehem, PA",Saucon Valley CC - Bethlehem - PA,Stroke Play,Lehigh
239207,Golf Club of Georgia Collegiate,"Alpharetta, GA",GC Of Georgia - Alpharetta - GA,Stroke Play,Georgia Tech
239392,Steelwood Collegiate,"Loxley, Alabama",Steelwood GC - Loxley - Alabama,Stroke Play,South Alabama
239846,Monterrey Collegiate Classic,"San Pedro Garza Garcia, Nuevo Leon",Club Campestre Monterrey - San Pedro Garza Garcia - Nuevo Leon,Stroke Play,George Washington
239334,Golden Flash Individual,"Hudson, Ohio",CC of Hudson - Hudson - Ohio,Stroke Play,Kent State
239901,Saint Mary's Invitational,"Seaside, California",Bayonet/Black Horse GCS - Seaside - California,Stroke Play,St. Mary's (CA)
238417,Crusader Invitational sponsored by Cove Risk,"WORCESTER, MA",Worcester CC - WORCESTER - MA,Stroke Play,Holy Cross (MA)
238497,Xavier Invitational presented by Gateway Logistics,"Cincinnati, OH",Maketewah CC - Cincinnati - OH,Stroke Play,Xavier
238794,Dayton Flyer Invitational,"Kettering, Ohio",NCR CC - Kettering - Ohio,Stroke Play,Dayton
238940,Nassau Intercollegiate,"Glen Cove, NY",Nassau CC - Glen Cove - NY,Stroke Play,Long Island
239292,Williams Cup,"Wilmington, North Carolina",Eagle Point GC - Wilmington - North Carolina,Stroke Play,North Carolina
239469,76th VSGA Intercollegiate Championship,"Chesterfield, VA",Lake Chesdin GC - Chesterfield - VA,Stroke Play,
239626,La Tour Intercollegiate,"Mathews, Louisiana",LaTour GC - Mathews - Louisiana,Stroke Play,Nicholls
238973,Fallen Oak Collegiate Invitational,"Saucier, Mississippi",Fallen Oak GC - Saucier - Mississippi,Stroke Play,Southern Miss
239236,Quail Valley Collegiate Invitational,"Vero Beach, FL",Quail Valley Golf & River Club - Vero Beach - FL,Stroke Play,USF
238822,Furman Intercollegiate,"Greenville, South Carolina",Furman University GC - Greenville - South Carolina,Stroke Play,Furman
241934,2025 Battle of The Expressway,"Mount Vernon, Indiana",Western Hills CC - Mount Vernon - Indiana,Match Play,Southern Indiana
239468,Oregon State Invitational,"Salem, OR",Illahe Hills CC - Salem - OR,Stroke Play,Oregon State
239516,The Bryson Invitational,"Daniel Island, SC",Daniel Island Club - Daniel Island - SC,Stroke Play,Charleston
239920,St Andrews Links Collegiate - Medal Match,"Fife, Scotland",St Andrews,Match Play,
242028,Eagle-Aggie Challenge,"Greensboro, North Carolina",Greensboro CC - Carlson Farm Course - Greensboro - North Carolina,Match Play,N. Carolina Central
238247,Moraine Intercollegiate,"Kettering, OH",Moraine CC - Kettering - OH,Stroke Play,Miami (OH)
238271,Motor City Match Up,"Birmingham, Michigan",Birmingham CC - Birmingham - Michigan,Match Play,Central Michigan
238364,Bash in The Boro,"Statesboro, GA",Georgia Southern University GCS - Statesboro - GA,Stroke Play,Georgia Southern
238701,Bucknell Invitational,"Lewisburg, Pennsylvania",Bucknell GC - Lewisburg - Pennsylvania,Stroke Play,Bucknell
239312,Everett Buick GMC Classic,"Little Rock, Arkansas",Chenal CC - Little Rock - Arkansas,Stroke Play,Little Rock
239444,Purdue Fall Invitational,"West Lafayette, Indiana",Kampen-Cosler Golf Course - West Lafayette,Stroke Play,Purdue
239463,Purdue Fall Individual,"West Lafayette, Indiana",Birck Boilermaker GC - West Lafayette - Indiana,Stroke Play,Purdue
239584,Georgetown Intercollegiate,"Westfield, NJ",Echo Lake CC - Westfield - NJ,Stroke Play,Georgetown
239662,Turtle Point Invite,"Killen, AL",Turtle Point Yacht & CC - Killen - AL,Stroke Play,North Alabama
239797,The Scrappy at Cobblestone,"Acworth, GA",Cobblestone GCS - Acworth - GA,Stroke Play,Kennesaw State
239919,St Andrews Links Collegiate - Stroke Play,"Fife, Scotland",St Andrews,Stroke Play,
240024,Elon Phoenix Invitational,"Burlington, North Carolina",Alamance CC - Burlington - North Carolina,Stroke Play,Elon
239924,SAS HBCU Invitational (DI Men),"Cary, North Carolina",Prestonwood CC - Cary - North Carolina,Stroke Play,Miles
238668,Star Match,"Annapolis, Maryland",United States Naval Academy GC - Annapolis - Maryland,Match Play,Navy
239100,Visit Stockton Pacific Invitational,"Stockton, California",The Reserve at Spanos Park - Stockton - California,Stroke Play,Pacific
239748,NB3 Match Play at Twin Warriors,"Santa Ana Pueblo, New Mexico",Twin Warriors GC at Hyatt Tamaya - Santa Ana Pueblo - New Mexico,Match Play,
237140,Red Flash Invitational,"Johnstown, Pennsylvania",Sunnehanna CC - Johnstown - Pennsylvania,Stroke Play,Saint Francis
238522,Hamptons Intercollegiate,"East Hampton, NY",Maidstone Club - East Hampton - NY,Stroke Play,Loyola Maryland
238595,Golfweek Put Me In Coach Invitational,"Muncie, IN",Delaware CC - Muncie - IN,Stroke Play,
238646,West Bay Collegiate Invitational,"Estero, Florida",West Bay Club,Stroke Play,Florida Gulf Coast
238717,Bubba Barnett Intercollegiate,"Jonesboro, Arkansas",RidgePointe CC - Jonesboro - Arkansas,Stroke Play,Arkansas State
238753,Cullan Brown Collegiate,"Lexington, Kentucky",Lexington CC - Lexington - Kentucky,Stroke Play,Kentucky
239015,Windy City Classic Invitational,"East Chicago, IL",Harborside International - East Chicago - IL,Stroke Play,Chicago State
239269,Tom Tontimonia Invitational hosted by Cleveland State,"Westlake, OH",Lakewood CC - Westlake - OH,Stroke Play,Cleveland State
239317,Fighting Irish Classic,"Notre Dame, IN",Warren GCS - Notre Dame - IN,Stroke Play,Notre Dame
239449,Trinity Forest Invitational,"Dallas, TX",Trinity Forest GC - Dallas - TX,Stroke Play,SMU
239457,Grier Jones Shocker Invitational,"Newton, KS",Sand Creek Station - Newton - KS,Stroke Play,Wichita State
239703,Marquette Intercollegiate,"Erin, WI",Erin Hills - Erin - WI,Stroke Play,Marquette
239695,Matthews Auto Collegiate Invitational,"Apalachin, NY",Links At Hiawatha Landing - Apalachin - NY,Stroke Play,Binghamton
241478,Saint Peter's-Wagner Dual Match,"Millstone Township, NJ",Charleston Springs - Millstone Township - NJ,Stroke Play,Saint Peter's
239546,Dual vs. UND,"Fargo, ND",Fargo CC - Fargo - ND,Stroke Play,North Dakota State
238766,Blessings Collegiate Invitational,"Fayetteville, Arkansas",Blessings GC - Fayetteville - Arkansas,Stroke Play,Arkansas
239859,Commander-In-Chief's Cup,"Mamaroneck, NY",Winged Foot GC - Mamaroneck - NY,Stroke Play,
238467,Dolenc Invitational,"Madison, IL",Gateway National Golf Links - Madison - IL,Stroke Play,SIU Edwardsville
238658,2025 UConn Invitational @ GreatHorse,"Hampden, Massachusetts",GreatHorse GCS - Hampden - Massachusetts,Stroke Play,Connecticut
238687,Virtues Intercollegiate,"Nashport, Ohio",The Virtues GC - Nashport - Ohio,Stroke Play,Bowling Green
238697,Mark Simpson Colorado Invitational,"Erie, CO",Colorado National GC - Erie - CO,Stroke Play,Colorado
238698,Les Fowler Colorado Individual Invitational,"Broomfield, Colorado",Broadlands GCS - Broomfield - Colorado,Stroke Play,Colorado
238720,Nemacolin Collegiate Invitational,"Farmington, Pennsylvania",Nemacolin Woodlands Resort - Farmington - Pennsylvania,Stroke Play,West Virginia
238721,Shepherd's Rock Individual,"Farmington, Pennsylvania",Nemacolin Woodlands Resort - Farmington - Pennsylvania,Stroke Play,West Virginia
238992,Bayou City Collegiate Classic,"Houston, TX",Westwood GC - Houston - TX,Stroke Play,Rice
239239,The Carolina Cup,"Spartanburg, South Carolina",The Carolina CC - Spartanburg - South Carolina,Stroke Play,USC Upstate
239398,Windon Memorial Classic,"Lake Forest, IL",Knollwood Club - Lake Forest - IL,Stroke Play,Northwestern
239875,Ben Hogan Collegiate Invitational Presented by Charles Schwab,"Fort Worth, TX",Colonial CC - Fort Worth - TX,Stroke Play,TCU
238272,Jim DeLapa Collegiate,"Benton Harbor, MI",Point O'Woods GCC - Benton Harbor - MI,Stroke Play,Central Michigan
238520,2025 Ironwood Collegiate Classic,"Greenville, North Carolina",Ironwood GCC- ECU,Stroke Play,East Carolina
241639,The Bryan Bros Collegiate,"West Columbia, South Carolina",Solina GC - West Columbia - South Carolina,Stroke Play,South Carolina
238887,The Autumn Invitational,"Lake Placid, NY",Lake Placid Club - Lake Placid - NY,Stroke Play,Columbia
238258,The Indy at Forest Hills,"Richmond, Indiana",Forest Hills CC - Richmond - Indiana,Stroke Play,Miami (OH)
239562,Sandestin Collegiate Classic,"Destin, FL",Sandestin Resort & Club - Destin - FL,Stroke Play,Texas State
241297,LITTLE THREE,"Youngstown, NY",Niagara Frontier C C - Youngstown - NY,Stroke Play,Niagara
236150,2025 Badger Invitational,"Madison, WI",TPC Wisconsin - Madison - WI,Stroke Play,Wisconsin
238716,Git-R-Done Invitational,"Lincoln, NE",Firethorn GC - Lincoln - NE,Stroke Play,Nebraska
239178,GMAC Invitational,"Oneonta, AL",Limestone Springs - Oneonta - AL,Stroke Play,UAB
239352,The Tindall 2025,"Bremerton, WA",Gold Mountain GC - Bremerton - WA,Stroke Play,Washington
239435,Ryan T. Lee Memorial Collegiate,"Wethersfield, CT",Wethersfield CC - Wethersfield - CT,Stroke Play,Fairfield
239487,Zach Johnson Invitational,"West Des Moines, Iowa",Glen Oaks CC - West Des Moines - Iowa,Stroke Play,Drake
239644,40th Annual Thomas W. Dortch Jr. HBCU Collegiate Invitational Division I Men,"Suwanee, GA",Laurel Springs GC - Suwanee - GA,Stroke Play,Miles
239679,Temple Invitational,"Plymouth Meeting, Pennsylvania",,Stroke Play,Temple
239877,The Tindall Individual,"Bremerton, WA",Gold Mountain GC - Bremerton - WA,Stroke Play,Washington
239019,Gene Miranda Falcon Invitational,"Colorado Springs, CO",Eisenhower GC - Colorado Springs - CO,Stroke Play,Air Force
239022,AF Silver Individual,"Colorado Springs, CO",Eisenhower GC - Colorado Springs - CO,Stroke Play,Air Force
238667,The Goat,"Annapolis, Maryland",United States Naval Academy GC - Annapolis - Maryland,Stroke Play,Navy
238785,Earl Yestingsmeier Invitational,"Muncie, IN",Delaware CC - Muncie - IN,Stroke Play,Ball State
238806,OFCC/Fighting Illini Invitational,"Olympia Fields, IL",Olympia Fields CC - Olympia Fields - IL,Stroke Play,Illinois
239212,Colonel Classic,"Richmond, Kentucky",The University Club at Arlington - Richmond - Kentucky,Stroke Play,Eastern Kentucky
239974,William H. Tucker Invitational,"ALBUQUERQUE, NM",Championship GC - ALBUQUERQUE - NM,Stroke Play,New Mexico
239812,Jackson T. Stephens Cup - Match Play,"Lake Bluff, Illinois",Shoreacres - Lake Bluff - Illinois,Match Play,
238418,Blue Hen Intercollegiate hosted by White Clay Creek Country Club,"Wilmington, DE",White Clay Creek C C - Wilmington - DE,Stroke Play,Delaware
238488,The Bearcat Invitational,"Cincinnati, OH",Coldstream Country Club,Stroke Play,Cincinnati
238567,The Wohali,"Coalville, Utah",Wohali Club - Eagle Course,Stroke Play,Utah
238568,Soldier Hollow Individual,"Midway, UT",Soldier Hollow - Midway - UT,Stroke Play,Utah
238747,The Invitational at The Honors Course,"Ooltewah, TN",The Honors Course - Ooltewah - TN,Stroke Play,Chattanooga
238831,Bluejay Invitational,"Omaha, NE",Shadow Ridge CC - Omaha - NE,Stroke Play,Creighton
238919,JT Poston Invitational,"Waynesville, NC",Waynesville Inn and Golf Club - Waynesville - NC,Stroke Play,Western Carolina
239063,Grover Page Classic,"Memphis, TN",Links At Audubon - Memphis - TN,Stroke Play,UT Martin
239590,Highlands Invitational hosted by Turtleson,"Westchester, IL",Chicago Highlands - Westchester - IL,Stroke Play,East Tennessee State
239810,Jackson T. Stephens Cup - Stroke Play,"Lake Bluff, Illinois",Shoreacres - Lake Bluff - Illinois,Stroke Play,
239842,Canadian Collegiate Invitational,"Foot's Bay, Ontario",Oviinbyrd GC - Foot's Bay - Ontario,Stroke Play,
236937,Mercyhurst Laker Fall Invitational,"North East, Pennsylvania",Lake View GC - North East - Pennsylvania,Stroke Play,Mercyhurst
238693,Golden Grizzlies Intercollegiate,"ROCHESTER, MI",Oakland University Golf & Learning Center - ROCHESTER - MI,Stroke Play,Oakland
240002,Ram Masters Invitational,"Fort Collins, CO",Fort Collins CC - Fort Collins - CO,Stroke Play,Colorado State
238464,Folds of Honor Collegiate,"Grand Haven, MI",American Dunes GC - Grand Haven - MI,Stroke Play,Michigan State
238836,2025 Palouse Collegiate,"Pullman, WA",Palouse Ridge GC - Pullman - WA,Stroke Play,Washington State
238516,Wildcat Invitational,"Manhattan, KS",Colbert Hills GCS - Manhattan - KS,Stroke Play,Kansas State
238530,Golfweek Fall Challenge,"Pawley's Island, SC",True Blue GC - Pawley's Island - SC,Stroke Play,
238622,Whirlwind Invitational,"Chandler, AZ",Whirlwind GC - Chandler - AZ,Stroke Play,Southern California
238856,SHU Men's Fall Classic,"Milford, CT",Great River GC - Milford - CT,Stroke Play,Sacred Heart
238886,The Metropolis Intercollegiate,"White Plains, NY",Metropolis CC - White Plains - NY,Stroke Play,Columbia
239035,Myrtle Beach Golf Trips Intercollegiate,"Myrle Beach, SC",Grande Dunes Resort Club - Myrle Beach - SC,Stroke Play,Coastal Carolina
239222,Argent Financial Classic,"Choudrant, Louisiana",Squire Creek CC - Choudrant - Louisiana,Stroke Play,Louisiana Tech
240497,2025 Joe Feaganes Marshall Invitational,"Huntington, West Virginia",Guyan GCC - Huntington - West Virginia,Stroke Play,Marshall
238918,2025 2nd Swing Gopher Invitational,"Independence,",Windsong Farm - Independence,Stroke Play,Minnesota
238336,Bryan National Collegiate,"Browns Summit, NC",Bryan Park - Browns Summit - NC,Stroke Play,UNCG
238521,2025 Rod Myers Invitational and John H. Ryan Memorial,"Durham, North Carolina",Duke University GC - Durham - North Carolina,Stroke Play,Duke
238821,2025 Sahalee Players Championship,"Sammamish, WA",Sahalee CC - Sammamish - WA,Stroke Play,Washington
239153,Visit Knoxville Collegiate,"Loudon, TN",Tennessee National GC - Loudon - TN,Stroke Play,Tennessee
239351,2025 Alex Lagowitz Memorial,"Hamilton, New York",Seven Oaks GC - Hamilton - New York,Stroke Play,Colgate
239791,Pan-Pacific UGSL Tournament,"Mishima, Shizuoka",Grand Fields Country Club - Mishima - Japan,Stroke Play,
239635,Bridgestone HBCU Invitational (DI Men),"Duluth, Georgia",TPC at Sugarloaf - Duluth - Georgia,Stroke Play,Miles
238629,2025 Island Resort Intercollegiate,"Bark River, MI",Sage Run GC - Bark River - MI,Stroke Play,South Dakota State
239379,Red Bandanna Invitational,"Verona, New York",Turning Stone Resort - Verona - New York,Stroke Play,Boston College
239095,The Carmel Cup,"Pebble Beach, CA",Spyglass Hill GC - Pebble Beach - CA,Stroke Play,Mississippi State
239484,Niagara Dual,"Pittsford, NY",Monroe GC - Pittsford - NY,Stroke Play,Le Moyne`;

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

function parseTournamentsCsv(csv) {
  // Strip a leading UTF-8 BOM if present, then drop the header row.
  const lines = csv.replace(/^﻿/, '').trim().split('\n');
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return {
      id: cells[0].trim(),
      name: cells[1].trim(),
      location: cells[2].trim(),
      course: cells[3].trim(),
      format: cells[4].trim(),
      host: cells[5].trim(),
    };
  });
}

export const TOURNAMENTS = parseTournamentsCsv(TOURNAMENTS_CSV);
