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
    "Ireland",
    "Japan",
    "United Kingdom",
    // "Switzerland",
    "Russia",
    "Poland",
    "Netherlands",
    "Belgium",
    "Portugal",
    // "India",
    "Denmark",
    "Australia",
  ],

  mediumLevel: [
    "Colombia",
    "Venezuela",
    "Chile",
    "South africa",
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
    "Saudi arabia",
    "Romania",
    "Taiwan",
    "Croatia",
    "Nigeria",
    "Paraguay",
  ],

  hardLevel: [
    "Bolivia",
    "Egypt",
    "Costa rica",
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
    "Ivory coast",
    "Palestine",
    "Philippines",
    "Senegal",
    "Iraq",
  ],


  get levels() {
    const allLevels = [
      this.easyLevel,
      this.mediumLevel,
      this.hardLevel,
    ];

    return allLevels;
  },

  
  allCountries() {
    return this.levels.flat();
  },

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