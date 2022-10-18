import randomNumFrom from "./modules/methods.js";
import countries from "./modules/countries.js";

//////////////////////
/// HTML Elements ///
//////////////////////

const splashScreen = document.querySelector(".splash__screen");
const allQuestions = document.querySelectorAll(".select__question");
const playButton = document.querySelector(".play__button");
const mainContainer = document.querySelector(".main__container");

console.log("#DEBUGGING");

//////////////////////
/// Game Variables ///
//////////////////////


let questionPlaceholder;
let currentQuestion;
let previousQuestion;
let currentInput;
let currentCountries;
let currentNeighbours = [];
let correctCountry;
let flagPlaceHolders;
let flagsContainer;
let randomQuestionNum;
let allChoiceContainers;
let playerAnswer;
let score = 0;

let timeOver = false;
let currentQuestionNumber = 0;

const quiz = {


  fetchCountry(countries, neighbours) {
    countries.forEach((country, index) => {

      const countryCode = neighbours ? country : country.code;

      fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(response => response.json())
        .then(data => {

          if (!neighbours) {
            currentCountries[index] = data[0];
          };

          if (neighbours) {
            currentNeighbours.push(data[0]);
          };

        })
      ;
    });
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

    randomQuestionNum = 2;
    // console.log(randomQuestionNum);

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

    while (temp.size < flagPlaceHolders.length)  {
      
      let currentCountry = countries.getRandomCountry();
      
      // Impedir que ilhas sejam sorteadas na pergunta 2
      while (randomQuestionNum === 2 && currentCountry.island) {
        currentCountry = countries.getRandomCountry();
      };
      
      temp.add(currentCountry);
    };

    currentCountries = [...temp];
    
    // DEBUG - ESCOLHER PAÍS P/ TESTES
    // currentCountries = ["Iran"];

    this.fetchCountry(currentCountries);

  },


  renderFlag() {
    flagPlaceHolders.forEach((element, index) => {
      element.src = currentCountries[index].flags.svg;
    });
  },


  storeAnswer() {

    // Se tempo acabar resposta não é mais possível
    if (timeOver) return;

    flagsContainer = currentQuestion.querySelector(".flags__container--2");
    currentInput = currentQuestion.querySelector(".input__answer");

    let previousUserSelection;
    
    // Se pergunta for com resposta selecionável
    if (flagsContainer) {
      flagsContainer.addEventListener("click", function(event) {
        
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


  verifyAnswer() {

    if (randomQuestionNum === 0) {
      if (playerAnswer === this.normalizeString(correctCountry.name.common)) return true;
    };
    
    if (randomQuestionNum === 1) {
      if (playerAnswer === this.normalizeString(correctCountry.capital[0])) return true;
    }
    
    if (randomQuestionNum === 2) {

      const isCorrect = 
        currentNeighbours.some(neighbour => {
          return this.normalizeString(neighbour.name.common) === playerAnswer;
        })
      ;

      if (isCorrect) return true;
    };
    
    if (randomQuestionNum === 3 || randomQuestionNum === 5) {
      playerAnswer = playerAnswer?.querySelector(".flag__img");
      if (playerAnswer?.src === correctCountry.flags.svg) return true;
    };
    
    if (randomQuestionNum === 4) {
      if (playerAnswer === this.normalizeString(correctCountry.region)) return true;
    };

  },


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
      questionPlaceholder.textContent = correctCountry.name.common;
      questionPlaceholder.classList.remove("hide__correct");
    };

    if (randomQuestionNum === 5 || randomQuestionNum === 3) {
                                                                 
      let correctOption = Array.from(flagPlaceHolders)
        .find(element => element.src === correctCountry.flags.svg)
        .closest(".choice__container")
      ;

      if (playerAnswer === correctOption) {
        playerAnswer?.classList.remove("choice__container--user__choice");
        // document.querySelector(".choice__container--user__choice")?.classList.remove("choice__container--user__choice");
      };
      
      if (playerAnswer !== correctOption) {
        // playerAnswer?.classList.remove("choice__container--user__choice");
        playerAnswer?.classList.add("choice__container--wrong__option");
      };
      
      this.highlightOption(correctOption);

    };
      
  },


  initTimer(duration) {

    const currentProgressBar = currentQuestion.querySelector(".progress__bar");
    let time = 100;

    // Esconder campo da resposta correta se pergunta for a primeira
    if (currentQuestion === allQuestions[0]) questionPlaceholder.classList.add("hide__correct");
    currentProgressBar.style.backgroundColor = "rgba(78, 248, 10, 0.75)";

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) {

        clearTimeout(timer);
        timeOver = true;

        this.revealCorrectAnswer();

        if (this.verifyAnswer()) {
          score++;

          // Delay para verificar resposta correta e então carregar nova pergunta
          setTimeout(() => {
            this.toggleHidden();
            this.loadQuestion();
          }, 1800);
        }; 

        
      };

    }, duration);

  },


  newGame() {
    score = 0;
    this.resetForNewQuestion();
  }, 


  resetForNewQuestion() {

    currentQuestion.classList.add("hide__all");

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

    if (currentQuestionNumber > 0) this.resetForNewQuestion();
    
    this.getRandomQuestion();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    questionPlaceholder = currentQuestion.querySelector(".question__placeholder")
    
    // Obter containers para seleção de bandeira (pode não haver)
    allChoiceContainers = currentQuestion.querySelectorAll(".choice__container"); 

    // Obter número de bandeiras para definir quantas fetchs faremos
    flagPlaceHolders = currentQuestion.querySelectorAll(".flag__img");
    
    this.getCountries();
      
    // Lembrando que: setTimeOut também é assíncrono
    // Arrow function não possui sua própria this keyword
    setTimeout(() => {

      this.increaseQuestionNumber();

      if (currentCountries.length === 1) {
        correctCountry = currentCountries[0];

        if (randomQuestionNum === 2) {
          this.fetchCountry(correctCountry.borders, "neighbours");
        };
      };
      
      // Sorteando país que será a resposta correta
      if (currentCountries.length > 1) {
        correctCountry = currentCountries[randomNumFrom(currentCountries)];
      };
      
      // Repúplica Tcheca .common tem um nome diferente do restante (Czechia)
      if (correctCountry.name.common === "Czechia") correctCountry.name.common = "Czech Republic";

      // Se pergunta for sobre capital, senão o else serve para todas as outras perguntas     
      if (randomQuestionNum === 3) {
        questionPlaceholder.textContent = correctCountry.capital[0];
      } else {

        // Se pergunta atual NÃO for a primeira (nesta, só será inserido nome do país quando tempo acabar)
        if (!(randomQuestionNum === 0)) {
          questionPlaceholder.textContent = correctCountry.name.common;
        };
      };

      // Pergunta aleatória aparece
      currentQuestion.classList.remove("hide__all");

      this.renderFlag();

      this.storeAnswer();

      // Iniciando Timer - 325ms === +/- 7 segundos
      this.initTimer(300);

      // DEBUG P/ RESPOSTA 2
      // currentNeighbours.forEach(country => console.log(country));

      // Colocando cursor diretamente no campo da resposta (pode não haver)
      currentQuestion.querySelector(".input__answer")?.focus();
      
      // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
      this.toggleHidden();
      
    }, 1500);

  },

};

/////////////////////////////////////////////////////

playButton.addEventListener("click", function() {

  // Escondendo Splash Screen 
  splashScreen.classList.add("hide__all");
  
  // Alternando mainContainer splash screen => pergunta aleatória
  quiz.toggleHidden();

  quiz.loadQuestion();

});

// Pergunta de capitais só sortear países médios e fáceis

// Tratar possíveis erros do fetch

// Pergunta com apenas uma bandeira e perguntando nome do país tenderá a ter mais chance de ter países medium e hard level

// Quando for pergunta sobre fronteiras já fazer fetch de todas as fronteiras para entao ficar pré armazenado ao responder

// Disparar timer somente após fetch retornar response.ok

// Ou ainda tentar verificar se response emite algum tempo para então inseri-no no timer de setTimeOut

// Slow 3g bandeiras não são renderizadas

// Fast 3g país da resposta correta sempre tem delay denunciando qual a resposta certa

// response.ok && 500ms

// Aperta enter começa jogo na tela inicial

// Remover opções do botão direito nas imagens das bandeiras

// Pontuação não será mais de acordo com tempo restante mas uma pergunta correta === 1 ponto, porque não podemos indicar qual país é o correto assim que jogador selecionar, pois bastaria sair selecionando um por um para descobrir qual a resposta correta nas perguntas sem input

// Load Question está grande demais, diminuir em funções menores

// Opção para perguntar se quer mesmo sair depois de começar a jogar

// Apresentar o nome do país se errar 

// Se país A foi sorteado em pergunta X, não sortear mais este mesmo país quando esta pergunta aparecer novamente

// Implementar "tricky questions" exemplo:
// Fazer isso se jogador acertar muitas seguidas

// Ajustar footer

// Remover países que já foram sorteados independente da pergunta e colocar numa array, para depois readiciona-los quando partida começar

// Pergunta 4 está MUITO fácil, independente do país => selecionar o país que pertence ao continente africano" ou algo assim

// Quando tempo terminar campo input retorna feedback se jogador acertou ou errou

// Reembaralhar array dos países a cada pergunta

// Netherlands tá aparecendo uma bandeira completamente estranha...
// Apareceu do nada cook islands tbm (ao fazer fetch de "Iran")

// FILTER RESPONSE
// You can filter the output of your request to include only the specified fields.
// https://restcountries.com/v2/all?fields=name,capital,currencies

// tunisia X turquia
// bandeira puerto rico X cuba
// australia X nova zelandia
// monaco X polonia X indonesia X gronelandia X singapura
// Romeniax chade (chade ainda não está incluído)
// Filipinas X república tcheca
// Mexico X itália 
// Ecuador X colombia X venezuela
// Síria X Iraque
// Irlanda X Costa do marfim
// Paraguai X Holanda
// Hungria X ITalia
// Russia X luxemburgo
// Islandia X Noruega X Suécia X Finlandia X Dinamarca



// Obter primeira e última letra da resposta e usar slice parar retirar país de correctCountry.name
// e então comparar o que foi recortado com resposta do jogador
// verificar alt spellings para comparar input com nome do país

// Tentar incluir coreia do sul e do norte depois de implementar v3.1



/*

const foo = function() {
  fetch("https://restcountries.com/v3.1/alpha/kor")
    .then(response => response.json())
    .then(data => console.log(data))
  ;
};

foo();

*/