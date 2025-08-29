import React from 'react';
import { ArrowLeft, BookOpen, Volume2 } from 'lucide-react';
import { getLevelColor, getLevelBgColor } from '../constants/jlptLevels';
import './GrammarDetailPage.css';

const GrammarDetailPage = ({ grammarItem, selectedLevel, onBack }) => {
  const levelConfig = {
    color: getLevelColor(selectedLevel),
    bgColor: getLevelBgColor(selectedLevel)
  };

  const playTextToSpeech = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="grammar-detail-page">
      {/* Header with Back Button */}
      <div className="grammar-detail-header">
        <button 
          onClick={onBack}
          className="back-button"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Grammar List
        </button>
        
        <div className="level-badge" style={{ backgroundColor: levelConfig.color }}>
          JLPT {selectedLevel}
        </div>
      </div>

      {/* Main Content */}
      <div className="grammar-detail-content">
        {/* Pattern Card */}
        <div className="pattern-card" style={{ borderColor: levelConfig.color }}>
          <div className="pattern-header">
            <h1 
              className="pattern-title"
              style={{ color: levelConfig.color }}
            >
              {grammarItem.pattern}
            </h1>
            <button
              onClick={() => playTextToSpeech(grammarItem.pattern)}
              className="pronunciation-button"
              style={{ backgroundColor: levelConfig.color }}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="pattern-meaning">
            <h3>Meaning</h3>
            <p>{grammarItem.meaning}</p>
          </div>
        </div>

        {/* Usage Section */}
        <div className="section-card">
          <div className="section-header">
            <BookOpen className="w-5 h-5 mr-2" style={{ color: levelConfig.color }} />
            <h2>Usage</h2>
          </div>
          <div className="section-content">
            <p>{grammarItem.usage}</p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="section-card">
          <div className="section-header">
            <h2>Examples</h2>
          </div>
          <div className="section-content">
            <div className="example-item">
              <div className="japanese-example">
                <span className="japanese-text">{grammarItem.example}</span>
                <button
                  onClick={() => playTextToSpeech(grammarItem.example)}
                  className="example-sound-button"
                  style={{ backgroundColor: levelConfig.color }}
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
              <div className="translation">{grammarItem.translation}</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {grammarItem.notes && (
          <div className="section-card notes-section">
            <div className="section-header">
              <h2>Notes</h2>
            </div>
            <div className="section-content">
              <div className="notes-content" style={{ backgroundColor: levelConfig.bgColor }}>
                <p>{grammarItem.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Examples (if available) */}
        {grammarItem.additionalExamples && (
          <div className="section-card">
            <div className="section-header">
              <h2>More Examples</h2>
            </div>
            <div className="section-content">
              {grammarItem.additionalExamples.map((example, index) => (
                <div key={index} className="example-item">
                  <div className="japanese-example">
                    <span className="japanese-text">{example.sentence}</span>
                    <button
                      onClick={() => playTextToSpeech(example.sentence)}
                      className="example-sound-button"
                      style={{ backgroundColor: levelConfig.color }}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="translation">{example.translation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Grammar (if available) */}
        {grammarItem.relatedGrammar && (
          <div className="section-card">
            <div className="section-header">
              <h2>Related Grammar</h2>
            </div>
            <div className="section-content">
              <div className="related-grammar">
                {grammarItem.relatedGrammar.map((related, index) => (
                  <span 
                    key={index} 
                    className="related-tag"
                    style={{ backgroundColor: levelConfig.bgColor, color: levelConfig.color }}
                  >
                    {related}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarDetailPage;