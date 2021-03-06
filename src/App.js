/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
import React, {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import Card from './components/Card';
import './App.css';
import './gameBoard.css';
import reshuffleEmojis from './utils/ShuffleEmoji.js';

function App() {
  // size of the grid, can be user-defined but keep it for now
  const [gridWidth, setGridWidth] = useState(4);
  const [gridHeight, setGridHeight] = useState(4);

  // cards' state
  const [cardStates, setCardStates] = useState({});
  // scoreboard
  const [tryCount, setTryCount] = useState(0);
  const [score, setScore] = useState(0);
  // store current flipped card face
  const [flippedCard, setFlippedCard] = useState({
    face: undefined,
    idx: undefined,
  });

  const incrementWidth = () => {
    gridWidth >= 8? setGridWidth(gridWidth) : setGridWidth(gridWidth + 1);
    setFlippedCard({
      ...flippedCard,
      face: undefined,
      idx: undefined,
    });
  };

  // reveal all cards for a period of time
  const revealAllCards = () => {
    const tempCardStates = {...cardStates};
    for (const cardStateKey of Object.keys(tempCardStates)) {
      tempCardStates[cardStateKey].isPermanentlyFlipped = true;
      tempCardStates[cardStateKey].isFlipped = true;
    }
    setCardStates({...tempCardStates});

    setTimeout(() => {
      const tempCardStates = {...cardStates};
      for (const cardStateKey of Object.keys(tempCardStates)) {
        tempCardStates[cardStateKey].isPermanentlyFlipped = false;
        tempCardStates[cardStateKey].isFlipped = false;
      }
      setCardStates({...tempCardStates});
    }, 2000);
  };

  // reset grid to specified width and height
  const resetCardsStates = (isStartOver, width, height) => {
    const emojis = reshuffleEmojis(width, height);
    const defaultCardState = {};
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        defaultCardState[`Card${width * row + col}`] = {
          face: emojis[width * row + col],
          coord: {row: row, col: col},
          cardIdx: width * row + col,
          isFlipped: false,
          isPermanentlyFlipped: false,
        };
      }
    };
    setFlippedCard({
      ...flippedCard,
      face: undefined,
      idx: undefined,
    });
    isStartOver? setCardStates({...defaultCardState}) :
                 setCardStates({...cardStates, ...defaultCardState});
    setScore(0);
  };

  // set current state of the card to flipped
  const flipCurrentCard = (card) => {
    setCardStates({
      ...cardStates,
      [`Card${card.coord.row*gridWidth+card.coord.col}`]: {
        ...card,
        isFlipped: !card.isFlipped,
      },
    });
    setFlippedCard({
      ...flippedCard,
      face: card.face,
      idx: card.coord.row*gridWidth+card.coord.col,
    });
  };

  // set both cards as permanently flipped and clear flipped card state
  const handleSameCards = (card) => {
    // set flipped cards to be permanently flipped
    setCardStates({
      ...cardStates,
      [`Card${flippedCard.idx}`]: {...cardStates[`Card${flippedCard.idx}`],
        isPermanentlyFlipped: true},
      [`Card${card.coord.row*gridWidth+card.coord.col}`]: {
        ...card,
        isFlipped: true,
        isPermanentlyFlipped: true,
      },
    });
    // reset flipped card
    setFlippedCard({
      ...flippedCard,
      face: undefined,
      idx: undefined,
    });
    setScore(score + 1);
  };

  // reset both cards if they are not the same
  const handleDifferentCards = (card) => {
    // show the card the player flipped...
    setCardStates({
      ...cardStates,
      [`Card${card.coord.row*gridWidth+card.coord.col}`]: {
        ...card,
        isFlipped: !card.isFlipped,
      },
    });
    // TODO: set all cards property isPermanentlyFlipped: true so
    //       user can't flip any cards during this period
    /*
    code here
    */
    // and hide both card after 200ms
    setTimeout(() => {
      setCardStates({
        ...cardStates,
        [`Card${card.coord.row*gridWidth+card.coord.col}`]: {
          ...card,
          isFlipped: false,
        },
        [`Card${flippedCard.idx}`]: {
          ...cardStates[`Card${flippedCard.idx}`],
          isFlipped: false,
        },
      });

      // reset flipped card
      // TODO: set those cards which has isFlipped: true to
      //       property isPermanentlyFlipped: false
      setFlippedCard({
        ...flippedCard,
        face: undefined,
        idx: undefined,
      });
    }, 200);
  };

  // handle different situations of card states
  const handleCardClick = (card) => {
    setTryCount(tryCount+1);
    console.log(`you tried ${tryCount} time(s)`);
    if (card.isPermanentlyFlipped) {
      console.log('You clicked the same card!');
      return; // avoid extra if-statement checks
    } else if (flippedCard.face === undefined) {
      flipCurrentCard(card);
    } else if (flippedCard.face === card.face &&
               flippedCard.idx !== card.coord.row*gridWidth+card.coord.col) {
      handleSameCards(card);
    } else {
      handleDifferentCards(card);
    }
  };

  // same functionalities as handleCardClick() but with ternary operators
  const ternaryHandleCardClick = (card) =>{
    setTryCount(tryCount+1);
    console.log(`you tried ${tryCount} time(s)`);
    // who needs if if you can do this🤯
    card.isPermanentlyFlipped?
    console.log('You clicked the same card!') :
    flippedCard.face === undefined?
    flipCurrentCard(card) :
    flippedCard.face === card.face &&
    flippedCard.idx !== card.coord.row*gridWidth+card.coord.col?
    handleSameCards(card) :
    handleDifferentCards(card);
  };

  // create a single game card
  const createGameCard = (card) =>(
    <Card
      face={card.face}
      coord={card.coord}
      isFlipped={card.isFlipped}
      isPermanentlyFlipped={card.isPermanentlyFlipped}
      onClick={handleCardClick}
    />
  );

  // create jsx object for each card
  const renderTableCols = (cards) => {
    return Object.values(cards).map(
        (item, idx) => <td key={idx}>{createGameCard(item)}</td>);
  };

  // create a jsx object for the grid
  const constructTable = (width, height) => {
    const widthArray = Array.from(Array(width).keys());
    const heightArray = Array.from(Array(height).keys());
    const content = renderTableCols(cardStates);
    return (
      <table>
        <tbody>
          {heightArray.map(
              (idx, i) => (<tr key={idx}>{widthArray.map(
                  (idx, j)=> content[i*width+j])}</tr>))}
        </tbody>
      </table>);
  };

  const startOver = () => {
    setGridWidth(4);
    setGridHeight(4);
    resetCardsStates(true, 4, 4);
    setTryCount(0);
  };

  // first render will generate a new grid
  useEffect(() => {
    resetCardsStates(false, gridWidth, gridHeight);
  }, []);

  // update grid once width and height are changed by the user
  useEffect(() => {
    resetCardsStates(false, gridWidth, gridHeight);
    setTryCount(0);
  }, [gridWidth, gridHeight]);

  return (
    <div className="App">
      <div >
        <Button
          color="primary"
          onClick={incrementWidth}>
          Make it harder!
        </Button>
        <Button
          color="primary"
          onClick={startOver}>
            Reset
        </Button>
        <Button
          color="primary"
          onClick={revealAllCards}>
          Reveal!
        </Button>
        <h3>
          Keep flipping cards until every pair of cards is found!
          <br/>
          {score == gridWidth*gridHeight/2? 'You won!' : `Score: ${score}`}
        </h3>
      </div>
      <div className="table-div">{constructTable(gridWidth, gridHeight)}</div>
    </div>
  );
}

export default App;
