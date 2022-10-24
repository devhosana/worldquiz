import randomNumFrom from "./modules/methods.js";
import countries from "./modules/countries.js";

//////////////////////
/// HTML Elements ///
//////////////////////

const splashScreen = document.querySelector(".splash__screen");
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
let currentChoiceContainers;
let playerAnswer;
let score = 0;

let timeOver = false;
let currentQuestionNumber = 0;
 

const quiz = {

  assignElements() {

    // Obter placeholder do nome do país na pergunta (pode não haver)
    currentQuestionPlaceholder = currentQuestion.querySelector(".question__placeholder");
        
    // Obter containers para seleção de bandeira (pode não haver)
    currentChoiceContainers = currentQuestion.querySelectorAll(".choice__container");

    // Obter número de bandeiras para definir quantas fetchs faremos
    currentFlagPlaceholders = currentQuestion.querySelectorAll(".flag__img");

  },

  // Falta somente mudar array que recebe países caso fizermos fetch da pergunta sobre fronteiras (de currentCountries p/ currentNeighbours)
  async fetchCountries(countries, neighbours) {

    if (!neighbours) {
      
      currentCountries = await Promise.all(
        countries.map(async function(country) {
          return await fetch(`https://restcountries.com/v3.1/alpha/${neighbours ? country : country.code}`)
            .then(response => response.json())
            .then(data => data[0])
          ;
        })
      );

    };

    if (neighbours) {

      currentNeighbours = await Promise.all(
        countries.map(async function(country) {
          return await fetch(`https://restcountries.com/v3.1/alpha/${neighbours ? country : country.code}`)
            .then(response => response.json())
            .then(data => data[0])
          ;
        })
      );

    };
 
  },


  toggleHidden() {
    mainContainer.classList.toggle("scaleDown");
    mainContainer.classList.toggle("hidden");
  },


  getRandomQuestion() {

    randomQuestionNum = randomNumFrom(allQuestions);
    
    while (randomQuestionNum === previousQuestion) randomQuestionNum = randomNumFrom(allQuestions);

    previousQuestion = randomQuestionNum;

    // DEBUG P/ ESCOLHER PERGUNTA OU VER QUAL FOI SORTEADA
    // 0 - De qual país é essa bandeira
    // 1 - Qual a capital desse país
    // 2 - Nomeie um país que faça fronteira com este
    // 3 - Berlin é a capital de qual destes países?
    // 4 - Em qual continente esse país fica
    // 5 - Qual destas 4 é a bandeira da Esbórnia?

    // randomQuestionNum = 2;
    // console.log(`---- Pergunta atual: ${randomQuestionNum} ----`);

    currentQuestion = allQuestions[randomQuestionNum];
  
  },

  
  increaseQuestionNumber() {
    // Aumentar pergunta
    currentQuestionNumber++

    // E inserir no HTML
    currentQuestion.querySelector(".question__number").textContent = currentQuestionNumber;
  },
  

  getCountries() {
    
    let temp = new Set();

    while (temp.size < currentFlagPlaceholders.length)  {
      
      let currentCountry = countries.getRandomCountry();
      
      // Impedir que ilhas sejam sorteadas na pergunta 2
      while (randomQuestionNum === 2 && currentCountry.island) {
        currentCountry = countries.getRandomCountry();
      };
      
      temp.add(currentCountry);
    };

    currentCountries = [...temp];
    
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

  
  rightOrWrong(text) {
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
      this.rightOrWrong(isCorrect ? "Correct answer" : "Wrong answer");
      playerAnswer || this.rightOrWrong("No answer");
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

    if (timeOver && randomQuestionNum === 0) {
      currentQuestionPlaceholder.textContent = correctCountry.name.common;
      currentQuestionPlaceholder.classList.remove("hide__correct");
    };

    // Futuramente, quando pergunta sobre continente for de múltipla escolha
    // if (randomQuestionNum >= 3) {

    if (randomQuestionNum === 5 || randomQuestionNum === 3) {
                                                                 
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


  evaluateAndAdvance() {

    this.revealCorrectAnswer();

    if (this.verifyAnswer()) score++;

    // Esse por sua vez será removido pois pretendo promissificar verify answer
    setTimeout(() => {
      this.toggleHidden();
      if (currentQuestionNumber > 0) this.resetForNewQuestion();

      // Futuramente podemos medir a velocidade da internet e diminuir ou mesmo remover esse delay aqui
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


  obtainCorrectCountry() {

    if (currentCountries.length === 1) {
      correctCountry = currentCountries[0];
      
      if (randomQuestionNum === 2)
        this.fetchCountries(correctCountry.borders, "neighbours")
      ;
    };
    
    // Sorteando país que será a resposta correta
    if (currentCountries.length > 1) {
      correctCountry = currentCountries[randomNumFrom(currentCountries)];
    };
      
    // Repúplica Tcheca .common tem um nome diferente do restante (Czechia)
    if (correctCountry.name.common === "Czechia") correctCountry.name.common = "Czech Republic";
  
    // Se pergunta for sobre capital, senão o else serve para todas as outras perguntas     
    if (randomQuestionNum === 3) {
      currentQuestionPlaceholder.textContent = correctCountry.capital[0];
    } else {
  
      // Se pergunta atual NÃO for a primeira (nesta, só será inserido nome do país quando tempo acabar)
      if (!(randomQuestionNum === 0)) {
        currentQuestionPlaceholder.textContent = correctCountry.name.common;
      };
    };

  },

  shuffleCountries() {
    countries.allCountries.sort(() => Math.random() - 0.5);
  },


  newGame() {
    score = 0;
    this.resetForNewQuestion();
  },


  resetForNewQuestion() {

    currentQuestion.classList.add("hide__all");

    // Função também é útil p/ resetar textp do campo input
    this.rightOrWrong("Your answer");

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
    
    this.getRandomQuestion();

    this.assignElements();
    
    this.increaseQuestionNumber();
    
    this.shuffleCountries();

    this.getCountries();

    // Parei aqui, perguntas 3 e 5 apresentam erro intermitente agora que dispensamos setTimeout
    this.fetchCountries(currentCountries)
      .then(() => this.renderFlags())
      .finally(() => {

        this.obtainCorrectCountry();

        this.removeCurrentCorrectCountry(correctCountry.cca3);

        // Pergunta aleatória aparece
        currentQuestion.classList.remove("hide__all");

        this.storeAnswer();
    
        // Iniciando Timer - 325ms === +/- 7 segundos
        this.initTimer(300);
    
        // DEBUG P/ PERGUNTA 2 sobre fronteiras
        // currentNeighbours.forEach(country => console.log(country));
    
        // Colocando cursor diretamente no campo da resposta (pode não haver)
        currentQuestion.querySelector(".input__answer")?.focus();
        
        // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
        this.toggleHidden();

        // DEBUG P/ ver embaralhamento de allCountries
        // console.log(countries.allCountries);

      })
    
    ;

  },

};

/////////////////////////////////////////////////////

playButton.addEventListener("click", function() {

  // Escondendo Splash Screen 
  splashScreen.classList.add("hide__all");
  
  // Escondendo mainContainer => exibindo novamente c/ pergunta aleatória
  quiz.toggleHidden();

  quiz.loadQuestion();

});

// Pergunta de capitais só sortear países médios e fáceis

// Pergunta com apenas uma bandeira e perguntando nome do país tenderá a ter mais chance de ter países medium e hard level

// Tratar possíveis erros do fetch

// Aperta enter começa jogo na tela inicial

// Remover opções do botão direito nas imagens das bandeiras

// Pontuação não será mais de acordo com tempo restante mas uma pergunta correta === 1 ponto, porque não podemos indicar qual país é o correto assim que jogador selecionar, pois bastaria sair selecionando um por um para descobrir qual a resposta correta nas perguntas sem input

// Opção para perguntar se quer mesmo sair depois de começar a jogar

// Apresentar o nome do país se errar 

// Futuramente remover OR da linha 223 pq pergunta 5 se tornará de múltipla escolha

// Ajustar footer

// Pergunta 4 está MUITO fácil, independente do país, mudar p/ => selecionar o país que pertence ao continente africano" ou algo assim

// Quando tempo terminar campo input retorna feedback se jogador acertou ou errou

// Impedir de digitar após apresentar, right, wrong ou no answer

// Reembaralhar array dos países a cada pergunta

// Netherlands tá aparecendo uma bandeira completamente estranha...
// Apareceu do nada cook islands tbm (ao fazer fetch de "Iran")

// FILTER RESPONSE
// You can filter the output of your request to include only the specified fields.
// https://restcountries.com/v2/all?fields=name,capital,currencies

// Implementar "tricky questions" exemplo:
// Fazer isso se jogador acertar muitas seguidas

// Criar função para respostas exceções, como washignton, d.c., czechia, russia estar na europa e na ásia, etc

// Acabei de descobrir que russia faz parte de dois continentes, resolver isso na pergunta sobre continentes

// tunisia X turquia
// bandeira puerto rico X cuba
// australia X nova zelandia
// monaco X polonia X indonesia X gronelandia X singapura
// Romenia X chade (chade ainda não está incluído)
// Filipinas X república tcheca
// Mexico X itália 
// Ecuador X colombia X venezuela
// Síria X Iraque
// Irlanda X Costa do marfim
// Paraguai X Holanda
// Hungria X ITalia
// Russia X luxemburgo
// Islandia X Noruega X Suécia X Finlandia X Dinamarca


quiz.shuffleCountries();