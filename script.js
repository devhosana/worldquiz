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
let correctCountry;
let flagPlaceHolders;
let randomQuestionNum;
let chooseContainers;
let playerAnswer;

let timeOver = false;
let currentQuestionNumber = 0;

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
  

  initTimer(duration) {

    const currentProgressBar = currentQuestion.querySelector(".progress__bar");
    let time = 100;

    const timer = setInterval(() => {
      time -= 5;
      currentProgressBar.style.width = `${time}%`;

      if (time <= 30) currentProgressBar.style.backgroundColor = "rgba(220, 20, 60, 0.75)";

      if (time <= 0) {
        clearTimeout(timer);
        timeOver = true;

        console.log(`Resposta jogador: ${playerAnswer}`);
        console.log(`Resposta certa: ${correctCountry.name.toLowerCase()}`);

        // Obter primeira e última letra da resposta e usar slice parar retirar país de correctCountry.name
        // e então comparar o que foi recortado com resposta do jogador
        
        console.log(correctCountry.name.toLowerCase().includes(playerAnswer));
      };

    }, duration);

  },


  getRandomQuestion() {
    randomQuestionNum = randomNumFrom(allQuestions);
    
    while (randomQuestionNum === latestQuestion) {
      randomQuestionNum = randomNumFrom(allQuestions);
    };

    latestQuestion = randomQuestionNum;
    // DEBUG P/ ESCOLHER PERGUNTA OU VER QUAL FOI SORTEADA
    // 0 - De qual país é essa bandeira
    // 1 - Qual a capital desse país
    // 2 - Nomeie um país que faça fronteira com este
    // 3 - Berlin é a capital de qual destes países?
    // 4 - Em qual continente esse país fica
    // 5 - Qual destas 4 é a bandeira da Alemanha?

    // console.log(randomQuestionNum);
    randomQuestionNum = 0;

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
    // currentCountries = ["united kingdom"];
    currentCountries = [...temp];

    this.fetchCountry(currentCountries);

  },


  renderFlag() {
    flagPlaceHolders.forEach((element, index) => {
      element.src = currentCountries[index].flag;
    });
  },

  chooseCountry(containers) {
    containers.forEach((container, index) => {

      container.addEventListener("click", function(event) {
        if (timeOver) return;

        const userSelection = currentQuestion.querySelector(".choose__container--user__choose");
        userSelection?.classList.remove("choose__container--user__choose");
        this.classList.add("choose__container--user__choose");
      });

    });
  },

  storeAnswer() {
    currentInput = currentQuestion?.querySelector(".input__answer");
    
    currentInput?.addEventListener("input", function(event) {
      playerAnswer = event.target.value.trim().toLowerCase();
    });
    
  },

  //////////////////
  /// Game Logic ///
  //////////////////




  verifyAnswer() {

  },

  //////////////////
  /// Game Start ///
  //////////////////

  loadQuestion() {

    correctCountry;

    this.getRandomQuestion();

    this.increaseQuestionNumber();

    // Obter placeholder do nome do país na pergunta (pode não haver)
    questionPlaceholder = currentQuestion.querySelector(".question__placeholder");
    
    // Obter containers para seleção de bandeira (pode não haver)
    chooseContainers = currentQuestion.querySelectorAll(".choose__container"); 

    if (chooseContainers.length > 0) {
      this.chooseCountry(chooseContainers);
    };

    // Obter número de bandeiras para definir quantas fetchs faremos
    flagPlaceHolders = currentQuestion.querySelectorAll(".flag__img");

    // Limpar países anteriormente randomizados
    currentCountries = [];
    
    this.getCountries();
      
    // Lembrando que: setTimeOut também é assíncrono
    // Arrow function não possui sua própria this keyword
    setTimeout(() => {

      // Selecionando país que será a resposta correta
      if (currentCountries.length > 1) {
        correctCountry = currentCountries[randomNumFrom(currentCountries)];
      };

      if (currentCountries.length === 1) correctCountry = currentCountries[0];

      // Colocando nome do país nas questões com question__placeholder
      if (questionPlaceholder && !questionPlaceholder.textContent.includes("Berlin")) {

        // Países eventualmente vem com nomes compostos, exemplo:
        // United Kingdom Of Great Britain And Northern Ireland
        // find abaixo resolve isso obtendo nome original para ser exibido na array allCountries
        let countryName =
          countries.allCountries
          .find(country => correctCountry.name.includes(country))
        ;
        
        // No caso da Índia ocorre o contrário, nome que é feito o fetch é composto e correctCountry.name é o que queremos
        questionPlaceholder.textContent =
          correctCountry.name === "India" ? correctCountry.name : countryName
        ;

      };
      
      if (questionPlaceholder?.textContent.includes("Berlin")) {
        questionPlaceholder.textContent = correctCountry.capital;
      };

      // Mostrando pergunta randomizada
      currentQuestion.classList.remove("hide__all");

      this.renderFlag();

      this.storeAnswer();

      // Iniciando Timer - 325ms === +/- 7 segundos
      this.initTimer(325);

      // Colocando cursor diretamente no campo da resposta (pode não haver)
      currentQuestion.querySelector(".input__answer")?.focus();

      // POR ÚLTIMO exibir novamente mainContainer com tudo carregado
      this.toggleHidden();

    }, 1500);



  },

};

/////////////////////////////////////////////////////

playButton.addEventListener("click", function(event) {

  // Escondendo Splash Screen 
  splashScreen.classList.add("hide__all");
  
  // Alternando mainContainer splash screen => pergunta aleatória
  quiz.toggleHidden();

  quiz.loadQuestion();

});




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

// Implementar "tricky questions" exemplo:
// Fazer isso se jogador acertar muitas seguidas

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








