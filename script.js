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
  questionPlaceholder: undefined,
  latestCountry: undefined,
  calls: undefined,
  question: null,
  currentQuestionNumber: 0,
  currentCountries: [],

  // Para cortar depois DC de Washington DC
  space: " ",


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
    const randomQuestionNum = randomNumFrom(allQuestions);

    // DEBUG ESCOLHER PERGUNTA 
    // 0 - De qual país é essa bandeira
    // 1 - Qual a capital desse país
    // 2 - Nomeie um país que faça fronteira com este
    // 3 - Berlin é a capital de qual destes países?
    // 4 - Em qual continente esse país fica
    // 5 - Qual destas 4 é a bandeira da Alemanha?

    // const randomQuestionNum = 3;

    this.currentQuestion = allQuestions[randomQuestionNum];
  },

  
  increaseQuestionNumber() {
    // Aumentar pergunta
    this.currentQuestionNumber++

    // E inserir no HTML
    this.currentQuestion.querySelector(".question__number").textContent = this.currentQuestionNumber;
  },
 

  fetchCountries() {

    this.currentCountries = [];
    this.calls = Number(this.currentQuestion.getAttribute("data-calls"));
    
    while (this.calls > 0) {

      // DEBUG - ESCOLHER PAÍS P/ TESTES
      // const currentCountry = "Portugal";

      // Criar set parar incluir todos os países e só parar quando o tamanho for 4
      
      const currentCountry = countries.getRandomCountry();
      
      this.getCountryData(currentCountry)
        .then(data => this.currentCountries.push(data))
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
      if (this.questionPlaceholder && !this.questionPlaceholder.textContent.includes("Berlin")) {
        this.questionPlaceholder.textContent = String(Object.keys(correctCountry));
      };
      
      if (this.questionPlaceholder?.textContent.includes("Berlin")) {
        // console.log("Pergunta sobre capital");
        this.questionPlaceholder.textContent = correctCountry[Object.keys(correctCountry)].capital;
      };

      // Mostrando pergunta randomizada
      this.currentQuestion.classList.remove("hide__all");

      // Exibindo bandeira(s)
      this.renderFlag();

      // Iniciando Timer - 500ms === +/- 10 segundos
      this.initTimer(500);

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



















