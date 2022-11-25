import randomNumFrom from "./modules/methods.js";
import countries from "./modules/countries.js";

//////////////////////
/// HTML Elements ///
//////////////////////

const splashScreen = document.querySelector(".splash__screen");
const againScreen = document.querySelector(".play__again");
const playAgainButton = document.querySelector(".button__again");
const scoreElement = document.querySelector(".score__text");
const allQuestions = document.querySelectorAll(".select__question");
const playButton = document.querySelector(".play__button");
const mainContainer = document.querySelector(".main__container");

// console.log("#DEBUGGING");

//////////////////////
/// Game Variables ///
//////////////////////


let currentQuestionPlaceholder;
let currentQuestion;
let previousQuestion;
let currentInput;
let currentCountries;
let currentNeighbours = [];
let correctCountry;
let currentFlagPlaceholders;
let flagsContainer;
let randomQuestionNum;
let playerAnswer;
let score = 0;

let timeOver = false;
let currentQuestionNumber = 0;
 

const quiz = {

  getRandomQuestion() {

    randomQuestionNum = randomNumFrom(allQuestions);
    
    while (randomQuestionNum === previousQuestion) randomQuestionNum = randomNumFrom(allQuestions);

    previousQuestion = randomQuestionNum;

    // DEBUG P/ ESCOLHER PERGUNTA OU VER QUAL FOI SORTEADA
    // 0 - Marque o país que pertence que a Europa
    // 1 - Berlin é a capital de qual destes países?
    // 2 - Qual destas 4 é a bandeira da Esbórnia?
    // 3 - Nomeie um país que faça fronteira com este
    // 4 - De qual país é essa bandeira
    // 5 - Qual a capital desse país

    randomQuestionNum = 0;
    // console.log(`---- Pergunta atual: ${randomQuestionNum} ----`);

    currentQuestion = allQuestions[randomQuestionNum];
  
  },

  assignVariables() {

    this.getRandomQuestion();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    currentQuestionPlaceholder = currentQuestion.querySelector(".question__placeholder");

    // Obter número de bandeiras para definir quantas fetchs faremos
    currentFlagPlaceholders = currentQuestion.querySelectorAll(".flag__img");

  },


  async fetchNJSON(countryCode) {

    return await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then(response => {
        return response.json();
      })
      .then(data => data[0])
    ;

  },


  async fetchCountries(countries, neighbours) {

    if (!neighbours) {
      return currentCountries = await Promise.all(
        countries.map(country => {
          return this.fetchNJSON(country);
        })
      );
    };

    if (neighbours) {
      return currentNeighbours = await Promise.all(
        countries.map(country => {
          return this.fetchNJSON(country);
        })
      );
    };
 
  },


  toggleHidden() {
    mainContainer.classList.toggle("scaleDown");
    mainContainer.classList.toggle("hidden");
  },

  
  increaseQuestionNumber() {
    // Aumentar pergunta
    currentQuestionNumber++

    // E inserir no HTML
    currentQuestion.querySelector(".question__number").textContent = currentQuestionNumber;
  },


  getCountries() {
    
    let temp = new Set();
    let currentCountry;
    
    ////////////////////////////////////////////////////////

    /// Sortear 4 regiões diferentes na pergunta 1 ///
    while (randomQuestionNum === 0 && temp.size < currentFlagPlaceholders.length) {

      currentCountry = countries.getRandomCountry();

      const regionIsRepeated = 
        [...temp].some(value => value.region === currentCountry.region)
      ;
      
      if (regionIsRepeated) {
        currentCountry = countries.getRandomCountry();
      } else {
        // Cortei países que fazem partes de dois continentes como Turquia e Russia
        if (currentCountry.region.includes(" ")) continue;
        temp.add(currentCountry);
      };
      
    };

    if (randomQuestionNum > 0) {

      while (temp.size < currentFlagPlaceholders.length) {
      
        currentCountry = countries.getRandomCountry();
        
        /// Impedir que ilhas sejam sorteadas na perguntas 3 ///
        while (randomQuestionNum === 3 && currentCountry.island) {
          currentCountry = countries.getRandomCountry();
        };
        
        temp.add(currentCountry);
  
      };


    };

    [...temp].forEach(country => console.log(country.region));

    currentCountries = [...temp].map(country => country.code);

    console.log(currentCountries);
    
    // DEBUG - ESCOLHER PAÍS P/ TESTES
    // currentCountries = [{code: "DZA", island: false}];
    // console.log(currentCountries);
    

  },


  renderFlags() {
    currentFlagPlaceholders.forEach((element, index) => {
      element.src = currentCountries[index].flags.svg;
    });
  },


  storeAnswer() {

    flagsContainer = currentQuestion.querySelector(".flags__container--2");
    currentInput = currentQuestion.querySelector(".input__answer");

    let previousUserSelection;
    
    // Se pergunta for com resposta selecionável
    if (flagsContainer) {
      flagsContainer.addEventListener("click", function(event) {

        // Se tempo acabar resposta não é mais possível
        if (timeOver) return;
        
        // Remover seleção anterior
        previousUserSelection?.classList.remove("choice__container--user__choice");
        
        if (event.target.classList.contains("flag__img")) {
          playerAnswer = previousUserSelection = event.target.closest(".choice__container");
          playerAnswer.classList.add("choice__container--user__choice");
        };
        
      });
    };
    
    // Se for com input
    if (currentInput) {
      currentInput.addEventListener("input", event => {

        // Se tempo acabar resposta não é mais possível
        if (timeOver) return;

        playerAnswer = this.normalizeString(event.target.value);

      });
    };

  },


  normalizeString(str) {
    const newStr = str
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    ;

    return newStr;
  },

  
  informRightOrWrong(text) {
    const inputField = currentQuestion.querySelector(".input__answer");

    if (inputField) {
      inputField.value = "";
      inputField.placeholder = text;
    };
  },


  removeCurrentCorrectCountry(countryCode) {
    const newArray = countries.allCountries
      .filter(country => {
        return country.code !== countryCode
      })
    ;

    countries.allCountries = newArray;
  },


  verifyAnswer() {

    let isCorrect = false;

    if (randomQuestionNum === 0) {
      if (playerAnswer === this.normalizeString(correctCountry.name.common)) isCorrect = true;
    };
    
    if (randomQuestionNum === 1) {
      if (playerAnswer === this.normalizeString(correctCountry.capital[0])) isCorrect = true;
    }
    
    if (randomQuestionNum === 2) {
      isCorrect = 
        currentNeighbours.some(neighbour => {
          return this.normalizeString(neighbour.name.common) === playerAnswer;
        })
      ;
    };
    
    if (randomQuestionNum === 3 || randomQuestionNum === 5) {
      playerAnswer = playerAnswer?.querySelector(".flag__img");
      if (playerAnswer?.src === correctCountry.flags.svg) isCorrect = true;
    };
    
    if (randomQuestionNum === 4) {
      if (playerAnswer === this.normalizeString(correctCountry.region)) isCorrect = true;
    };

    // Ternary operator acontecerá ou short circuiting 
    if (randomQuestionNum <= 2 || randomQuestionNum === 5) {
      this.informRightOrWrong(isCorrect ? "Correct answer" : "Wrong answer");
      playerAnswer || this.informRightOrWrong("No answer");
    };

    return isCorrect;

  },


  // Promissificar isso posteriormente
  highlightOption(element) {

    setTimeout(() => {
      element.classList.toggle("choice__container--correct__option");
      return setTimeout(() => {
        element.classList.toggle("choice__container--correct__option");
        return setTimeout(() => {
          element.classList.toggle("choice__container--correct__option");
          return setTimeout(() => {
            element.classList.toggle("choice__container--correct__option");
            return setTimeout(() => {
              element.classList.toggle("choice__container--correct__option");
            }, 200);
          }, 200)
        }, 200)
      }, 200);
    }, 200);

  },


  revealCorrectAnswer() {

    // Futuramente respostas corretas serão todas reveladas, nas que contém input e nas de múltipla escolha
    // if (!(randomQuestionNum === 0)) return;

    if (timeOver && randomQuestionNum === 4) {
      currentQuestionPlaceholder.textContent = correctCountry.name.common;
      currentQuestionPlaceholder.classList.remove("hide__correct");
    };

    if (randomQuestionNum <= 2) {
                                                                 
      let correctOption = Array.from(currentFlagPlaceholders)
        .find(element => element.src === correctCountry.flags.svg)
        .closest(".choice__container")
      ;

      if (playerAnswer === correctOption) {
        playerAnswer?.classList.remove("choice__container--user__choice");
      };
      
      if (playerAnswer !== correctOption) {
        playerAnswer?.classList.add("choice__container--wrong__option");
      };
      
      this.highlightOption(correctOption);

    };
      
  },


  finishMatch() {
    currentQuestion.classList.add("hide__all");
    againScreen.classList.remove("hide__all");
    scoreElement.textContent = score;
  },


  evaluateAndAdvance() {

    this.revealCorrectAnswer();

    if (this.verifyAnswer()) score++;

    // Quando jogo acaba
    if (currentQuestionNumber === 10) {

      setTimeout(() => {
        this.toggleHidden();
        
        setTimeout(() => {
          this.finishMatch();
          this.toggleHidden()

        }, 300);

      }, 2000);

      return;

    };

    // Esse por sua vez será removido pois pretendo promissificar verify answer
    setTimeout(() => {
      this.toggleHidden();
      if (currentQuestionNumber > 0) this.resetForNewQuestion();

      setTimeout(() => this.loadQuestion(), 300);

    }, 1800);

  }, 


  initTimer(duration) {

    const currentProgressBar = currentQuestion.querySelector(".progress__bar");
    let time = 100;

    // Esconder campo da resposta correta se pergunta for a primeira
    if (currentQuestion === allQuestions[0]) currentQuestionPlaceholder.classList.add("hide__correct");
    
    currentProgressBar.style.backgroundColor = "rgba(78, 248, 10, 0.75)";

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) {

        clearTimeout(timer);
        timeOver = true;

        this.evaluateAndAdvance();
        
      };

    }, duration);

  },


  fillCountryNamePlaceholder() {

    if (randomQuestionNum === 0) {
      currentQuestionPlaceholder.textContent = correctCountry.region;
    };
    
    if (randomQuestionNum === 1) {
      currentQuestionPlaceholder.textContent = correctCountry.capital[0];
    };

    // Aqui não queremos que nome do país seja exibido se pergunta for a 5
    // Nesta nome correto só será exbido quando tempo acabar
    if (randomQuestionNum > 1 && randomQuestionNum < 5) {
      currentQuestionPlaceholder.textContent = correctCountry.name.common;
    };

  },


  assignCorrectCountry() {

    if (currentCountries.length === 1) {
      correctCountry = currentCountries[0];
      
      // Se pergunta for sobre fronteiras
      if (randomQuestionNum === 3) {
        this.fetchCountries(correctCountry.borders, "neighbours");
      };

    };
    
    if (currentCountries.length > 1) {
      correctCountry = currentCountries[randomNumFrom(currentCountries)];
    };

  },


  shuffleCountries() {
    countries.allCountries.sort(() => Math.random() - 0.5);
  },


  resetForNewQuestion() {

    currentQuestion.classList.add("hide__all");

    // Função também é útil p/ resetar textp do campo input
    this.informRightOrWrong("Your answer");

    // Colocar IF aqui para que isso ocorra somente se pergunta 3 ou 5 forem as previousQuestion
    const highlight1 = document.querySelector(".choice__container--correct__option");
    const highlight2 =  document.querySelector(".choice__container--wrong__option");
    const highlight3 =  document.querySelector(".choice__container--user__choice");
  
    highlight1?.classList.remove("choice__container--correct__option");
    highlight2?.classList.remove("choice__container--wrong__option");
    highlight3?.classList.remove("choice__container--user__choice");
    

    // removeHighlight?.classList.remove("choice__container--correct__option");
    
    // correctCountry = null;

    // Limpar países anteriormente randomizados e vizinhos
    currentCountries = [];

    currentNeighbours = [];

    flagsContainer = undefined;

    timeOver = false;

    playerAnswer = undefined;

    if (currentInput) currentInput.value = ""; 
    
  },


  loadQuestion() {

    this.assignVariables();
    
    this.increaseQuestionNumber();
    
    this.shuffleCountries();

    this.getCountries();

    this.fetchCountries(currentCountries)
      .finally(() => {

        this.renderFlags();

        this.assignCorrectCountry();

        this.fillCountryNamePlaceholder();

        this.removeCurrentCorrectCountry(correctCountry.cca3);

        // Pergunta aleatória aparece
        currentQuestion.classList.remove("hide__all");

        this.storeAnswer();
    
        // Iniciando Timer - 300ms === +/- 7 segundos
        this.initTimer(200000);
    
        // DEBUG P/ PERGUNTA 2 sobre fronteiras
        // currentNeighbours.forEach(country => console.log(country));
    
        // Colocando cursor diretamente no campo da resposta (pode não haver)
        // Causando problemas em tablets, voltará depois disso solucionado
        // currentQuestion.querySelector(".input__answer")?.focus();
        
        // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
        this.toggleHidden();

        // DEBUG P/ ver embaralhamento de allCountries
        // console.log(countries.allCountries);

      })
      /*
      .catch(error => {
        this.errorHandler(error);
      })
      */
    ;

  },

};

/////////////////////////////////////////////////////

playButton.addEventListener("click", function() {

  // Escondendo Splash Screen 
  splashScreen.classList.add("hide__all");

  quiz.shuffleCountries();
  
  // Escondendo mainContainer => exibindo novamente c/ pergunta aleatória
  quiz.toggleHidden();

  quiz.loadQuestion();

});

playAgainButton.addEventListener("click", () => {
  document.location.reload(true)
});


// WHAT
// console.log([] == 0);
