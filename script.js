import randomNumFrom from "./modules/methods.js";
import countries from "./modules/countries.js";

//////////////////////
/// HTML Elements ///
//////////////////////

const splashScreen = document.querySelector(".splash__screen");
const allQuestions = document.querySelectorAll(".select__question");
const playButton = document.querySelector(".play__button");
const mainContainer = document.querySelector(".main__container");

const quiz = {

  //////////////////////
  /// Game Variables ///
  //////////////////////

  currentQuestion: undefined,
  question: null,
  questionPlaceholder: undefined,
  currentCountries: [],
  currentQuestionNumber: 0,
  calls: undefined,


  ///////////
  /// API ///
  ///////////

  async getCountryData(country) {
    const response = await fetch(`https://restcountries.com/v2/name/${country}`);
    const [countryData] = await response.json();
    
    return { [country]: countryData };
  },


  ///////////////
  /// Effects ///
  ///////////////

  toggleHidden() {
    mainContainer.classList.toggle("scaleDown");
    mainContainer.classList.toggle("hidden");
  },


  /////////////////
  /// Game Init ///
  /////////////////
  

  initTimer(difficulty) {

    const currentProgressBar = this.currentQuestion.querySelector(".progress__bar");
    let time = 100;

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) clearTimeout(timer);
    }, difficulty);

  },


  getRandomQuestion() {
    // Obtendo número aleatório a partir do tamanho de allQuestions
    const randomNumber = randomNumFrom(allQuestions);

    // Obtendo pergunta de acordo com número aleatório
    this.currentQuestion = allQuestions[randomNumber];
  },

  
  increaseQuestionNumber() {
    // Aumentar pergunta
    this.currentQuestionNumber++

    // E inserir no HTML
    this.currentQuestion.querySelector(".question__number").textContent = this.currentQuestionNumber;
  },
 

  fetchCountries() {

    // Parei aqui 
    // Falta impedir que obtenhamos países repetidos e também na pergunta sobre capital mudar para nome da capital
    // if (!this.currentCountries.includes(countryData)) {

    // };

    this.currentCountries = [];
    this.calls = Number(this.currentQuestion.getAttribute("data-calls"));
    
    while (this.calls > 0) {

      const currentCountry = countries.getRandomCountry();
      this.getCountryData(currentCountry)
        .then(data => {
          this.currentCountries.push(data);
        })
      ;

      this.calls--;
    };

  },


  renderFlag() {
    const flagPlaceHolders = this.currentQuestion.querySelectorAll("img");
    
     flagPlaceHolders.forEach((element, index) => {
      const countryName = Object.keys(this.currentCountries[index]);
      element.src = this.currentCountries[index][countryName].flag;
    });
  },
  

  loadQuestion() {

    let correctCountry;

    // Gerando pergunta aleatória
    this.getRandomQuestion();

    // Aumentando pergunta
    this.increaseQuestionNumber();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    this.questionPlaceholder = this.currentQuestion.querySelector(".question__placeholder");
    
    // Obtendo país(es)
    this.fetchCountries();

    // Colocando cursor diretamente no campo da resposta (pode não haver)
    // this.currentQuestion?.querySelector(".input__answer").focus();
      
    // Lembrando que arrow function não possui sua própria this keyword
    setTimeout(() => {

      // Selecionando país que será a resposta correta
      if (this.currentCountries.length > 1) {
        correctCountry = this.currentCountries[randomNumFrom(this.currentCountries)];
      };

      if (this.currentCountries.length === 1) correctCountry = this.currentCountries[0];

      // Colocando nome do país nas questões com question__placeholder
      if (this.questionPlaceholder) this.questionPlaceholder.textContent = String(Object.keys(correctCountry));

      // Mostrando pergunta randomizada
      this.currentQuestion.classList.remove("hide__all");

      // Exibindo bandeira(s)
      this.renderFlag();

      // Iniciando Timer - 325ms === +/- 7 segundos
      this.initTimer(325);

      // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
      this.toggleHidden();

    }, 1500);

  },


  //////////////////
  /// Game Logic ///
  //////////////////




};

/////////////////////////////////////////////////////

playButton.addEventListener("click", function(event) {

  // Escondendo Splash Screen 
  splashScreen.classList.add("hide__all");
  
  // Escondendo mainContainer
  quiz.toggleHidden();

  quiz.loadQuestion();

});



















