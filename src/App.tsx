import { useState } from 'react';
import './App.css';
import { generateLadder, getPath, type LadderData } from './utils/ladderLogic';

function App() {
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState<string[]>(['참가자1', '참가자2', '참가자3', '참가자4']);
  const [results, setResults] = useState<string[]>(['꽝', '당첨', '꽝', '꽝']);
  const [stage, setStage] = useState<'setup' | 'play'>('setup');
  const [ladder, setLadder] = useState<LadderData | null>(null);
  const [animatingPath, setAnimatingPath] = useState<{ index: number; path: number[] } | null>(null);
  const [completedPaths, setCompletedPaths] = useState<Set<number>>(new Set());
  const [revealedResults, setRevealedResults] = useState<Set<number>>(new Set());

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setNames(Array.from({ length: count }, (_, i) => `참가자${i + 1}`));
    setResults(Array.from({ length: count }, (_, i) => (i === 1 ? '당첨' : '꽝')));
    setRevealedResults(new Set());
  };

  const startGame = () => {
    const newLadder = generateLadder(playerCount, 10);
    setLadder(newLadder);
    setStage('play');
    setAnimatingPath(null);
    setCompletedPaths(new Set());
    setRevealedResults(new Set());
  };

  const handleNameChange = (index: number, val: string) => {
    const newNames = [...names];
    newNames[index] = val;
    setNames(newNames);
  };

  const handleResultChange = (index: number, val: string) => {
    const newResults = [...results];
    newResults[index] = val;
    setResults(newResults);
  };

  const startAnimation = (index: number) => {
    if (!ladder || animatingPath || completedPaths.has(index)) return;
    const path = getPath(index, ladder);
    const destinationIndex = path[path.length - 1];
    setAnimatingPath({ index, path });
    
    // Simulate animation delay
    setTimeout(() => {
      setCompletedPaths(prev => new Set(prev).add(index));
      setRevealedResults(prev => new Set(prev).add(destinationIndex));
      setAnimatingPath(null);
    }, 2000);
  };

  return (
    <div className="container">
      <h1>사다리 타기 게임</h1>

      {stage === 'setup' ? (
        <div className="setup-card">
          <div className="input-group">
            <label>인원 수: </label>
            <input 
              type="number" 
              value={playerCount} 
              min={2} 
              max={10} 
              onChange={(e) => handlePlayerCountChange(Number(e.target.value))} 
            />
          </div>
          
          <div className="names-results-grid">
            <div className="column">
              <h3>이름</h3>
              {names.map((name, i) => (
                <input key={`name-${i}`} value={name} onChange={(e) => handleNameChange(i, e.target.value)} />
              ))}
            </div>
            <div className="column">
              <h3>결과</h3>
              {results.map((res, i) => (
                <input key={`res-${i}`} value={res} onChange={(e) => handleResultChange(i, e.target.value)} />
              ))}
            </div>
          </div>

          <button className="start-btn" onClick={startGame}>게임 시작!</button>
        </div>
      ) : (
        <div className="play-area">
          <div className="ladder-wrapper">
            <div className="names-row">
              {names.map((name, i) => (
                <div 
                  key={i} 
                  className={`node name-node ${completedPaths.has(i) ? 'completed' : ''}`} 
                  onClick={() => startAnimation(i)}
                >
                  {name}
                </div>
              ))}
            </div>

            <div className="svg-container">
              <LadderSVG 
                ladder={ladder!} 
                animatingPath={animatingPath} 
                allPaths={Array.from(completedPaths).map(idx => ({ index: idx, path: getPath(idx, ladder!) }))}
              />
            </div>

            <div className="results-row">
              {results.map((res, i) => (
                <div key={i} className={`node result-node ${revealedResults.has(i) ? 'revealed' : ''}`}>
                  {revealedResults.has(i) ? res : '?'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="controls">
            <button onClick={() => setStage('setup')}>다시 설정</button>
            <button onClick={() => {
              const newLadder = generateLadder(playerCount, 10);
              setLadder(newLadder);
              setCompletedPaths(new Set());
              setRevealedResults(new Set());
              setAnimatingPath(null);
            }}>사다리 섞기</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LadderSVG({ ladder, animatingPath, allPaths }: { 
  ladder: LadderData, 
  animatingPath: { index: number, path: number[] } | null,
  allPaths: { index: number, path: number[] }[]
}) {
  const width = 600;
  const height = 400;
  const colWidth = width / (ladder.playerCount - 1 || 1);
  const rowHeight = height / (ladder.rowCount + 1);

  const getX = (index: number) => index * colWidth;
  const getY = (row: number) => (row + 1) * rowHeight;

  return (
    <svg width={width} height={height} viewBox={`-20 0 ${width + 40} ${height}`}>
      {/* Vertical Lines */}
      {Array.from({ length: ladder.playerCount }).map((_, i) => (
        <line key={`v-${i}`} x1={getX(i)} y1={0} x2={getX(i)} y2={height} stroke="#ccc" strokeWidth="4" />
      ))}

      {/* Horizontal Rungs */}
      {ladder.rungs.map((rung, i) => (
        <line 
          key={`h-${i}`} 
          x1={getX(rung.fromIndex)} 
          y1={getY(rung.row)} 
          x2={getX(rung.fromIndex + 1)} 
          y2={getY(rung.row)} 
          stroke="#ccc" 
          strokeWidth="4" 
        />
      ))}

      {/* Completed Paths */}
      {allPaths.map(({ index, path }) => (
        <PathLine key={`path-${index}`} path={path} getX={getX} getY={getY} color="#ff6b6b" opacity={0.4} />
      ))}

      {/* Animating Path */}
      {animatingPath && (
        <PathLine path={animatingPath.path} getX={getX} getY={getY} color="#ff6b6b" isAnimating />
      )}
    </svg>
  );
}

function PathLine({ path, getX, getY, color, isAnimating, opacity = 1 }: { 
  path: number[], 
  getX: (i: number) => number, 
  getY: (r: number) => number,
  color: string,
  isAnimating?: boolean,
  opacity?: number
}) {
  let d = `M ${getX(path[0])} 0`;
  for (let r = 0; r < path.length - 1; r++) {
    const currentX = getX(path[r]);
    const nextX = getX(path[r + 1]);
    const y = getY(r);
    
    // Go down to the rung level
    d += ` L ${currentX} ${y}`;
    // Go across if there's a horizontal shift
    if (currentX !== nextX) {
      d += ` L ${nextX} ${y}`;
    }
  }
  // Go to bottom
  d += ` L ${getX(path[path.length - 1])} 400`;

  return (
    <path 
      d={d} 
      fill="none" 
      stroke={color} 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ opacity }}
      className={isAnimating ? 'path-animation' : ''}
    />
  );
}

export default App;
