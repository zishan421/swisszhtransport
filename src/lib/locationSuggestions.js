const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const popularSwissLocations = [
  {
    place_id: "ch-zurich-airport",
    description: "Zurich Airport (ZRH), Switzerland",
    coordinates: [8.5555, 47.4504],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Zurich Airport (ZRH)",
      secondary_text: "Kloten, Zurich, Switzerland",
    },
  },
  {
    place_id: "ch-zurich-hb",
    description: "Zurich HB, Bahnhofplatz, Switzerland",
    coordinates: [8.5402, 47.3779],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Zurich HB",
      secondary_text: "Bahnhofplatz, Zurich, Switzerland",
    },
  },
  {
    place_id: "ch-geneva-airport",
    description: "Geneva Airport (GVA), Switzerland",
    coordinates: [6.1092, 46.237],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Geneva Airport (GVA)",
      secondary_text: "Route de l'Aéroport, Geneva, Switzerland",
    },
  },
  {
    place_id: "ch-basel",
    description: "Basel, Switzerland",
    coordinates: [7.5886, 47.5596],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Basel",
      secondary_text: "Basel-Stadt, Switzerland",
    },
  },
  {
    place_id: "ch-lucerne",
    description: "Lucerne, Switzerland",
    coordinates: [8.3093, 47.0502],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Lucerne",
      secondary_text: "Canton of Lucerne, Switzerland",
    },
  },
  {
    place_id: "ch-bern",
    description: "Bern, Switzerland",
    coordinates: [7.4474, 46.948],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Bern",
      secondary_text: "Canton of Bern, Switzerland",
    },
  },
  {
    place_id: "ch-interlaken",
    description: "Interlaken, Switzerland",
    coordinates: [7.8632, 46.6863],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Interlaken",
      secondary_text: "Bern, Switzerland",
    },
  },
  {
    place_id: "ch-st-moritz",
    description: "St. Moritz, Switzerland",
    coordinates: [9.8355, 46.4908],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "St. Moritz",
      secondary_text: "Graubünden, Switzerland",
    },
  },
  {
    place_id: "ch-lugano",
    description: "Lugano, Switzerland",
    coordinates: [8.9536, 46.0037],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Lugano",
      secondary_text: "Ticino, Switzerland",
    },
  },
  {
    place_id: "ch-zermatt",
    description: "Zermatt, Switzerland",
    coordinates: [7.7491, 45.9765],
    countryCode: "CH",
    source: "local",
    structured_formatting: {
      main_text: "Zermatt",
      secondary_text: "Valais, Switzerland",
    },
  },
];

export const popularEuropeCountries = [
  {
    place_id: "eu-germany",
    description: "Germany",
    countryCode: "DE",
    coordinates: [10.4515, 51.1657],
    source: "local",
    structured_formatting: {
      main_text: "Germany",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-france",
    description: "France",
    countryCode: "FR",
    coordinates: [2.2137, 46.2276],
    source: "local",
    structured_formatting: {
      main_text: "France",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-italy",
    description: "Italy",
    countryCode: "IT",
    coordinates: [12.5674, 41.8719],
    source: "local",
    structured_formatting: {
      main_text: "Italy",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-austria",
    description: "Austria",
    countryCode: "AT",
    coordinates: [14.5501, 47.5162],
    source: "local",
    structured_formatting: {
      main_text: "Austria",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-liechtenstein",
    description: "Liechtenstein",
    countryCode: "LI",
    coordinates: [9.5554, 47.166],
    source: "local",
    structured_formatting: {
      main_text: "Liechtenstein",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-milan",
    description: "Milan, Italy",
    countryCode: "IT",
    coordinates: [9.19, 45.4642],
    source: "local",
    structured_formatting: {
      main_text: "Milan",
      secondary_text: "Lombardy, Italy",
    },
  },
  {
    place_id: "eu-paris",
    description: "Paris, France",
    countryCode: "FR",
    coordinates: [2.3522, 48.8566],
    source: "local",
    structured_formatting: {
      main_text: "Paris",
      secondary_text: "Île-de-France, France",
    },
  },
  {
    place_id: "eu-munich",
    description: "Munich, Germany",
    countryCode: "DE",
    coordinates: [11.582, 48.1351],
    source: "local",
    structured_formatting: {
      main_text: "Munich",
      secondary_text: "Bavaria, Germany",
    },
  },
  {
    place_id: "eu-monaco",
    description: "Monaco",
    countryCode: "MC",
    coordinates: [7.4246, 43.7384],
    source: "local",
    structured_formatting: {
      main_text: "Monaco",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-luxembourg",
    description: "Luxembourg",
    countryCode: "LU",
    coordinates: [6.1296, 49.8153],
    source: "local",
    structured_formatting: {
      main_text: "Luxembourg",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-netherlands",
    description: "Netherlands",
    countryCode: "NL",
    coordinates: [5.2913, 52.1326],
    source: "local",
    structured_formatting: {
      main_text: "Netherlands",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-belgium",
    description: "Belgium",
    countryCode: "BE",
    coordinates: [4.4699, 50.5039],
    source: "local",
    structured_formatting: {
      main_text: "Belgium",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-united-kingdom",
    description: "United Kingdom",
    countryCode: "GB",
    coordinates: [-3.436, 55.3781],
    source: "local",
    structured_formatting: {
      main_text: "United Kingdom",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-spain",
    description: "Spain",
    countryCode: "ES",
    coordinates: [-3.7492, 40.4637],
    source: "local",
    structured_formatting: {
      main_text: "Spain",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-portugal",
    description: "Portugal",
    countryCode: "PT",
    coordinates: [-8.2245, 39.3999],
    source: "local",
    structured_formatting: {
      main_text: "Portugal",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-poland",
    description: "Poland",
    countryCode: "PL",
    coordinates: [19.1451, 51.9194],
    source: "local",
    structured_formatting: {
      main_text: "Poland",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-czech-republic",
    description: "Czech Republic",
    countryCode: "CZ",
    coordinates: [15.473, 49.8175],
    source: "local",
    structured_formatting: {
      main_text: "Czech Republic",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-denmark",
    description: "Denmark",
    countryCode: "DK",
    coordinates: [9.5018, 56.2639],
    source: "local",
    structured_formatting: {
      main_text: "Denmark",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-sweden",
    description: "Sweden",
    countryCode: "SE",
    coordinates: [18.6435, 60.1282],
    source: "local",
    structured_formatting: {
      main_text: "Sweden",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-norway",
    description: "Norway",
    countryCode: "NO",
    coordinates: [8.4689, 60.472],
    source: "local",
    structured_formatting: {
      main_text: "Norway",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-finland",
    description: "Finland",
    countryCode: "FI",
    coordinates: [25.7482, 61.9241],
    source: "local",
    structured_formatting: {
      main_text: "Finland",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-ireland",
    description: "Ireland",
    countryCode: "IE",
    coordinates: [-8.2439, 53.4129],
    source: "local",
    structured_formatting: {
      main_text: "Ireland",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-croatia",
    description: "Croatia",
    countryCode: "HR",
    coordinates: [15.2, 45.1],
    source: "local",
    structured_formatting: {
      main_text: "Croatia",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-greece",
    description: "Greece",
    countryCode: "GR",
    coordinates: [21.8243, 39.0742],
    source: "local",
    structured_formatting: {
      main_text: "Greece",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-hungary",
    description: "Hungary",
    countryCode: "HU",
    coordinates: [19.5033, 47.1625],
    source: "local",
    structured_formatting: {
      main_text: "Hungary",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-slovakia",
    description: "Slovakia",
    countryCode: "SK",
    coordinates: [19.699, 48.669],
    source: "local",
    structured_formatting: {
      main_text: "Slovakia",
      secondary_text: "Country in Europe",
    },
  },
  {
    place_id: "eu-slovenia",
    description: "Slovenia",
    countryCode: "SI",
    coordinates: [14.9955, 46.1512],
    source: "local",
    structured_formatting: {
      main_text: "Slovenia",
      secondary_text: "Country in Europe",
    },
  },
];

export function normalizePredictions(predictions) {
  return Array.isArray(predictions) ? predictions : [];
}

export function getSuggestedLocations(query = "", europeMode = false) {
  const search = normalize(query.trim());
  const pool = europeMode ? popularEuropeCountries : popularSwissLocations;
  if (!search) {
    return pool.slice(0, 8);
  }
  return pool
    .filter(
      (loc) =>
        normalize(loc.description).includes(search) ||
        normalize(loc.structured_formatting?.main_text).includes(search) ||
        normalize(loc.countryCode || "").includes(search),
    )
    .slice(0, 8);
}
