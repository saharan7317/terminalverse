// TerminalVerse — Snake Game Component

import { useState, useEffect, useCallback, useRef } from 'react';
import { colorize, bold, dim } from '../../utils/ansiColors';

interface SnakeGameProps {
  onExit: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID_WIDTH = 30;
const GRID_HEIGHT = 15;
const TICK_MS = 200;

export default function SnakeGame({ onExit }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>([{ x: 15, y: 7 }, { x: 14, y: 7 }, { x: 13, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 20, y: 7 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('tv_snake_highscore') || '0'); }
    catch { return 0; }
  });
  const [paused, setPaused] = useState(false);

  const dirRef = useRef(direction);
  dirRef.current = direction;

  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
    } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault();
          if (dirRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault();
          if (dirRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault();
          if (dirRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault();
          if (dirRef.current !== 'LEFT') setDirection('RIGHT');
          break;
        case 'p': case 'P':
          e.preventDefault();
          setPaused(prev => !prev);
          break;
        case 'q': case 'Q': case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'r': case 'R':
          if (gameOver) {
            e.preventDefault();
            // Reset
            const newSnake = [{ x: 15, y: 7 }, { x: 14, y: 7 }, { x: 13, y: 7 }];
            setSnake(newSnake);
            setFood(spawnFood(newSnake));
            setDirection('RIGHT');
            setGameOver(false);
            setScore(0);
            setPaused(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, onExit, spawnFood]);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const timer = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };

        switch (dirRef.current) {
          case 'UP': head.y--; break;
          case 'DOWN': head.y++; break;
          case 'LEFT': head.x--; break;
          case 'RIGHT': head.x++; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              try { localStorage.setItem('tv_snake_highscore', String(newScore)); }
              catch { /* ignore */ }
            }
            return newScore;
          });
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [gameOver, paused, food, highScore, spawnFood]);

  // Render the game grid
  const renderGrid = (): string => {
    const lines: string[] = [];

    // Header
    lines.push('');
    lines.push(`  ${bold(colorize('🐍 SNAKE', 'accent'))}  ${dim('Score:')} ${colorize(String(score), 'primary')}  ${dim('High:')} ${colorize(String(highScore), 'warning')}`);
    lines.push('');

    // Top border
    lines.push(`  ${colorize('╔' + '══'.repeat(GRID_WIDTH) + '╗', 'dim')}`);

    // Grid rows
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let row = `  ${colorize('║', 'dim')}`;

      for (let x = 0; x < GRID_WIDTH; x++) {
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = !isHead && snake.some(s => s.x === x && s.y === y);
        const isFood = food.x === x && food.y === y;

        if (isHead) {
          row += colorize('██', 'accent');
        } else if (isBody) {
          row += colorize('██', 'primary');
        } else if (isFood) {
          row += colorize('██', 'error');
        } else {
          row += '  ';
        }
      }

      row += colorize('║', 'dim');
      lines.push(row);
    }

    // Bottom border
    lines.push(`  ${colorize('╚' + '══'.repeat(GRID_WIDTH) + '╝', 'dim')}`);
    lines.push('');

    if (gameOver) {
      lines.push(`  ${bold(colorize('  GAME OVER!', 'error'))}  ${dim('Score:')} ${colorize(String(score), 'primary')}`);
      lines.push(`  ${dim('Press [R] to restart · [Q] to quit')}`);
    } else if (paused) {
      lines.push(`  ${bold(colorize('  PAUSED', 'warning'))}  ${dim('Press [P] to resume')}`);
    } else {
      lines.push(`  ${dim('WASD/Arrows: Move · P: Pause · Q: Quit')}`);
    }
    lines.push('');

    return lines.join('\n');
  };

  return (
    <div className="snake-game">
      <pre
        className="game-render"
        dangerouslySetInnerHTML={{ __html: renderGrid() }}
      />
    </div>
  );
}
