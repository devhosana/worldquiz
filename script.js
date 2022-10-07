import randomNumFrom from "./modules/methods.js";
import countries from "./modules/countries.js";


//////////////////////
/// HTML Elements ///
//////////////////////

const splashScreen = document.querySelector(".splash__screen");
const allQuestions = document.querySelectorAll(".select__question");
const playButton = document.querySelector(".play__button");
const mainContainer = document.querySelector(".main__container");

//////////////////////
/// Game Variables ///
//////////////////////

let questionPlaceholder;
let currentQuestion;
let currentCountries;
let flagPlaceHolders;
let randomQuestionNum;

let currentQuestionNumber = 0;
let calls;

// Para cortar depois DC de Washington DC
const space = " ";

const quiz = {

  ///////////
  /// API ///
  ///////////

  async fetchCountry(countries) {

    let data;

    // Perguntas com um país somente
    if (countries.length === 1) {
      data = await fetch(`https://restcountries.com/v2/name/${countries[0]}`);
      const [countryData] = await data.json();
      
      currentCountries[0] = countryData;
    };
    
    // Perguntas com mais de um país
    if (countries.length > 1) {

      data = await Promise.all([
        fetch(`https://restcountries.com/v2/name/${countries[0]}`)
           .then(response => response.json()),
        fetch(`https://restcountries.com/v2/name/${countries[1]}`)
           .then(response => response.json()),
        fetch(`https://restcountries.com/v2/name/${countries[2]}`)
           .then(response => response.json()),
        fetch(`https://restcountries.com/v2/name/${countries[3]}`)
           .then(response => response.json()),
      ]);

      data.forEach((countryData, index) => {
        currentCountries[index] = countryData[0];
      });

    };

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

    const currentProgressBar = currentQuestion.querySelector(".progress__bar");
    let time = 100;

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) clearTimeout(timer);
    }, difficulty);

  },


  getRandomQuestion() {
    randomQuestionNum = randomNumFrom(allQuestions);

    // DEBUG ESCOLHER PERGUNTA OU VER QUAL FOI SORTEADA
    // 0 - De qual país é essa bandeira
    // 1 - Qual a capital desse país
    // 2 - Nomeie um país que faça fronteira com este
    // 3 - Berlin é a capital de qual destes países?
    // 4 - Em qual continente esse país fica
    // 5 - Qual destas 4 é a bandeira da Alemanha?

    // Parei aqui, precisamos impedir que países que sejam ilhas sejam sorteados na pergunta 2
    // console.log(randomQuestionNum);
    // randomQuestionNum = 2;

    currentQuestion = allQuestions[randomQuestionNum];
  },

  
  increaseQuestionNumber() {
    // Aumentar pergunta
    currentQuestionNumber++

    // E inserir no HTML
    currentQuestion.querySelector(".question__number").textContent = currentQuestionNumber;
  },
 
  // DEBUG - ESCOLHER PAÍS P/ TESTES
  // const currentCountry = "Portugal";
  

  getCountry() {
    
    let temp = new Set();

    while (temp.size < flagPlaceHolders.length)  {
      const currentCountry = countries.getRandomCountry();
      temp.add(currentCountry);
    };

    currentCountries = [...temp];

    this.fetchCountry(currentCountries);

  },


  renderFlag() {
    flagPlaceHolders.forEach((element, index) => {
      element.src = currentCountries[index].flag;
      // console.log(currentCountries[index]);
    });
  },
  

  loadQuestion() {

    let correctCountry;

    // Gerando pergunta aleatória
    this.getRandomQuestion();

    // Aumentando pergunta
    this.increaseQuestionNumber();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    questionPlaceholder = currentQuestion.querySelector(".question__placeholder");
    
    // Obter número de bandeiras para definir quantas fetchs faremos
    flagPlaceHolders = currentQuestion.querySelectorAll(".flag__img");

    // Limpar países anteriormente randomizados
    currentCountries = null;
    
    // Obtendo país(es)
    this.getCountry();

    
    // Colocando cursor diretamente no campo da resposta (pode não haver)
    // currentQuestion?.querySelector(".input__answer").focus();
      
    // Lembrando que:
    // Arrow function não possui sua própria this keyword
    // setTimeOut é assíncrono
    setTimeout(() => {

      // Selecionando país que será a resposta correta
      if (currentCountries.length > 1) {
        correctCountry = currentCountries[randomNumFrom(currentCountries)];
      };

      if (currentCountries.length === 1) correctCountry = currentCountries[0];

      // Colocando nome do país nas questões com question__placeholder
      if (questionPlaceholder && !questionPlaceholder.textContent.includes("Berlin")) {
        questionPlaceholder.textContent =correctCountry.name;
      };
      
      if (questionPlaceholder?.textContent.includes("Berlin")) {
        // console.log("Pergunta sobre capital");
        questionPlaceholder.textContent = correctCountry.capital;
      };

      // Mostrando pergunta randomizada
      currentQuestion.classList.remove("hide__all");

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



















