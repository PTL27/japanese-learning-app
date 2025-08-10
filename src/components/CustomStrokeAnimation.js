import React, { useState, useEffect } from 'react';
import { strokeDatabase } from '../utils/japaneseData';

const CustomStrokeAnimation = ({ character, currentStroke, isPlaying, onComplete }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [currentStroke, isPlaying]);

  const strokeData = strokeDatabase[character];

  if (!strokeData) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-8xl font-bold text-gray-300 mb-4">{character}</div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-2 font-medium">Stroke data đang được phát triển</p>
            <p className="text-xs text-gray-400">
              Có sẵn: {Object.keys(strokeDatabase).slice(0, 10).join(', ')}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full h-80 bg-white rounded-2xl border-2 border-gray-200 shadow-inner relative overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="absolute inset-0"
          key={animationKey}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {/* Background Pattern */}
          <defs>
            <pattern id="writing-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#fafafa"/>
              <rect width="100" height="100" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
            </pattern>
            
            {/* Gradient definitions */}
            <linearGradient id="completed-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9"/>
            </linearGradient>
            
            <linearGradient id="active-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#ef4444" stopOpacity="1"/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.9"/>
            </linearGradient>
            
            <linearGradient id="preview-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.4"/>
            </linearGradient>

            {/* Arrow marker for direction */}
            <marker id="stroke-arrow" markerWidth="10" markerHeight="8" 
                    refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 4, 0 8" fill="#dc2626" opacity="0.8" />
            </marker>
            
            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100" height="100" fill="url(#writing-grid)" />
          
          {/* Traditional guide lines */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="5,5" opacity="0.7"/>
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="5,5" opacity="0.7"/>
          
          {/* Character outline as very light guide */}
          <text 
            x="50" 
            y="70" 
            textAnchor="middle" 
            fontSize="48" 
            fill="#f8fafc" 
            fontFamily="'Noto Sans JP', serif"
            fontWeight="300"
            opacity="0.4"
            style={{ userSelect: 'none' }}
          >
            {character}
          </text>
          
          {/* Completed strokes with enhanced styling */}
          {strokeData.strokes.slice(0, currentStroke).map((stroke, index) => (
            <g key={`completed-${index}`}>
              <path
                d={stroke.path}
                fill="none"
                stroke="url(#completed-stroke)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
                filter="url(#glow)"
              />
            </g>
          ))}
          
          {/* Current animating stroke */}
          {isPlaying && currentStroke < strokeData.strokes.length && (
            <path
              d={strokeData.strokes[currentStroke].path}
              fill="none"
              stroke="url(#active-stroke)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="200"
              strokeDashoffset="200"
              className="animate-draw-stroke"
              onAnimationEnd={onComplete}
              filter="url(#glow)"
            />
          )}
          
          {/* Preview stroke (static dashed line) */}
          {!isPlaying && currentStroke < strokeData.strokes.length && (
            <g>
              <path
                d={strokeData.strokes[currentStroke].path}
                fill="none"
                stroke="url(#preview-stroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6,6"
                opacity="0.7"
              />
              {/* Direction arrow */}
              <path
                d={strokeData.strokes[currentStroke].path}
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.5"
                opacity="0.6"
                markerEnd="url(#stroke-arrow)"
                strokeDasharray="3,3"
              />
            </g>
          )}

          {/* Enhanced stroke order numbers */}
          {strokeData.strokes.map((stroke, index) => {
            const isCompleted = index < currentStroke;
            const isCurrent = index === currentStroke;
            const [x, y] = stroke.start;
            
            return (
              <g key={`number-${index}`}>
                {/* Outer glow circle */}
                <circle
                  cx={x}
                  cy={y - 6}
                  r="9"
                  fill={isCompleted ? "#3b82f6" : isCurrent ? "#dc2626" : "#9ca3af"}
                  opacity="0.2"
                />
                {/* Main circle */}
                <circle
                  cx={x}
                  cy={y - 6}
                  r="7"
                  fill={isCompleted ? "#3b82f6" : isCurrent ? "#dc2626" : "#9ca3af"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Number text */}
                <text
                  x={x}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                  fontFamily="'Inter', sans-serif"
                >
                  {index + 1}
                </text>
                
                {/* Pulse animation for current stroke */}
                {isCurrent && !isPlaying && (
                  <circle
                    cx={x}
                    cy={y - 6}
                    r="7"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Current stroke description overlay - moved to top to not obstruct character */}
        {strokeData.strokes[currentStroke] && (
          <div className="absolute top-4 left-4 right-16">
            <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-sm p-3 rounded-xl border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-red-600">Nét {currentStroke + 1}/{strokeData.strokes.length}:</span>
              </div>
              <p className="mt-1 text-gray-700 text-xs">
                {strokeData.strokes[currentStroke].description}
              </p>
            </div>
          </div>
        )}
        
        {/* Animation status indicator */}
        {isPlaying && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Đang vẽ...</span>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-draw-stroke {
          animation: drawStroke 3s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes drawStroke {
          0% {
            stroke-dashoffset: 200;
            stroke-width: 4;
          }
          25% {
            stroke-width: 5;
          }
          75% {
            stroke-width: 4;
          }
          100% {
            stroke-dashoffset: 0;
            stroke-width: 3;
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomStrokeAnimation;