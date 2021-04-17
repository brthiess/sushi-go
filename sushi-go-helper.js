var numberOfPlayers = getNumberOfPlayers();

function getNumberOfPlayers(){
    if (!gameUiIsDefined()){
        return -1;
    }
    return Object.keys(gameui.playersStock).length;
}

//player number starts at 1.  1 is me.  2 is the next person to my right... etc.
//returns array of the players played cards
function getPlayersPlayedCards(playerNumber){
    var playedCardsExcludingCardsOnWasabi = gameui.playersStock[getPlayerIdByPlayerNumber(playerNumber)].items;
    var allPlayedCards = playedCardsExcludingCardsOnWasabi.slice();
    var wasabiStock = gameui.wasabiStock;
    for(var cardNumber = 0; cardNumber < playedCardsExcludingCardsOnWasabi.length; cardNumber++){
        var cardId = playedCardsExcludingCardsOnWasabi[cardNumber].id;
        if (typeof(wasabiStock[cardId]) !== 'undefined'){
            allPlayedCards.push(wasabiStock[cardId].items[0]);
        }
    }
    return allPlayedCards;
}

function getNumberOfPlayersPlayedCards(playerNumber){
    return getPlayersPlayedCards(playerNumber).length;
}

//returns array with each item like: {id: 123, type: "eggnigiri" }
function getCardsInMyHand(){
    return gameui.playerHand.items;
}

function getPlayerIdByPlayerNumber(playerNumber){
    return gameui.gamedatas.playerorder[playerNumber - 1];
}

var playersCards = {};
function getCardsInPlayersHand(playerNumber){
    return playersCards[getPlayerIdByPlayerNumber(playerNumber)];
}

function setCardsInPlayersHand(playerNumber, cards){
    playersCards[getPlayerIdByPlayerNumber(playerNumber)] = cards;
}

function removeCardJustPlayedByPlayer(playerNumber){
    var removedCards = getPlayersPlayedCards(playerNumber);
    var cards = getCardsInPlayersHand(playerNumber);
    if (typeof(cards) === 'undefined'){
        return;
    }
    cards = cards.filter(function(card) {
        return !removedCards.some(rc => rc.id === card.id);
    })
    setCardsInPlayersHand(playerNumber, cards);
}

function removeCardsJustPlayedByPlayers(){
    for(var playerNumber = 1; playerNumber <= getNumberOfPlayers(); playerNumber++){
        removeCardJustPlayedByPlayer(playerNumber);
    }
}

function updateCardsInPlayersHandsAfterCardHasBeenPlayed(){
    removeCardsJustPlayedByPlayers();

    for(var playerNumber = getNumberOfPlayers(); playerNumber >= 2; playerNumber--){
        var previousPlayerNumber = getPreviousPlayerNumber(playerNumber);
        var cards = getCardsInPlayersHand(previousPlayerNumber);
        if (typeof(cards) !== 'undefined'){
            setCardsInPlayersHand(playerNumber, cards);
        }
    }
}

function setCardsInMyHand(){
    var myCards = getCardsInMyHand();
    setCardsInPlayersHand(1, myCards);
}

function getPreviousPlayerNumber(playerNumber){
    if (playerNumber == 1) {
        return getNumberOfPlayers();
    }
    else {
        return playerNumber - 1;
    }
}

function getNumberOfPlayedCards(){
    getTurnNumber() - 1;
}

function startNewGame(){
    setCardsInMyHand();
    setupUi();
}

function setupUi(){
    var element = document.createElement('div');
    element.style.cssText = 'position:fixed;width:400px;height:400px;z-index:100;background:#000;top:40%;right:0;color:white;';
    element.id = "card-tracker-container";
    document.body.appendChild(element);
    updateUi();
}

function updateUi(){
    var cardTrackerContainer = document.getElementById("card-tracker-container");
    cardTrackerContainer.innerHTML = "";
    for(var playerNumber = 2; playerNumber <= getNumberOfPlayers(); playerNumber++){
        cardTrackerContainer.innerHTML += "<div>" + getCardsInPlayersHandAsString(playerNumber) + "</div>";
    }
}

function getCardsInPlayersHandAsString(playerNumber){
    var cards = getCardsInPlayersHand(playerNumber);
    if (typeof(cards) !== 'undefined'){
        var cardsString = '';
        for(var i = 0; i < cards.length; i++){
            cardsString += cards[i].type + ", ";
        }
        return cardsString;
    }
    return '???';
}

var previousNumberOfPlayedCards = 0;
var currentNumberOfPlayedCards = 0;
function cardHasBeenPlayed() {
    var cardHasBeenPlayed = false;
    var inTransition = false;
    currentNumberOfPlayedCards = getNumberOfPlayersPlayedCards(1);
    for(var playerNumber = 2; playerNumber <= getNumberOfPlayers(); playerNumber++){
        if (getNumberOfPlayersPlayedCards(playerNumber) != getNumberOfPlayersPlayedCards(playerNumber - 1)){
            inTransition = true;
        }
    }

    if (!inTransition && currentNumberOfPlayedCards === previousNumberOfPlayedCards + 1){
        cardHasBeenPlayed = true;
        previousNumberOfPlayedCards = currentNumberOfPlayedCards;
    }
    
    
    return cardHasBeenPlayed;
}

function getNumberOfCardsInMyHand(){
    if (!gameUiIsDefined()){
        return -1;
    }
    return gameui.playerHand.items.length;
}

function getTurnNumber(){
    return gameui.playersStock[getPlayerIdByPlayerNumber(playerNumber)].items.length + 1;
}

function gameHasStarted(){
    if (getNumberOfCardsInMyHand() > 4){
        return true;
    }
    return false;
}

function noMoreCardsToPlay(){
    if (getNumberOfCardsInMyHand() == 0){
        return true;
    }
    return false;
}

function resetRound(){
    previousNumberOfPlayedCards = 0;
    currentNumberOfPlayedCards = 0;
    playersCards = {};
}

function setUpGameStartWatch(){
    var gameStartWatch = setInterval(function() {
        if (gameHasStarted()){
            console.log("Game has started");
            startNewGame();
            clearInterval(gameStartWatch);
            setUpCardWatch();
        }
    }, 1000) 
}

var cardWatch;
function setUpCardWatch(){
    cardWatch = setInterval(function() {
        if (cardHasBeenPlayed()){
            setCardsInMyHand();
            console.log("Card has been played");
            updateCardsInPlayersHandsAfterCardHasBeenPlayed();
            updateUi();
            if (noMoreCardsToPlay()){
                resetRound();
                console.log("Resetting Round");
            }
        }
        else {
            console.log("Card has not been played");
        }
    }, 100)
}

function gameUiIsDefined(){
    if (typeof(gameui) === 'undefined' || typeof(gameui.playerHand) === 'undefined' || typeof(gameui.playerHand.items) === 'undefined'){
        return false;
    }
    return true;
}

setUpGameStartWatch();