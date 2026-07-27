// Real college golf program roster, sourced from a season rankings export
// (rankings.csv). Kept as raw CSV text so it stays a straight paste-and-diff
// target for future season updates, rather than 311 hand-typed objects.
//
// strength (0-100) is derived by min-max normalizing "Avg (w)Pts" across the
// full field: the #1 team (highest avg points) gets 100, the last-place team
// gets 0, everyone else lands proportionally between. This preserves the
// real competitive gaps in the data (the gap from #1 to #2 is much bigger
// than the gap from #150 to #151) rather than flattening everyone into even
// rank-based spacing.
const RANKINGS_CSV = `Rank,Team,Conference,Events,Record (W-L-T),Avg (w)Pts
1,Auburn University,SEC,16,187-23-2,90.17
2,University of Texas,SEC,16,171-23-5,82.92
3,University of Florida,SEC,15,152-23-3,81.66
4,University of Virginia,ACC,14,144-24-6,76.67
5,Oklahoma State University,Big 12,15,179-31-3,72.46
6,Texas Tech University,Big 12,12,133-40-3,66.00
7,Louisiana State University,SEC,13,136-36-3,65.71
8,"University of Arkansas, Fayetteville",SEC,12,128-43-3,65.70
9,University of North Carolina,ACC,15,141-42-8,65.64
10,Vanderbilt University,SEC,13,137-36-3,65.16
11,University of Arizona,Big 12,15,121-44-2,63.59
12,University of Mississippi,SEC,14,123-56-3,63.37
13,Stanford University,ACC,15,147-55-4,61.93
14,Pepperdine University,West Coast,15,126-74-3,61.67
15,Arizona State University,Big 12,16,125-77-2,61.38
16,University of Oklahoma,SEC,15,126-71-2,61.09
17,University of Illinois,Big Ten,12,134-32-2,60.77
18,University of Tennessee,SEC,12,121-47-8,60.69
19,University of Alabama,SEC,11,99-54-2,56.82
20,Univ. of North Carolina at Charlotte,American,11,102-43-5,54.92
21,Texas A&M University,SEC,16,139-73-4,54.63
22,"University of California, Los Angeles",Big Ten,15,127-72-7,53.82
23,Brigham Young University,Big 12,14,147-62-3,53.74
24,"California State University, Long Beach",Big West,12,154-24-0,53.34
25,Georgia Institute of Technology,ACC,12,98-62-9,53.27
26,University of New Mexico,Mountain West,13,134-39-3,53.23
27,University of Georgia,SEC,14,113-87-3,53.06
28,Duke University,ACC,13,114-58-4,52.89
29,University of Southern California,Big Ten,13,125-66-3,50.73
30,Florida State University,ACC,13,101-75-2,50.60
31,Clemson University,ACC,12,98-62-3,49.91
32,University of Notre Dame,ACC,12,109-51-1,49.85
33,Wake Forest University,ACC,12,104-56-5,49.08
34,University of Louisville,ACC,13,101-71-2,48.94
35,Texas Christian University,Big 12,12,109-67-6,48.91
36,University of Utah,Big 12,12,105-65-3,47.92
37,Mississippi State University,SEC,13,99-69-1,47.50
38,University of San Diego,West Coast,14,128-70-4,46.40
39,University of Kansas,Big 12,13,146-51-4,46.06
40,Arkansas State University,Sun Belt,13,153-43-2,45.21
41,University of South Carolina,SEC,12,75-71-4,44.65
42,Purdue University,Big Ten,13,102-82-3,44.55
43,Univ. of North Carolina Wilmington,Coastal Athletic,11,105-39-1,44.32
44,San Diego State University,Mountain West,12,92-80-3,43.48
45,University of Washington,Big Ten,11,77-82-3,43.35
46,"University of Nevada, Las Vegas",Mountain West,12,95-63-4,43.07
47,College of Charleston (SC),Coastal Athletic,11,95-48-3,42.44
48,"University of California, Berkeley",ACC,13,91-69-4,42.18
49,Southern Methodist University,ACC,10,69-79-3,41.92
50,Northwestern University,Big Ten,13,103-73-4,41.72
51,University of Colorado,Big 12,13,146-66-4,41.14
52,North Carolina State University,ACC,11,91-63-0,41.02
53,University of Arkansas at Little Rock,Ohio Valley,13,116-76-2,40.52
54,University of South Florida,American,12,108-62-5,40.46
55,West Virginia University,Big 12,13,111-78-1,39.88
56,University of Tennessee Chattanooga,Southern,13,85-82-6,39.64
57,Oregon State University,Pac-12,14,99-77-2,39.19
58,University of Memphis,American,13,119-71-6,39.18
59,Georgia Southern University,Sun Belt,13,85-54-7,39.14
60,Florida Gulf Coast University,ASUN,13,123-52-3,38.47
61,University of Cincinnati,Big 12,12,109-71-5,38.46
62,University of Houston,Big 12,12,95-74-1,38.18
63,University of Southern Mississippi,Sun Belt,12,127-36-0,38.15
64,University of Kentucky,SEC,11,89-69-0,38.15
65,Rice University,American,12,82-81-6,37.98
66,University of Oregon,Big Ten,12,86-83-4,37.69
67,Saint Mary's College of California,West Coast,14,132-66-5,36.42
68,Washington State University,Pac-12,10,92-65-3,36.42
69,Iowa State University,Big 12,11,97-76-2,36.40
70,Coastal Carolina University,Sun Belt,11,89-45-3,36.01
71,Marquette University,Big East,11,81-65-2,35.95
72,Elon University,Coastal Athletic,10,106-28-3,35.68
73,University of Minnesota,Big Ten,12,96-73-4,35.64
74,Liberty University,Conference USA,13,90-67-2,35.63
75,The Ohio State University,Big Ten,11,88-70-2,35.62
76,University of South Alabama,Sun Belt,11,91-50-2,35.25
77,Michigan State University,Big Ten,11,69-56-7,35.08
78,University of the Pacific,West Coast,12,101-80-1,35.07
79,Stetson University,ASUN,11,112-49-3,35.06
80,Kansas State University,Big 12,11,80-71-4,34.67
81,Rutgers University-New Brunswick,Big Ten,11,84-68-1,34.42
82,Loyola Marymount University,West Coast,11,73-85-3,34.30
83,University of Nebraska-Lincoln,Big Ten,13,111-68-5,34.11
84,University of Texas at El Paso,Conference USA,13,104-69-7,33.79
85,San Jose State University,Mountain West,11,86-84-1,33.26
86,East Tennessee State University,Southern,11,76-74-2,33.17
87,University of Michigan,Big Ten,11,72-73-3,32.95
88,Grand Canyon University,Mountain West,13,83-102-3,32.94
89,"University of Missouri, Columbia",SEC,12,68-87-2,32.86
90,University of Iowa,Big Ten,11,58-84-3,32.47
91,Santa Clara University,West Coast,11,79-81-1,31.85
92,Baylor University,Big 12,11,79-73-2,31.80
93,Xavier University,Big East,13,142-39-2,30.53
94,University of Central Florida,Big 12,12,75-87-2,29.91
95,University of North Texas,American,11,84-62-6,29.86
96,Princeton University,Ivy,10,52-46-3,29.64
97,University of Alabama at Birmingham,American,11,88-45-1,29.47
98,Eastern Michigan University,Mid-American,13,82-85-3,28.58
99,University of Maryland,Big Ten,10,66-77-4,28.38
100,"Indiana University, Bloomington",Big Ten,12,40-131-5,28.08
101,New Mexico State University,Conference USA,12,67-81-4,27.92
102,Campbell University,Coastal Athletic,10,86-43-3,27.74
103,"University of California, San Diego",Big West,11,118-40-4,27.47
104,University of Nevada,Mountain West,11,102-76-2,27.33
105,Harvard University,Ivy,8,53-32-1,27.24
106,Augusta University,NCAA D-II / Ind.,14,67-112-3,27.24
107,Middle Tennessee State University,Conference USA,11,63-66-4,27.18
108,Oral Roberts University,Summit,11,75-81-0,27.14
109,University of North Alabama,ASUN,12,99-59-3,26.99
110,Tarleton State University,WAC,13,97-75-1,26.93
111,Pennsylvania State University,Big Ten,10,68-77-5,26.92
112,UNCG,Southern,11,65-83-1,26.82
113,Kennesaw State University,Conference USA,11,69-74-4,26.62
114,Florida Atlantic University,American,11,80-77-2,26.59
115,Virginia Commonwealth University,Atlantic 10,12,109-59-1,26.49
116,Southern Illinois University at Carbondale,Missouri Valley,13,111-76-1,26.48
117,University of Wisconsin-Madison,Big Ten,10,34-104-3,26.43
118,Furman University,Southern,11,47-102-3,26.23
119,Miami University (Ohio),Mid-American,13,61-85-5,26.21
120,James Madison University,Sun Belt,11,93-63-4,25.88
121,Lipscomb University,ASUN,11,80-72-4,25.69
122,University of Richmond,Atlantic 10,11,101-66-2,25.58
123,Louisiana,Sun Belt,11,74-72-2,25.55
124,Illinois State University,Missouri Valley,13,87-73-7,25.44
125,Virginia Tech,ACC,11,56-91-4,25.30
126,Butler University,Big East,14,125-51-1,25.11
127,Western Carolina University,Southern,11,111-46-1,24.99
128,Texas State University,Sun Belt,11,70-73-3,24.97
129,Abilene Christian University,WAC,12,87-62-2,24.50
130,University of North Florida,ASUN,12,46-126-2,24.35
131,University of Texas Rio Grande Valley,Southland,12,80-65-3,24.30
132,Boise State University,Mountain West,12,84-79-3,24.30
133,Kent State University,Mid-American,11,40-75-5,24.11
134,George Mason University,Atlantic 10,11,90-53-4,23.99
135,University of Texas at San Antonio,American,11,66-73-0,23.83
136,University of Rhode Island,Atlantic 10,13,112-37-3,23.81
137,Seattle University,WAC,11,84-61-2,23.61
138,University of Connecticut,Big East,12,100-60-2,23.48
139,University of Idaho,Big Sky,11,93-47-0,23.25
140,Colorado State University,Mountain West,11,36-138-1,23.20
141,Mercer University,Southern,12,79-70-3,23.10
142,Northern Illinois University,Mid-American,11,42-98-2,23.04
143,University of San Francisco,West Coast,10,49-99-4,23.03
144,Loyola University Maryland,Patriot,11,73-63-1,22.96
145,California Baptist University,WAC,10,100-50-1,22.90
146,Jacksonville State University,Conference USA,11,86-59-2,22.90
147,College of William & Mary,Coastal Athletic,11,92-58-1,22.79
148,"California State University, Sacramento",Big Sky,11,81-78-3,22.42
149,East Carolina University,American,11,92-53-2,22.34
150,Gonzaga University,West Coast,10,66-90-2,22.02
151,Sam Houston,Conference USA,11,44-103-4,21.92
152,California Polytechnic State University,Big West,11,61-99-1,21.80
153,University of Wyoming,Mountain West,13,86-117-6,21.79
154,University of Denver,Summit,10,87-64-2,21.78
155,Louisiana Tech University,Conference USA,11,37-113-3,21.73
156,Western Kentucky University,Conference USA,11,68-87-1,21.60
157,Jacksonville University,ASUN,11,43-93-3,21.49
158,Fresno State,Mountain West,11,61-107-2,21.49
159,Wichita State University,American,11,89-62-1,21.39
160,University of Toledo,Mid-American,12,50-101-1,21.37
161,Troy University,Sun Belt,11,64-83-3,21.36
162,Seton Hall University,Big East,11,82-58-3,21.17
163,Georgetown University,Big East,10,73-44-3,20.85
164,Lamar University,Southland,11,51-89-2,20.74
165,"University of California, Davis",Big West,11,61-125-0,20.69
166,Georgia State University,Sun Belt,13,76-80-5,20.48
167,Yale University,Ivy,9,43-70-3,20.33
168,University of Central Arkansas,ASUN,11,77-62-3,20.25
169,Eastern Kentucky University,ASUN,11,79-75-4,20.16
170,Wofford College,Southern,10,45-83-2,20.15
171,Wright State University,Horizon,13,77-65-5,20.09
172,Creighton University,Big East,10,68-56-5,20.01
173,University of St. Thomas - Minnesota,Summit,10,57-65-2,20.01
174,"University of California, Santa Barbara",Big West,10,63-84-4,19.49
175,Winthrop University,Big South,10,61-59-4,19.39
176,George Washington University,Atlantic 10,11,72-64-2,19.37
177,Villanova University,Big East,12,99-48-3,19.33
178,Utah Tech University,WAC,9,67-60-3,19.25
179,University of Tennessee at Martin,Ohio Valley,13,107-52-2,19.24
180,University of Delaware,Coastal Athletic,11,63-66-3,19.19
181,North Dakota State University,Summit,13,81-72-1,19.09
182,Appalachian State University,Sun Belt,11,60-95-1,18.92
183,South Dakota State University,Summit,12,73-89-2,18.78
184,Boston College,ACC,9,46-78-1,18.72
185,St. John's University (New York),Big East,11,83-55-1,18.65
186,Drexel University,Coastal Athletic,11,85-34-4,18.60
187,University of Louisiana Monroe,Sun Belt,11,42-96-1,18.37
188,U.S. Naval Academy,Patriot,13,55-83-3,18.31
189,Ball State University,Mid-American,11,50-97-0,17.98
190,Tennessee Technological University,Ohio Valley,13,99-50-2,17.90
191,Longwood University,Big South,11,85-52-2,17.88
192,DePaul University,Big East,11,66-79-0,17.85
193,University of South Dakota,Summit,10,76-49-0,17.79
194,Austin Peay State University,ASUN,10,43-91-3,17.63
195,Howard University,MEAC,13,58-82-1,17.57
196,University of Dayton,Atlantic 10,11,67-72-5,17.38
197,Loyola University Chicago,Atlantic 10,11,59-76-5,16.83
198,East Texas A&M University,Southland,9,60-51-2,16.69
199,Samford University,Southern,11,67-63-1,16.66
200,Gardner-Webb University,Big South,11,67-66-2,16.53
201,University of Missouri - Kansas City,Summit,10,49-63-2,16.39
202,Utah Valley University,WAC,11,57-100-3,16.23
203,Long Island University,Northeast,12,69-64-4,16.21
204,University of Hawaii at Manoa,Big West,9,39-118-6,16.18
205,Fairfield University,Metro Atlantic,10,86-30-3,16.08
206,Weber State University,Big Sky,9,65-65-3,16.04
207,Murray State University,Missouri Valley,12,97-61-2,15.98
208,Oakland University,Horizon,11,63-55-4,15.88
209,Queens University of Charlotte,ASUN,9,49-63-4,15.77
210,University of Texas at Arlington,WAC,11,27-138-1,15.75
211,Houston Christian University,Southland,11,56-68-0,15.58
212,Southern Illinois University Edwardsville,Ohio Valley,11,75-74-1,15.43
213,University of Northern Colorado,Big Sky,11,58-87-4,15.40
214,Drake University,Missouri Valley,11,61-75-2,15.38
215,"California State University, Fullerton",Big West,11,46-122-2,15.32
216,Iona University,Metro Atlantic,13,106-55-5,15.15
217,University of Nebraska at Omaha,Summit,11,66-77-1,14.74
218,Utah State University,Mountain West,10,38-108-7,14.72
219,High Point University,Big South,10,36-70-1,14.70
220,Towson University,Coastal Athletic,9,48-64-0,14.50
221,University of North Dakota,Summit,10,43-54-1,14.36
222,"California State University, Northridge",Big West,11,55-126-1,14.07
223,Army West Point,Patriot,11,30-83-1,13.88
224,Ohio University,Mid-American,11,42-78-5,13.81
225,North Carolina A&T University,Coastal Athletic,12,51-47-1,13.78
226,Old Dominion University,Sun Belt,10,45-91-1,13.60
227,Eastern Washington University,Big Sky,10,20-117-2,13.60
228,University of Pennsylvania,Ivy,10,45-65-1,13.41
229,Radford University,Big South,10,52-72-4,13.36
230,Presbyterian College,Big South,12,43-88-1,13.34
231,Charleston Southern University,Big South,10,44-80-0,13.28
232,University of South Carolina Upstate,Big South,11,26-89-0,13.26
233,Southeastern Louisiana University,Southland,11,62-60-1,13.24
234,Florida A&M University,SWAC,12,50-55-1,13.18
235,University of the Incarnate Word,Southland,9,37-91-2,13.17
236,"University of California, Irvine",Big West,11,31-141-1,13.07
237,Lehigh University,Patriot,10,61-45-3,12.97
238,Columbia University,Ivy,11,59-67-5,12.97
239,"University of California, Riverside",Big West,10,23-115-4,12.78
240,Belmont University,Missouri Valley,13,64-93-8,12.75
241,Morehead State University,Ohio Valley,13,65-69-2,12.73
242,Saint Joseph's University,Atlantic 10,12,53-84-4,12.39
243,Fairleigh Dickinson University,Northeast,9,61-53-2,12.38
244,Siena University,Metro Atlantic,11,58-69-5,12.37
245,LaSalle University,Atlantic 10,11,66-58-7,12.23
246,Lafayette College,Patriot,12,56-69-3,12.21
247,University of Evansville,Missouri Valley,11,56-44-4,12.10
248,Francis Marion University,Big South,10,27-104-1,12.07
249,Davidson College,Atlantic 10,10,18-119-1,12.04
250,University of New Orleans,Southland,11,42-77-2,11.92
251,"Purdue University, Fort Wayne",Horizon,12,60-85-5,11.87
252,Bowling Green State,Mid-American,11,35-90-5,11.78
253,Sacred Heart University,Metro Atlantic,12,60-73-4,11.77
254,Cleveland State University,Horizon,10,54-61-1,11.73
255,University of West Georgia,ASUN,11,44-113-0,11.62
256,IU Indianapolis,Horizon,12,57-73-0,11.49
257,Marshall University,Sun Belt,10,33-88-8,11.49
258,Central Michigan University,Mid-American,13,35-110-3,11.48
259,University of Wisconsin-Green Bay,Horizon,10,44-48-1,11.35
260,Bradley University,Missouri Valley,10,41-75-3,11.05
261,Youngstown State University,Horizon,12,64-64-2,10.83
262,Southern Utah University,WAC,11,29-134-1,10.75
263,U.S. Air Force Academy,Mountain West,11,19-132-1,10.75
264,Robert Morris University,Horizon,10,45-87-3,10.50
265,Temple University,American,12,37-102-3,10.49
266,Lindenwood University,Ohio Valley,9,38-63-3,10.46
267,Valparaiso University,Missouri Valley,11,22-129-4,10.28
268,Binghamton University,America East,12,64-70-2,10.15
269,Bryant University,America East,11,54-67-3,9.86
270,College of the Holy Cross,Patriot,9,41-75-2,9.78
271,Colgate University,Patriot,11,65-81-2,9.57
272,University of Detroit Mercy,Horizon,10,32-64-0,9.55
273,Dartmouth College,Ivy,10,44-77-1,9.44
274,Providence College,Big East,10,24-92-1,9.36
275,Northern Kentucky University,Horizon,10,26-86-0,9.27
276,Nicholls State University,Southland,10,23-92-5,9.09
277,Mount St. Mary's University,Metro Atlantic,10,46-78-2,9.05
278,Bucknell University,Patriot,10,30-105-2,8.86
279,St. Bonaventure University,Atlantic 10,11,47-85-0,8.57
280,Bellarmine University,ASUN,11,21-98-1,8.48
281,Fordham University,Atlantic 10,11,37-81-5,7.99
282,University of New Haven,Northeast,9,31-43-4,7.92
283,University of Northern Iowa,Missouri Valley,10,14-92-0,7.91
284,Cornell University,Ivy,9,17-79-3,7.82
285,Western Illinois University,Ohio Valley,9,22-51-0,7.81
286,Le Moyne College,Northeast,12,52-81-3,7.73
287,Missouri State University,Conference USA,12,23-120-1,7.69
288,Manhattan University,Metro Atlantic,12,56-76-2,7.61
289,Niagara University,Metro Atlantic,9,40-41-3,7.41
290,University of Southern Indiana,Ohio Valley,12,20-114-2,7.25
291,Prairie View A&M University,SWAC,10,26-64-1,6.94
292,Monmouth University,Coastal Athletic,9,32-63-4,6.79
293,Eastern Illinois University,Ohio Valley,10,17-77-3,6.64
294,Hofstra University,Coastal Athletic,9,21-54-2,6.63
295,University of Arkansas at Pine Bluff,SWAC,11,28-52-3,6.45
296,Mercyhurst University,Northeast,9,18-52-4,6.31
297,University of Maryland Eastern Shore,MEAC,10,26-87-2,6.08
298,Alabama State University,SWAC,11,22-53-0,5.81
299,Rider University,Metro Atlantic,10,16-85-3,5.77
300,Alabama A&M University,SWAC,10,20-34-0,5.58
301,Tennessee State University,Ohio Valley,8,7-63-2,5.57
302,North Carolina Central University,MEAC,9,14-59-0,5.33
303,Merrimack College,Metro Atlantic,8,11-67-1,5.31
304,Wagner College,Northeast,7,12-54-1,4.96
305,Texas Southern University,SWAC,8,14-57-0,4.81
306,Saint Peter's University,Metro Atlantic,9,4-65-2,4.20
307,Canisius University,Metro Atlantic,10,7-103-1,4.14
308,Southern University,SWAC,9,10-49-1,4.11
309,Chicago State University,Northeast,10,7-71-2,3.60
310,Saint Francis University,Northeast,11,2-131-1,3.18
311,Jackson State University,SWAC,9,3-54-0,1.96`;

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

