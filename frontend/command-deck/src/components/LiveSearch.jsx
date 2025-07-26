import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient.js';
import './LiveSearch.css';

const LiveSearch = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState(['linkedin', 'google', 'warn']);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    jobTitle: '',
    companySize: ''
  });

  const sourceOptions = [
    { id: 'linkedin', label: 'LinkedIn', icon: '👥' },
    { id: 'google', label: 'Google', icon: '🔍' },
    { id: 'warn', label: 'WARN Notices', icon: '⚠️' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      console.log(`[LiveSearch] Searching for: "${query}" with sources: ${sources.join(', ')}`);
      
      const results = await apiClient.liveSearch(query, sources, filters);
      
      // Add to search history
      setSearchHistory(prev => [
        { query, timestamp: new Date().toISOString(), results },
        ...prev.slice(0, 9) // Keep last 10 searches
      ]);

      // Pass results to parent component
      if (onSearchResults) {
        onSearchResults(results);
      }

      console.log('[LiveSearch] Search completed:', results);
    } catch (error) {
      console.error('[LiveSearch] Search failed:', error);
      // You could add error handling UI here
    } finally {
      setIsSearching(false);
    }
  };

  const handleSourceToggle = (sourceId) => {
    setSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="live-search-container">
      {/* Search Header */}
      <div className="search-header">
        <h2 className="search-title">🔍 Live Multi-Source Search</h2>
        <p className="search-subtitle">Search across LinkedIn, Google, and WARN notices in real-time</p>
      </div>

      {/* Search Input */}
      <div className="search-input-section">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query (e.g., 'software engineers in California')"
            className="search-input"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="search-button"
          >
            {isSearching ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>
      </div>

      {/* Source Selection */}
      <div className="sources-section">
        <h3 className="sources-title">Data Sources</h3>
        <div className="sources-grid">
          {sourceOptions.map(source => (
            <label key={source.id} className="source-option">
              <input
                type="checkbox"
                checked={sources.includes(source.id)}
                onChange={() => handleSourceToggle(source.id)}
                className="source-checkbox"
              />
              <span className="source-icon">{source.icon}</span>
              <span className="source-label">{source.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="filters-section">
        <h3 className="filters-title">Advanced Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              placeholder="e.g., Technology"
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Job Title</label>
            <input
              type="text"
              value={filters.jobTitle}
              onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
              placeholder="e.g., Software Engineer"
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Company Size</label>
            <select
              value={filters.companySize}
              onChange={(e) => handleFilterChange('companySize', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">Recent Searches</h3>
          <div className="history-list">
            {searchHistory.map((search, index) => (
              <div key={index} className="history-item">
                <span className="history-query">{search.query}</span>
                <span className="history-timestamp">
                  {new Date(search.timestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => {
                    setQuery(search.query);
                    handleSearch();
                  }}
                  className="history-repeat-button"
                >
                  🔄 Repeat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Status */}
      {isSearching && (
        <div className="search-status">
          <div className="loading-spinner"></div>
          <p>Searching across {sources.length} data sources...</p>
        </div>
      )}
    </div>
  );
};

export default LiveSearch; 