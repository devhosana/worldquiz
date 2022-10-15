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
let latestQuestion;
let currentInput;
let currentCountries;
let currentNeighbours = [];
let correctCountry;
let flagPlaceHolders;
let randomQuestionNum;
let allChoiceContainers;
let playerAnswer;

let timeOver = false;
let currentQuestionNumber = 0;

const quiz = {

  fetchNeighbours(neighbours) {

    neighbours.forEach(country => {
      fetch(`https://restcountries.com/v3.1/alpha/${country}`)
        .then(response => response.json())
        .then(data => currentNeighbours.push(data[0].name.common.toLowerCase()))
      ;
    })

  },


  fetchCountry(countries) {
    countries.forEach((country, index) => {
      fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(response => response.json())
        .then(data => currentCountries[index] = data[0])
        .finally(() => {
          if (randomQuestionNum === 2) this.fetchNeighbours(currentCountries[0].borders);
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
    
    while (randomQuestionNum === latestQuestion) randomQuestionNum = randomNumFrom(allQuestions);

    latestQuestion = randomQuestionNum;
    // DEBUG P/ ESCOLHER PERGUNTA OU VER QUAL FOI SORTEADA
    // 0 - De qual país é essa bandeira
    // 1 - Qual a capital desse país
    // 2 - Nomeie um país que faça fronteira com este
    // 3 - Berlin é a capital de qual destes países?
    // 4 - Em qual continente esse país fica
    // 5 - Qual destas 4 é a bandeira da Esbórnia?

    // console.log(randomQuestionNum);
    // randomQuestionNum = 0;

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
      while (randomQuestionNum === 2 && countries.islandCountries.includes(currentCountry)) {
        currentCountry = countries.getRandomCountry();
      };
      
      temp.add(currentCountry);
    };
    
    // DEBUG - ESCOLHER PAÍS P/ TESTES
    // currentCountries = ["Brazil"];

    currentCountries = [...temp];

    this.fetchCountry(currentCountries);

  },


  renderFlag() {
    flagPlaceHolders.forEach((element, index) => {
      element.src = currentCountries[index].flags.svg;
    });
  },

  chooseCountry(containers) {
    containers.forEach(container => {

      container.addEventListener("click", function() {
        if (timeOver) return;

        const previousUserSelection = currentQuestion.querySelector(".choice__container--user__choice");

        previousUserSelection?.classList.remove("choice__container--user__choice");

        this.classList.add("choice__container--user__choice");
      });

    });
  },
  
  storeAnswer() {

    // Se pergunta for com resposta clicável
    if (currentQuestion.querySelector(".flags__container--2")) {

      document.addEventListener("click", function(event) {
        if (event.target.classList.contains("flag__img") || event.target.classList.contains("choose__container")) {
          // Short circuit aqui é para caso usuário clique bem na extremidade do choice__container
          playerAnswer = event.target.closest(".flag__img") || event.target.querySelector(".flag__img");
        };

      });

    } else {
      currentInput = currentQuestion?.querySelector(".input__answer");
  
      currentInput?.addEventListener("input", function(event) {
        playerAnswer = event.target.value.trim().toLowerCase();
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
      if (this.normalizeString(playerAnswer) === this.normalizeString(correctCountry.name.common)) return true;
    };
    
    if (randomQuestionNum === 1) {
      if (this.normalizeString(playerAnswer) === this.normalizeString(correctCountry.capital[0])) return true;
    }
    
    if (randomQuestionNum === 2) {
      if (currentNeighbours.includes(playerAnswer)) return true;
    };
    
    if (randomQuestionNum === 3 || randomQuestionNum === 5) {
      if (playerAnswer.src === correctCountry.flags.svg) return true;
    };
    
    if (randomQuestionNum === 4) {
      if (this.normalizeString(playerAnswer) === this.normalizeString(correctCountry.region)) return true;
    };

  },

  revealCountry() {

    if (!currentQuestion === allQuestions[0]) return;

    if (!timeOver) {
      questionPlaceholder.classList.add("hide__correct");
    } else {
      questionPlaceholder.textContent = correctCountry.name.common;
      questionPlaceholder.classList.remove("hide__correct");
    };

  },

  initTimer(duration) {

    // Esconder resposta correta
    this.revealCountry();

    const currentProgressBar = currentQuestion.querySelector(".progress__bar");
    currentProgressBar.style.backgroundColor = "rgba(78, 248, 10, 0.75)";
    let time = 100;

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) {
        clearTimeout(timer);
        timeOver = true;

        // Esconder resposta correta
        this.revealCountry();

        setTimeout(() => {

          if (this.verifyAnswer()) {
            this.toggleHidden();
            this.loadQuestion();
          };

        }, 2000)
        
      };

    }, duration);

  },

  resetForNewQuestion() {

    currentQuestion?.classList.add("hide__all");
    
    // correctCountry = null;
    
    document.querySelector(".choice__container--user__choice")?.classList.remove("choice__container--user__choice");

    // Limpar países anteriormente randomizados e vizinhos
    currentCountries = [];

    currentNeighbours = [];

    timeOver = false;

    if (currentInput) {
      currentInput.value = playerAnswer = "";
    };
    
  },


  loadQuestion() {

    this.resetForNewQuestion();

    this.getRandomQuestion();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    questionPlaceholder = currentQuestion.querySelector(".question__placeholder")
    
    // Obter containers para seleção de bandeira (pode não haver)
    allChoiceContainers = currentQuestion.querySelectorAll(".choice__container"); 

    if (allChoiceContainers) {
      this.chooseCountry(allChoiceContainers);
    };

    // Obter número de bandeiras para definir quantas fetchs faremos
    flagPlaceHolders = currentQuestion.querySelectorAll(".flag__img");
    
    this.getCountries();
      
    // Lembrando que: setTimeOut também é assíncrono
    // Arrow function não possui sua própria this keyword
    setTimeout(() => {

      this.increaseQuestionNumber();

      if (currentCountries.length === 1) correctCountry = currentCountries[0];
      
      // Selecionando país que será a resposta correta
      if (currentCountries.length > 1) {
        correctCountry = currentCountries[randomNumFrom(currentCountries)];

        // Repúplica Tcheca .common tem um nome diferente do restante (Czechia) 
        if (correctCountry.name.common === "Czechia") correctCountry.name.common = "Czech Republic";
      };

      // Se pergunta for sobre capital, senão o else serve para todas as outras perguntas     
      if (currentQuestion === allQuestions[3]) {
        questionPlaceholder.textContent = correctCountry.capital[0];
      } else {

        // Se pergunta atual NÃO for a primeira (pergunta só será inserida quando tempo acabar)
        if (!currentQuestion === allQuestions[0]) {
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

// função fetch ser uma somente apenas mudando url conforme for para países ou vizinhos

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

// Pergunta 4 está MUITO fácil, independente do país => mudar p/ "qual destes países pertence ao continente africano" ou algo assim

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





