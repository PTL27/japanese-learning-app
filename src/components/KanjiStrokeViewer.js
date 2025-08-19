import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, Info } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';

const KanjiStrokeViewer = ({ kanji, strokeData, className = "" }) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Color palette for strokes
  const strokeColors = [
    '#dc2626', // red
    '#2563eb', // blue  
    '#16a34a', // green
    '#ea580c', // orange
    '#9333ea', // purple
    '#0891b2'  // cyan
  ];

  // Reset animation when kanji changes
  useEffect(() => {
    setCurrentStroke(0);
    setIsAnimating(false);
    if (animationRef.current) {
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [kanji, strokeData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const animateStroke = (strokeIndex, duration = 2000 / animationSpeed) => {
    const svgElement = svgRef.current;
    if (!svgElement || !strokeData || strokeIndex >= strokeData.strokes.length) return;

    const pathElement = svgElement.querySelector(`#stroke-${strokeIndex}`);
    if (!pathElement) return;

    const pathLength = pathElement.getTotalLength();
    
    // Reset path
    pathElement.style.strokeDasharray = pathLength;
    pathElement.style.strokeDashoffset = pathLength;
    pathElement.style.opacity = '1';

    // Animate stroke
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      pathElement.style.strokeDashoffset = pathLength * (1 - easedProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        pathElement.style.strokeDasharray = 'none';
        pathElement.style.strokeDashoffset = '0';
        
        // Move to next stroke after a brief pause
        timeoutRef.current = setTimeout(() => {
          if (strokeIndex < strokeData.strokes.length - 1) {
            setCurrentStroke(strokeIndex + 1);
          } else {
            // Animation complete
            setIsAnimating(false);
            setCurrentStroke(strokeData.strokes.length);
          }
        }, 500 / animationSpeed);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation when currentStroke changes during animation
  useEffect(() => {
    if (isAnimating && strokeData && currentStroke < strokeData.strokes.length) {
      animateStroke(currentStroke);
    }
  }, [currentStroke, isAnimating, animationSpeed, strokeData]);

  const startAnimation = () => {
    if (!strokeData || strokeData.strokes.length === 0) return;
    
    setCurrentStroke(0);
    setIsAnimating(true);
    
    // Reset all strokes
    resetAllStrokes();
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetAnimation = () => {
    pauseAnimation();
    setCurrentStroke(0);
    resetAllStrokes();
  };

  const resetAllStrokes = () => {
    const svgElement = svgRef.current;
    if (!svgElement || !strokeData) return;

    strokeData.strokes.forEach((_, index) => {
      const pathElement = svgElement.querySelector(`#stroke-${index}`);
      if (pathElement) {
        pathElement.style.strokeDasharray = 'none';
        pathElement.style.strokeDashoffset = '0';
        pathElement.style.opacity = showGuides ? '0.2' : '0';
      }
    });
  };

  const showStrokeUpTo = (strokeIndex) => {
    const svgElement = svgRef.current;
    if (!svgElement || !strokeData) return;

    strokeData.strokes.forEach((_, index) => {
      const pathElement = svgElement.querySelector(`#stroke-${index}`);
      if (pathElement) {
        if (index <= strokeIndex) {
          pathElement.style.strokeDasharray = 'none';
          pathElement.style.strokeDashoffset = '0';
          pathElement.style.opacity = '1';
        } else {
          pathElement.style.opacity = showGuides ? '0.2' : '0';
        }
      }
    });
  };

  const handleStrokeClick = (strokeIndex) => {
    if (isAnimating) return;
    
    setCurrentStroke(strokeIndex + 1);
    showStrokeUpTo(strokeIndex);
  };

  const nextStroke = () => {
    if (currentStroke < strokeData?.strokes.length) {
      const newStroke = currentStroke + 1;
      setCurrentStroke(newStroke);
      showStrokeUpTo(newStroke - 1);
    }
  };

  const prevStroke = () => {
    if (currentStroke > 0) {
      const newStroke = currentStroke - 1;
      setCurrentStroke(newStroke);
      showStrokeUpTo(newStroke - 1);
    }
  };

  if (!strokeData || !strokeData.strokes) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl p-8 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600">Không có dữ liệu nét vẽ</p>
          <p className="text-sm text-gray-500 mt-2">Kanji: {kanji}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-4xl font-bold text-gray-800">{kanji}</div>
          <div className="text-sm text-gray-600">
            <div className="font-medium">{strokeData.totalStrokes} nét</div>
            <div className="text-xs">Unicode: {strokeData.unicode}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => playTextToSpeech(kanji)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            title="Thông tin chi tiết"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-1">Thông tin stroke:</div>
              <div className="text-blue-600">
                <div>Tổng số nét: {strokeData.totalStrokes}</div>
                <div>ViewBox: {strokeData.viewBox}</div>
                <div>Nguồn: {strokeData.metadata?.source}</div>
              </div>
            </div>
            
            {strokeData.groups && strokeData.groups.length > 0 && (
              <div>
                <div className="font-medium text-blue-800 mb-1">Cấu trúc:</div>
                <div className="text-blue-600">
                  {strokeData.groups.map((group, index) => (
                    <div key={index}>
                      Element: {group.element || 'N/A'} 
                      {group.type && ` (${group.type})`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Display */}
      <div className="p-6">
        <div className="flex justify-center mb-4">
          <div className="relative bg-gray-50 rounded-lg p-4" style={{ width: '300px', height: '300px' }}>
            <svg
              ref={svgRef}
              viewBox={strokeData.viewBox || "0 0 109 109"}
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid guides (optional) */}
              {showGuides && (
                <g stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5">
                  <line x1="0" y1="54.5" x2="109" y2="54.5" />
                  <line x1="54.5" y1="0" x2="54.5" y2="109" />
                  <rect x="0" y="0" width="109" height="109" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                </g>
              )}
              
              {/* Stroke paths */}
              {strokeData.strokes.map((stroke, index) => {
                const strokeColor = strokeColors[index % strokeColors.length];
                const isVisible = index < currentStroke || (isAnimating && index === currentStroke);
                
                return (
                  <path
                    key={index}
                    id={`stroke-${index}`}
                    d={stroke.path}
                    stroke={strokeColor}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ 
                      opacity: isVisible ? '1' : (showGuides ? '0.15' : '0'),
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => handleStrokeClick(index)}
                    onMouseEnter={(e) => {
                      if (!isAnimating && !isVisible) {
                        e.target.style.opacity = '0.5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnimating && !isVisible) {
                        e.target.style.opacity = showGuides ? '0.15' : '0';
                      }
                    }}
                  />
                );
              })}
              
              {/* Stroke order numbers */}
              {showGuides && strokeData.strokes.map((stroke, index) => {
                const strokeColor = strokeColors[index % strokeColors.length];
                const isVisible = index < currentStroke || (isAnimating && index === currentStroke);
                
                // Only show number if stroke is visible
                if (!isVisible) return null;
                
                // Calculate position for stroke number - offset to avoid overlapping with strokes
                const pathElement = document.querySelector(`#stroke-${index}`);
                const bbox = pathElement?.getBBox();
                let x, y;
                
                if (bbox) {
                  // Position numbers at the start of each stroke path, with small offset
                  x = bbox.x - 6;
                  y = bbox.y - 4;
                  
                  // Ensure numbers stay within viewBox bounds
                  x = Math.max(8, Math.min(x, 101));
                  y = Math.max(12, Math.min(y, 101));
                } else {
                  // Fallback positioning
                  x = 15 + (index % 4) * 25;
                  y = 15 + Math.floor(index / 4) * 25;
                }
                
                return (
                  <text
                    key={`number-${index}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="8"
                    fill={strokeColor}
                    fontWeight="900"
                    fontFamily="Arial"
                    stroke="white"
                    strokeWidth="0.5"
                  >
                    {index + 1}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Animation Controls */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={resetAnimation}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={prevStroke}
              disabled={currentStroke === 0}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Nét trước"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={isAnimating ? pauseAnimation : startAnimation}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
              title={isAnimating ? "Dừng" : "Phát"}
            >
              {isAnimating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={nextStroke}
              disabled={currentStroke >= strokeData.strokes.length}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Nét tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress and Settings */}
          <div className="space-y-3">
            {/* Progress */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                Nét {Math.min(currentStroke, strokeData.strokes.length)} / {strokeData.strokes.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStroke / strokeData.strokes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <label className="text-gray-600">Tốc độ:</label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>Chậm</option>
                  <option value={1}>Bình thường</option>
                  <option value={1.5}>Nhanh</option>
                  <option value={2}>Rất nhanh</option>
                </select>
              </div>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-gray-600">Hiện hướng dẫn</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanjiStrokeViewer;