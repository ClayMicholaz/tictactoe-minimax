import React, { useState, useCallback, useRef } from 'react';
import './App.css';

type Player = 'X' | 'O' | null;
type BoardState = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = useCallback((board: BoardState): Player => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }, []);

  const checkDraw = useCallback((board: BoardState): boolean => {
    return board.every(cell => cell !== null) && !checkWinner(board);
  }, [checkWinner]);

  const minimax = useRef((
    board: BoardState, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): [number, number | null] => {
    const winner = checkWinner(board);
    
    if (winner === 'X') return [-10 + depth, null];
    if (winner === 'O') return [10 - depth, null];
    if (checkDraw(board)) return [0, null];

    let bestEval = isMaximizing ? -Infinity : Infinity;
    let bestMove: number | null = null;
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = isMaximizing ? 'O' : 'X';
        const [evaluation] = minimax.current(newBoard, depth + 1, alpha, beta, !isMaximizing);
        
        if ((isMaximizing && evaluation > bestEval) || (!isMaximizing && evaluation < bestEval)) {
          bestEval = evaluation;
          bestMove = i;
        }
        
        if (isMaximizing) {
          alpha = Math.max(alpha, evaluation);
        } else {
          beta = Math.min(beta, evaluation);
        }
        
        if (beta <= alpha) break;
      }
    }
    
    return [bestEval, bestMove];
  });

  const getAIMove = useCallback((board: BoardState): number => {
    const [, move] = minimax.current(board, 0, -Infinity, Infinity, true);
    return move ?? board.findIndex(cell => cell === null);
  }, []);

  const makeMove = useCallback((index: number) => {
    if (winner || isDraw || board[index] || currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const newWinner = checkWinner(newBoard);
    const newDraw = checkDraw(newBoard);

    setBoard(newBoard);
    setWinner(newWinner);
    setIsDraw(newDraw);

    if (!newWinner && !newDraw) {
      setCurrentPlayer('O');
      
      setTimeout(() => {
        const aiMove = getAIMove(newBoard);
        const finalBoard = [...newBoard];
        finalBoard[aiMove] = 'O';

        const finalWinner = checkWinner(finalBoard);
        const finalDraw = checkDraw(finalBoard);

        setBoard(finalBoard);
        setWinner(finalWinner);
        setIsDraw(finalDraw);
        setCurrentPlayer('X');
      }, 500);
    }
  }, [board, currentPlayer, winner, isDraw, checkWinner, checkDraw, getAIMove]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  const getStatusMessage = () => {
    if (winner) return winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖';
    if (isDraw) return "It's a Draw! 🤝";
    return currentPlayer === 'X' ? "Your Turn" : "AI Thinking...";
  };

  const isHumanTurn = currentPlayer === 'X' && !winner && !isDraw;

  const Cell: React.FC<{ value: Player; index: number }> = ({ value, index }) => (
    <button
      className={`cell ${value ? 'filled' : ''} ${value === 'X' ? 'x' : value === 'O' ? 'o' : ''}`}
      onClick={() => makeMove(index)}
      disabled={!!value || winner !== null || isDraw || !isHumanTurn}
    >
      {value}
    </button>
  );

  return (
    <div className="app">
      <div className="game-container">
        <div className="header">
          <h1>Tic Tac Toe</h1>
          <div className="subtitle">Clay Micholaz Fu- 32240207</div>
          <div className="subtitle">Jonatan Nilena Wahyudi- 32240183</div>
          <div className="subtitle">Egner Constantin- 32240194</div>
        </div>
        
        <div className="game-area">
          <div className="player-info">
            <div className={`player-card human ${currentPlayer === 'X' && !winner && !isDraw ? 'active' : ''}`}>
              <div className="player-header">
                <div className="player-icon">👤</div>
                <div className="player-badge">You</div>
              </div>
              <div className="player-symbol x-symbol">X</div>
              <div className="player-status">
                {currentPlayer === 'X' && !winner && !isDraw ? '🟢 Your Turn' : '⚪ Waiting'}
              </div>
            </div>

            <div className="vs-text">VS</div>

            <div className={`player-card ai ${currentPlayer === 'O' && !winner && !isDraw ? 'active' : ''}`}>
              <div className="player-header">
                <div className="player-icon">🤖</div>
                <div className="player-badge">AI</div>
              </div>
              <div className="player-symbol o-symbol">O</div>
              <div className="player-status">
                {currentPlayer === 'O' && !winner && !isDraw ? '🤔 Thinking...' : '⚪ Waiting'}
              </div>
            </div>
          </div>

          <div className="game-board">
            <div className={`game-status ${winner ? (winner === 'X' ? 'win' : 'lose') : ''}`}>
              {getStatusMessage()}
            </div>

            <div className="board">
              {board.map((cell, index) => (
                <Cell key={index} value={cell} index={index} />
              ))}
            </div>

            <button className="reset-button" onClick={resetGame}>
              <span className="reset-icon">🔄</span>
              New Game
            </button>
          </div>

          <div className="game-info">
            <p>You play as <strong>X</strong>, AI plays as <strong>O</strong></p>
            <p>The AI uses <strong>Minimax algorithm</strong> with Alpha-Beta pruning</p>
            <p><em>Best you can achieve is a draw!</em></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;