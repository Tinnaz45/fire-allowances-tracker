export const DISTRICTS = [
  'Central',
  'Northern',
  'Eastern',
  'Southern 1',
  'Southern 2',
  'Western 1',
  'Western 2',
  'Western 3',
  'North & West Regional',
];

export const STATIONS = [
  { id: 1,  name: 'Eastern Hill',        district: 'Central' },
  { id: 2,  name: 'West Melbourne',      district: 'Central' },
  { id: 3,  name: 'Carlton',             district: 'Central' },
  { id: 4,  name: 'Brunswick',           district: 'Central' },
  { id: 8,  name: 'Burnley Complex',     district: 'Central' },
  { id: 10, name: 'Richmond',            district: 'Central' },
  { id: 13, name: 'Northcote',           district: 'Central' },
  { id: 18, name: 'Hawthorn',            district: 'Central' },
  { id: 35, name: 'Windsor',             district: 'Central' },
  { id: 38, name: 'South Melbourne',     district: 'Central' },
  { id: 39, name: 'Port Melbourne',      district: 'Central' },
  { id: 50, name: 'Ascot Vale',          district: 'Central' },

  { id: 5,  name: 'Broadmeadows',        district: 'Northern' },
  { id: 6,  name: 'Pascoe Vale',         district: 'Northern' },
  { id: 7,  name: 'Thomastown',          district: 'Northern' },
  { id: 9,  name: 'Somerton',            district: 'Northern' },
  { id: 11, name: 'Epping',              district: 'Northern' },
  { id: 12, name: 'Preston',             district: 'Northern' },
  { id: 14, name: 'Bundoora',            district: 'Northern' },
  { id: 15, name: 'Heidelberg',          district: 'Northern' },
  { id: 16, name: 'Greensborough',       district: 'Northern' },
  { id: 60, name: 'VEMTC',              district: 'Northern' },
  { id: 80, name: 'Craigieburn',         district: 'Northern' },
  { id: 81, name: 'South Morang',        district: 'Northern' },

  { id: 19, name: 'North Balwyn',        district: 'Eastern' },
  { id: 20, name: 'Box Hill',            district: 'Eastern' },
  { id: 22, name: 'Ringwood',            district: 'Eastern' },
  { id: 23, name: 'Burwood',             district: 'Eastern' },
  { id: 26, name: 'Croydon',             district: 'Eastern' },
  { id: 27, name: 'Nunawading',          district: 'Eastern' },
  { id: 28, name: 'Vermont South',       district: 'Eastern' },
  { id: 30, name: 'Templestowe',         district: 'Eastern' },
  { id: 82, name: 'Eltham City',         district: 'Eastern' },
  { id: 84, name: 'South Warrandyte',    district: 'Eastern' },
  { id: 85, name: 'Boronia',             district: 'Eastern' },

  { id: 24, name: 'Glen Iris (Malvern)', district: 'Southern 1' },
  { id: 25, name: 'Oakleigh',            district: 'Southern 1' },
  { id: 29, name: 'Clayton',             district: 'Southern 1' },
  { id: 31, name: 'Glen Waverley',       district: 'Southern 1' },
  { id: 32, name: 'Ormond',              district: 'Southern 1' },
  { id: 33, name: 'Mentone',             district: 'Southern 1' },
  { id: 34, name: 'Highett',             district: 'Southern 1' },
  { id: 86, name: 'Rowville',            district: 'Southern 1' },
  { id: 89, name: 'Springvale',          district: 'Southern 1' },

  { id: 87, name: 'Dandenong',           district: 'Southern 2' },
  { id: 88, name: 'Hallam',              district: 'Southern 2' },
  { id: 90, name: 'Patterson River',     district: 'Southern 2' },
  { id: 91, name: 'Frankston',           district: 'Southern 2' },
  { id: 92, name: 'Cranbourne',          district: 'Southern 2' },
  { id: 93, name: 'Pakenham',            district: 'Southern 2' },
  { id: 94, name: 'Mornington',          district: 'Southern 2' },
  { id: 95, name: 'Rosebud',             district: 'Southern 2' },

  { id: 40, name: 'Laverton',            district: 'Western 1' },
  { id: 42, name: 'Newport',             district: 'Western 1' },
  { id: 45, name: 'Brooklyn',            district: 'Western 1' },
  { id: 46, name: 'Altona',              district: 'Western 1' },
  { id: 47, name: 'Footscray',           district: 'Western 1' },
  { id: 57, name: 'Tarneit',             district: 'Western 1' },
  { id: 58, name: 'Point Cook',          district: 'Western 1' },
  { id: 59, name: 'Derrimut',            district: 'Western 1' },
  { id: 96, name: 'Derrimut RCRS',       district: 'Western 1' },

  { id: 41, name: 'St Albans',           district: 'Western 2' },
  { id: 43, name: 'Deer Park',           district: 'Western 2' },
  { id: 44, name: 'Sunshine',            district: 'Western 2' },
  { id: 48, name: "Taylor's Lakes",      district: 'Western 2' },
  { id: 51, name: 'Keilor',              district: 'Western 2' },
  { id: 52, name: 'Tullamarine',         district: 'Western 2' },
  { id: 53, name: 'Sunbury',             district: 'Western 2' },
  { id: 54, name: 'Greenvale',           district: 'Western 2' },
  { id: 55, name: 'Caroline Springs',    district: 'Western 2' },
  { id: 56, name: 'Melton',              district: 'Western 2' },

  { id: 61, name: 'Lara',               district: 'Western 3' },
  { id: 62, name: 'Corio',              district: 'Western 3' },
  { id: 63, name: 'Geelong City',       district: 'Western 3' },
  { id: 64, name: 'Belmont',            district: 'Western 3' },
  { id: 66, name: 'Ocean Grove',        district: 'Western 3' },

  { id: 67, name: 'Ballarat City',      district: 'North & West Regional' },
  { id: 68, name: 'Lucas',              district: 'North & West Regional' },
  { id: 70, name: 'Warrnambool',        district: 'North & West Regional' },
  { id: 71, name: 'Portland',           district: 'North & West Regional' },
  { id: 72, name: 'Mildura',            district: 'North & West Regional' },
  { id: 73, name: 'Bendigo',            district: 'North & West Regional' },
];

export function getStationById(id) {
  return STATIONS.find(s => s.id === id) || null;
}

export function getDistrictForStation(id) {
  const s = getStationById(id);
  return s ? s.district : null;
}

export function getStationsForDistrict(district) {
  return STATIONS.filter(s => s.district === district).sort((a, b) => a.id - b.id);
}
