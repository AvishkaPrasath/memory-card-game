import React, { useState, useEffect } from 'react';
import { Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const CARD_PAIRS = [
  '🎨', '🎮', '🎲', '🎸', 
  '🎭', '🎪', '🎯', '🎱'
];

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('memoryGameHighScore');
    return saved ? JSON.parse(saved) : { moves: Infinity, time: Infinity };
  });

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Check for game completion
  useEffect(() => {
    if (matched.length === CARD_PAIRS.length * 2) {
      setIsPlaying(false);
      checkHighScore();
    }
  }, [matched]);

  // Check and update high score
  const checkHighScore = () => {
    if (moves < highScore.moves || 
       (moves === highScore.moves && time < highScore.time)) {
      const newHighScore = { moves, time };
      setHighScore(newHighScore);
      localStorage.setItem('memoryGameHighScore', JSON.stringify(newHighScore));
    }
  };

  // Initialize or restart game
  const initializeGame = () => {
    const shuffledCards = [...CARD_PAIRS, ...CARD_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
  };

  // Handle card click
  const handleCardClick = (id) => {
    if (!isPlaying) setIsPlaying(true);
    
    if (flipped.length === 2) return;
    if (flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        setMatched(prev => [...prev, firstId, secondId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            {formatTime(time)}
          </div>
          <div>Moves: {moves}</div>
        </div>
        <Button 
          onClick={initializeGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
      </div>

      {/* High Score */}
      {highScore.moves !== Infinity && (
        <Alert className="mb-4">
          <AlertTitle>High Score</AlertTitle>
          <AlertDescription>
            Best game: {highScore.moves} moves in {formatTime(highScore.time)}
          </AlertDescription>
        </Alert>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(card => (
          <Card
            key={card.id}
            className={`aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 transform 
              ${(flipped.includes(card.id) || matched.includes(card.id)) ? 'rotate-0' : 'rotate-180 bg-blue-100'}
              ${matched.includes(card.id) ? 'bg-green-100' : ''}
              hover:scale-105`}
            onClick={() => handleCardClick(card.id)}
          >
            {(flipped.includes(card.id) || matched.includes(card.id)) ? 
              card.symbol : 
              '❓'}
          </Card>
        ))}
      </div>

      {/* Victory Message */}
      {matched.length === CARD_PAIRS.length * 2 && (
        <Alert className="mt-6" variant="success">
          <AlertTitle>Congratulations! 🎉</AlertTitle>
          <AlertDescription>
            You completed the game in {moves} moves and {formatTime(time)}!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MemoryGame;
