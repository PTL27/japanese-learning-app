import React, { useState, useEffect } from 'react';
import { Search, Book, Users, Star, Loader, ChevronLeft, ChevronRight, Grid, List, Filter, Download, Eye, EyeOff } from 'lucide-react';
import KanjiStrokeViewer from './KanjiStrokeViewer';

const KanjiCard = ({ kanji, onSelect, isSelected }) => {
  const hasStrokeData = kanji.stroke_order_data && Object.keys(kanji.stroke_order_data).length > 0;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(kanji)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl font-bold text-gray-800">
            {kanji.character}
          </div>
          <div className="flex flex-col items-end space-y-1">
            {hasStrokeData && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {kanji.stroke_count} nét
              </div>
            )}
            {!hasStrokeData && (
              <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                Chưa có stroke
              </div>
            )}
            {kanji.jlpt_level && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                N{kanji.jlpt_level}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-lg text-gray-700">
            {kanji.meanings?.slice(0, 2).join(', ') || 'Không có nghĩa'}
          </div>
          
          {kanji.on_readings && kanji.on_readings.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Âm On:</span> {kanji.on_readings.slice(0, 3).join(', ')}
            </div>
          )}
          
          {kanji.kun_readings && kanji.kun_readings.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Âm Kun:</span> {kanji.kun_readings.slice(0, 3).join(', ')}
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Grade: {kanji.grade_level || 'N/A'}</span>
            <span>Freq: #{kanji.frequency_rank || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onFiltersChange, stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Bộ lọc
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* JLPT Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cấp độ JLPT
          </label>
          <select
            value={filters.jlptLevel}
            onChange={(e) => onFiltersChange({ ...filters, jlptLevel: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="5">N5</option>
            <option value="4">N4</option>
            <option value="3">N3</option>
            <option value="2">N2</option>
            <option value="1">N1</option>
          </select>
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cấp độ học
          </label>
          <select
            value={filters.gradeLevel}
            onChange={(e) => onFiltersChange({ ...filters, gradeLevel: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="1">Lớp 1</option>
            <option value="2">Lớp 2</option>
            <option value="3">Lớp 3</option>
            <option value="4">Lớp 4</option>
            <option value="5">Lớp 5</option>
            <option value="6">Lớp 6</option>
            <option value="8">Trung học</option>
          </select>
        </div>

        {/* Stroke Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số nét
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.strokeMin}
              onChange={(e) => onFiltersChange({ ...filters, strokeMin: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="30"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.strokeMax}
              onChange={(e) => onFiltersChange({ ...filters, strokeMax: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="30"
            />
          </div>
        </div>

        {/* Stroke Data Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dữ liệu stroke
          </label>
          <select
            value={filters.hasStrokeData}
            onChange={(e) => onFiltersChange({ ...filters, hasStrokeData: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="true">Có stroke data</option>
            <option value="false">Chưa có stroke data</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Tổng kanji</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{stats.withStroke}</div>
              <div className="text-sm text-green-700">Có stroke data</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">{stats.withoutStroke}</div>
              <div className="text-sm text-orange-700">Chưa có stroke</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.withStroke / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700">Hoàn thành</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KanjiExplorer = () => {
  const [kanji, setKanji] = useState([]);
  const [filteredKanji, setFilteredKanji] = useState([]);
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStrokeViewer, setShowStrokeViewer] = useState(true);
  const [downloadingStrokes, setDownloadingStrokes] = useState(false);
  
  const [filters, setFilters] = useState({
    jlptLevel: '',
    gradeLevel: '',
    strokeMin: '',
    strokeMax: '',
    hasStrokeData: ''
  });

  const itemsPerPage = 20;

  // Fetch kanji data
  const fetchKanji = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      if (filters.jlptLevel) params.append('jlpt_level', filters.jlptLevel);
      if (filters.gradeLevel) params.append('grade_level', filters.gradeLevel);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5001/api/kanji?${params}`);
      const data = await response.json();

      if (data.success) {
        setKanji(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        console.log(`Loaded ${data.data.length} kanji`);
      } else {
        setError('Không thể tải dữ liệu kanji');
      }
    } catch (err) {
      console.error('Error fetching kanji:', err);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to kanji data
  useEffect(() => {
    let filtered = [...kanji];

    // Apply stroke count filters
    if (filters.strokeMin) {
      filtered = filtered.filter(k => k.stroke_count >= parseInt(filters.strokeMin));
    }
    if (filters.strokeMax) {
      filtered = filtered.filter(k => k.stroke_count <= parseInt(filters.strokeMax));
    }

    // Apply stroke data filter
    if (filters.hasStrokeData === 'true') {
      filtered = filtered.filter(k => k.stroke_order_data && Object.keys(k.stroke_order_data).length > 0);
    } else if (filters.hasStrokeData === 'false') {
      filtered = filtered.filter(k => !k.stroke_order_data || Object.keys(k.stroke_order_data).length === 0);
    }

    setFilteredKanji(filtered);
  }, [kanji, filters]);

  // Fetch data when page or filters change
  useEffect(() => {
    fetchKanji(currentPage);
  }, [currentPage, filters.jlptLevel, filters.gradeLevel, searchTerm]);

  // Calculate stats
  const stats = {
    total: filteredKanji.length,
    withStroke: filteredKanji.filter(k => k.stroke_order_data && Object.keys(k.stroke_order_data).length > 0).length,
    withoutStroke: filteredKanji.filter(k => !k.stroke_order_data || Object.keys(k.stroke_order_data).length === 0).length
  };

  // Download stroke data for visible kanji
  const downloadStrokeData = async () => {
    setDownloadingStrokes(true);
    try {
      const kanjiWithoutStrokes = filteredKanji
        .filter(k => !k.stroke_order_data || Object.keys(k.stroke_order_data).length === 0)
        .map(k => k.character);
      
      if (kanjiWithoutStrokes.length === 0) {
        alert('Tất cả kanji hiện tại đã có stroke data!');
        return;
      }

      const response = await fetch('http://localhost:5001/api/kanji/strokes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanji: kanjiWithoutStrokes })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Đã tải stroke data cho ${result.summary.successful} kanji!`);
        // Refresh data
        fetchKanji(currentPage);
      } else {
        alert('Có lỗi khi tải stroke data');
      }
    } catch (error) {
      console.error('Error downloading stroke data:', error);
      alert('Lỗi kết nối khi tải stroke data');
    } finally {
      setDownloadingStrokes(false);
    }
  };

  // Handle kanji selection
  const handleKanjiSelect = async (kanjiItem) => {
    setSelectedKanji(kanjiItem);
    
    // If no stroke data, try to fetch it
    if (!kanjiItem.stroke_order_data || Object.keys(kanjiItem.stroke_order_data).length === 0) {
      try {
        const response = await fetch(`http://localhost:5001/api/kanji/with-strokes/${encodeURIComponent(kanjiItem.character)}`);
        const data = await response.json();
        
        if (data.success && data.data.stroke_order_data) {
          setSelectedKanji(data.data);
        }
      } catch (error) {
        console.error('Error fetching stroke data for selected kanji:', error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Book className="w-4 h-4" />
            <span>Kanji Explorer</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Khám phá Kanji
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Học cách viết kanji với hệ thống stroke order tương tác
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm kanji..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Filters */}
        <FilterPanel filters={filters} onFiltersChange={setFilters} stats={stats} />

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowStrokeViewer(!showStrokeViewer)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showStrokeViewer 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showStrokeViewer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>Stroke Viewer</span>
            </button>
          </div>

          <button
            onClick={downloadStrokeData}
            disabled={downloadingStrokes || stats.withoutStroke === 0}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingStrokes ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              Tải stroke data ({stats.withoutStroke})
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 ${showStrokeViewer && selectedKanji ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          
          {/* Kanji List */}
          <div>
            {loading ? (
              <div className="text-center py-16">
                <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <span className="text-gray-600">Đang tải kanji...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">❌</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => fetchKanji(currentPage)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                {/* Kanji Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {filteredKanji.map((kanjiItem) => (
                    <KanjiCard
                      key={kanjiItem.id}
                      kanji={kanjiItem}
                      onSelect={handleKanjiSelect}
                      isSelected={selectedKanji?.id === kanjiItem.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trước</span>
                    </button>

                    <div className="flex space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, currentPage - 2) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stroke Viewer */}
          {showStrokeViewer && selectedKanji && (
            <div className="lg:sticky lg:top-6">
              <KanjiStrokeViewer
                kanji={selectedKanji.character}
                strokeData={selectedKanji.stroke_order_data}
                className="h-fit"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanjiExplorer;