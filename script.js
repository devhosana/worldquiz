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


  async getCountryData() {
    const country = countries.getRandomCountry();

    const response = await fetch(`https://restcountries.com/v2/name/${country}`);
    const [countryData] = await response.json();

    return countryData;
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

    this.currentCountries = [];
    this.calls = Number(this.currentQuestion.getAttribute("data-calls"));

    while (this.calls > 0) {
      const countryData = this.getCountryData();

      if (!this.currentCountries.contains(countryData)) {
        this.currentCountries(countryData);
        this.calls--;
      };

      // Parei aqui falta:
      // impedir que países repetidos entrem na array currentCountries (feito, verificar se funciona)
      // Renderizar imagem da bandeiras (logo abaixo)
      // Consertar getCountryData que só retorna promise

    };

  },


  renderFlag() {
    const flagPlaceHolders = this.currentQuestion.querySelectorAll("img");
    console.log(this.currentCountries);
    
    flagPlaceHolders.forEach((element, index) => {
      // element.src = this.currentCountries[index].flag;
    });

  },
  

  loadQuestion() {

    // Gerando pergunta aleatória
    this.getRandomQuestion();

    // Aumentando pergunta
    this.increaseQuestionNumber();

    // Obter place holder da pergunta (pode não haver)
    this.questionPlaceholder = this.currentQuestion.querySelector(".question__placeholder");
    
    // Obtendo país(es)
    this.fetchCountries();

    // Exibindo bandeira(s)
    this.renderFlag();
      
    // Iniciando timer pergunta
    // Lembrando que arrow function não possui sua própria this keyword
    setTimeout(() => {

      // Mostrando pergunta randomizada
      this.currentQuestion.classList.remove("hide__all");

      // Iniciando Timer
      // 500ms === +/- 10 segundos
      // 325ms === +/- 7 segundos
      // 250ms === +/- 5 segundos
      this.initTimer(500);

      // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
      this.toggleHidden();

    }, 1000);

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



















