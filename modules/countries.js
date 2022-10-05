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
  ],

  hardLevel: [
    "Bolivia",
    "Egypt",
    "Costa rica",
    "Peru",
    "Paraguay",
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
    // "Monaco",
    "Lebanon",
    "Qatar",
    "Luxembourg",
    "Algeria",
    "Cameroon",
    "Ivory coast",
    "Palestine",
    "Philippines",
    "Senegal",
    "Tanzania",
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
  

  // Dificuldade: 0 = fácil, 1 = médio, 2 = díficil
  // Se não indicarmos nível de dificuldade, será aleatório
  getRandomCountry(level) {

    const difficultyLevel = this.pickDifficulty(level);
    let country = difficultyLevel[randomNumFrom(difficultyLevel)];
    
    while (country === latestCurrentCountry) {
      // DEBUG, COMPARAR PAÍSES SORTEADOS
      // console.log("País repetido?", country === latestCurrentCountry);
      // console.log(`País: ${country}, Último país: ${latestCurrentCountry}`);

      country = difficultyLevel[randomNumFrom(difficultyLevel)];
    };
    
    latestCurrentCountry = country;
    return country;
  },

};

export default countries;