function parseRankingsCsv(csv) {
  const lines = csv.trim().split('\n');
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return {
      sourceRank: Number(cells[0]),
      team: cells[1].trim(),
      conf: cells[2].trim(),
      events: Number(cells[3]),
      record: cells[4].trim(),
      avgPts: Number(cells[5]),
    };
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildRoster() {
  const rows = parseRankingsCsv(RANKINGS_CSV);
  const avgPtsValues = rows.map((row) => row.avgPts);
  const maxAvgPts = Math.max(...avgPtsValues);
  const minAvgPts = Math.min(...avgPtsValues);
  const spread = maxAvgPts - minAvgPts;

  const usedIds = new Set();
  return rows.map((row) => {
    let id = slugify(row.team);
    let n = 2;
    while (usedIds.has(id)) {
      id = `${slugify(row.team)}-${n}`;
      n += 1;
    }
    usedIds.add(id);

    return {
      id,
      name: row.team,
      mascot: null, // not in the source data
      conf: row.conf,
      strength: Math.round((100 * (row.avgPts - minAvgPts)) / spread),
      sourceRank: row.sourceRank,
      record: row.record,
      events: row.events,
      avgPts: row.avgPts,
    };
  });
}

// One entry per team, strength (0-100) already derived. Consumed by
// recruiting.js, which layers threshold/prestigeRank on top.
export const COLLEGE_ROSTER = buildRoster();
