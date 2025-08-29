import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import JLPTLevelTabs from './common/JLPTLevelTabs';
import GrammarDetailPage from './GrammarDetailPage';
import { getLevelColor, getLevelBgColor } from '../constants/jlptLevels';
import './GrammarPage.css';

const GrammarPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [grammarData, setGrammarData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchGrammarByLevel(selectedLevel);
    setCurrentPage(1);
    setSearchTerm('');
  }, [selectedLevel]);

  useEffect(() => {
    filterGrammarData();
    setCurrentPage(1);
  }, [grammarData, searchTerm]);

  const filterGrammarData = () => {
    if (!searchTerm) {
      setFilteredData(grammarData);
    } else {
      const filtered = grammarData.filter(item => 
        item.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usage.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const fetchGrammarByLevel = async (level) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grammar/${level}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrammarData(data);
      } else {
        console.error('Failed to fetch grammar data');
        const mockData = getMockGrammarData(level);
        setGrammarData(mockData);
      }
    } catch (error) {
      console.error('Error fetching grammar:', error);
      const mockData = getMockGrammarData(level);
      setGrammarData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMockGrammarData = (level) => {
    const mockData = {
      N5: [
        {
          id: 1,
          pattern: 'です/だ',
          meaning: 'to be (polite/casual)',
          usage: 'Used to end sentences politely or casually',
          example: '私は学生です。',
          translation: 'I am a student.',
          notes: 'です is polite form, だ is casual form'
        },
        {
          id: 2, 
          pattern: 'は (wa)',
          meaning: 'topic particle',
          usage: 'Marks the topic of the sentence',
          example: '私は田中です。',
          translation: 'As for me, I am Tanaka.',
          notes: 'Written as は but pronounced wa'
        },
        {
          id: 3,
          pattern: 'を (wo)',
          meaning: 'object particle',
          usage: 'Marks the direct object of the sentence',
          example: '映画を見ます。',
          translation: 'I watch a movie.',
          notes: 'Written as を but pronounced wo'
        },
        {
          id: 4,
          pattern: 'に',
          meaning: 'to/at/in (direction/location/time)',
          usage: 'Indicates direction, location, or time',
          example: '学校に行きます。',
          translation: 'I go to school.',
          notes: 'Multi-purpose particle'
        },
        {
          id: 5,
          pattern: 'で',
          meaning: 'at/in/by (location/means)',
          usage: 'Indicates location of action or means',
          example: '図書館で勉強します。',
          translation: 'I study at the library.',
          notes: 'Different from に for location'
        },
        {
          id: 6,
          pattern: 'から',
          meaning: 'from/since',
          usage: 'Indicates starting point in time or place',
          example: '9時から働きます。',
          translation: 'I work from 9 o\'clock.',
          notes: 'Can indicate time or place'
        }
      ],
      N4: [
        {
          id: 7,
          pattern: 'たことがある',
          meaning: 'have experience of doing',
          usage: 'Express past experience',
          example: '日本に行ったことがあります。',
          translation: 'I have been to Japan.',
          notes: 'Use past tense + ことがある'
        },
        {
          id: 8,
          pattern: 'てもいいです',
          meaning: 'it is okay to do',
          usage: 'Ask for or give permission',
          example: '写真を撮ってもいいですか。',
          translation: 'Is it okay to take a photo?',
          notes: 'Polite way to ask permission'
        },
        {
          id: 9,
          pattern: 'なければならない',
          meaning: 'must do/have to do',
          usage: 'Express strong obligation',
          example: '宿題をしなければならない。',
          translation: 'I have to do homework.',
          notes: 'Strong necessity'
        },
        {
          id: 10,
          pattern: 'ようだ',
          meaning: 'it seems like/appears',
          usage: 'Express appearance or hearsay',
          example: '雨が降りそうだ。',
          translation: 'It looks like it will rain.',
          notes: 'Based on observation'
        }
      ],
      N3: [
        {
          id: 11,
          pattern: 'べきだ',
          meaning: 'should/ought to',
          usage: 'Express strong obligation or duty',
          example: '学生は勉強するべきだ。',
          translation: 'Students should study.',
          notes: 'Strong form of obligation'
        },
        {
          id: 12,
          pattern: 'はずだ',
          meaning: 'should be/expected to be',
          usage: 'Express expectation based on reason',
          example: '彼はもう来ているはずだ。',
          translation: 'He should already be here.',
          notes: 'Based on logical expectation'
        },
        {
          id: 13,
          pattern: 'に対して',
          meaning: 'toward/against/in response to',
          usage: 'Express direction of action or feeling',
          example: '先生に対して失礼だ。',
          translation: 'It\'s rude toward the teacher.',
          notes: 'Shows direction of emotion/action'
        }
      ],
      N2: [
        {
          id: 14,
          pattern: 'わけではない',
          meaning: 'it is not that...',
          usage: 'Deny or soften a statement',
          example: '嫌いなわけではない。',
          translation: 'It is not that I dislike it.',
          notes: 'Used to deny or soften'
        },
        {
          id: 15,
          pattern: 'に違いない',
          meaning: 'must be/no doubt that',
          usage: 'Express strong conviction',
          example: '彼は忙しいに違いない。',
          translation: 'He must be busy.',
          notes: 'Strong certainty'
        },
        {
          id: 16,
          pattern: 'にもかかわらず',
          meaning: 'in spite of/despite',
          usage: 'Express contrast despite circumstances',
          example: '雨にもかかわらず出かけた。',
          translation: 'I went out despite the rain.',
          notes: 'Formal expression of contrast'
        }
      ],
      N1: [
        {
          id: 17,
          pattern: 'かたがた',
          meaning: 'on the occasion of/while',
          usage: 'Formal expression for doing two things',
          example: 'お礼かたがたご挨拶に伺います。',
          translation: 'I will visit to greet and thank you.',
          notes: 'Very formal expression'
        },
        {
          id: 18,
          pattern: 'ところを',
          meaning: 'at the time when',
          usage: 'Express timing of an action',
          example: 'お忙しいところをすみません。',
          translation: 'Sorry to bother you when you are busy.',
          notes: 'Polite expression'
        },
        {
          id: 19,
          pattern: 'たところで',
          meaning: 'even if',
          usage: 'Express futility of an action',
          example: '今から行ったところで間に合わない。',
          translation: 'Even if I go now, I won\'t make it in time.',
          notes: 'Expresses uselessness of action'
        }
      ]
    };
    return mockData[level] || [];
  };

  const handleGrammarClick = (grammarItem) => {
    setSelectedGrammar(grammarItem);
  };

  const handleBackToList = () => {
    setSelectedGrammar(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const levelConfig = {
    color: getLevelColor(selectedLevel),
    bgColor: getLevelBgColor(selectedLevel)
  };

  // Show detail page if grammar is selected
  if (selectedGrammar) {
    return (
      <GrammarDetailPage
        grammarItem={selectedGrammar}
        selectedLevel={selectedLevel}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="grammar-page">
      <div className="grammar-header">
        <h1>文法 (Grammar)</h1>
        <p>Master Japanese grammar patterns by JLPT level</p>
      </div>

      <JLPTLevelTabs
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        className="grammar-level-tabs"
      />

      <div className="grammar-content">
        <div className="level-info" style={{ backgroundColor: levelConfig.bgColor }}>
          <h2 style={{ color: levelConfig.color }}>
            JLPT {selectedLevel} Grammar Patterns
          </h2>
          <p>
            {filteredData.length} patterns found for {selectedLevel} level
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search grammar patterns, meanings, or usage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Results summary */}
        <div className="results-summary">
          <span>Showing {currentData.length} of {filteredData.length} patterns</span>
          {searchTerm && <span> for "{searchTerm}"</span>}
        </div>

        {loading ? (
          <div className="loading">Loading grammar patterns...</div>
        ) : (
          <>
            {/* Grammar Grid - 2 columns */}
            <div className="grammar-grid">
              {currentData.map((item) => (
                <div
                  key={item.id}
                  className="grammar-item"
                  onClick={() => handleGrammarClick(item)}
                >
                  <div className="pattern-info">
                    <span 
                      className="pattern"
                      style={{ color: levelConfig.color }}
                    >
                      {item.pattern}
                    </span>
                    <span className="meaning">{item.meaning}</span>
                  </div>
                  <div className="preview-example">
                    <div className="japanese">{item.example}</div>
                    <div className="translation">{item.translation}</div>
                  </div>
                  <div className="click-hint">Click for details →</div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`page-btn ${
                            currentPage === page ? 'active' : ''
                          }`}
                          style={{
                            backgroundColor: currentPage === page ? levelConfig.color : 'transparent',
                            color: currentPage === page ? 'white' : levelConfig.color
                          }}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="page-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="no-data">
            {searchTerm ? (
              <>
                <p>No grammar patterns found for "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                  style={{ backgroundColor: levelConfig.color }}
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p>No grammar patterns available for {selectedLevel} level yet.</p>
                <p>Check back later for updates!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarPage;