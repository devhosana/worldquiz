import randomNumFrom from "./methods.js";

let latestCurrentCountry;

const countries = {

  easyLevel: [
    "Canada", 
    "United States of America",
    "Mexico",
    "France",
    "Italy",
    "Spain",
    "Germany",
    "Brazil",
    "Argentina",
    "Sweden",
    "Ukraine",
    "Israel",
    "United Kingdom",
    "Ireland",
    "Japan",
    // "Switzerland",
    "Russia",
    "Poland",
    "Netherlands",
    "Belgium",
    "Portugal",
    "Denmark",
    "Australia",
    // "China",
    "Republic of India",
  ],

  mediumLevel: [
    "Colombia",
    "Venezuela",
    "Chile",
    "South Africa",
    "Norway",
    "Greece",
    "Jamaica",
    "Czech Republic",
    "Cuba",
    "Finland",
    "Uruguay",
    "Estonia",
    "Iceland",
    "Ecuador",
    "Austria",
    "Saudi Arabia",
    "Romania",
    "Taiwan",
    "Croatia",
    "Nigeria",
    "Paraguay",
    "New Zealand",
    "Mozambique",
    "Puerto Rico",
    "Egypt",
  ],
  
  hardLevel: [
    "Monaco",
    "Costa Rica",
    "Peru",
    "Angola",
    "Morocco",
    "Turkey",
    "Greenland",
    "Tunisia",
    "Iran",
    "United Arab Emirates",
    "Vietnam",
    "Syria",
    "Malaysia",
    "Indonesia",
    "Singapore",
    "Lebanon",
    "Qatar",
    "Luxembourg",
    "Algeria",
    "Cameroon",
    "Ivory Coast",
    "Palestine",
    "Philippines",
    "Senegal",
    "Iraq",
    "Hungary",
    "Tanzania",
  ],


  get levels() {
    const allLevels = [
      this.easyLevel,
      this.mediumLevel,
      this.hardLevel,
    ];

    return allLevels;
  },

  
  get allCountries() {
    return this.levels.flat();
  },

  islandCountries: [
    "Cuba",
    "Australia",
    "Iceland",
    "Indonesia",
    "Ireland",
    "Jamaica",
    "United Kingdom",
    "Japan",
    "New Zealand",
    "Philippines",
    "Singapore",
    "Greenland",
    "Taiwan",
    "Puerto Rico",
  ],

  randomLevel() {
    const level = randomNumFrom(this.levels);
    return level;
  },

  
  pickDifficulty(level = this.randomLevel()) {
    const difficultyArr = this.levels[level];
    return difficultyArr;
  },
  

  getRandomCountry(level) {
    // P/ DEBUG ESCOLHER DIFICULDADE 
    // 0 - Países dificuldade fácil
    // 1 - Países dificuldade média
    // 2 - Países dificuldade díficil

    // const difficultyLeveL = 1;

    const difficultyLevel = this.pickDifficulty(level);
    let country = difficultyLevel[randomNumFrom(difficultyLevel)];

    return country;
  },

};

export default countries;