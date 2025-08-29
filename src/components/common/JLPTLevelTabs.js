import React from 'react';
import { JLPT_LEVEL_ARRAY } from '../../constants/jlptLevels';
import './JLPTLevelTabs.css';

const JLPTLevelTabs = ({ selectedLevel, onLevelChange, className = '' }) => {
  return (
    <div className={`jlpt-level-tabs ${className}`}>
      {JLPT_LEVEL_ARRAY.map(({ level, color }) => (
        <button
          key={level}
          className={`level-tab ${selectedLevel === level ? 'active' : ''}`}
          style={{
            backgroundColor: selectedLevel === level ? color : 'transparent',
            color: selectedLevel === level ? 'white' : color,
            borderColor: color
          }}
          onClick={() => onLevelChange(level)}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default JLPTLevelTabs;