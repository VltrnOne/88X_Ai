import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient.js';
import './LiveSearch.css';

const LiveSearch = ({ onSearchResults, onBack }) => {
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState(['linkedin', 'google', 'warn']);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
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
    setSearchResults(null);
    
    try {
      console.log(`[LiveSearch] Searching for: "${query}" with sources: ${sources.join(', ')}`);
      
      const results = await apiClient.liveSearch(query, sources, filters);
      
      // Add to search history
      setSearchHistory(prev => [
        { query, timestamp: new Date().toISOString(), results },
        ...prev.slice(0, 9) // Keep last 10 searches
      ]);

      // Set results for display
      setSearchResults(results);

      // Also pass results to parent component if callback provided
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

  const handleRepeatSearch = (searchQuery) => {
    setQuery(searchQuery);
    handleSearch();
  };

  // If we have search results, show them
  if (searchResults) {
    return (
      <div className="live-search-container">
        {/* Search Results Header */}
        <div className="search-results-header">
          <button onClick={() => setSearchResults(null)} className="back-button">
            ← Back to Search
          </button>
          <h2>🔍 Live Search Results</h2>
        </div>
        
        <div className="search-results-content">
          <div className="results-summary">
            <h3>Search Summary</h3>
            <p><strong>Query:</strong> {searchResults.query}</p>
            <p><strong>Sources:</strong> {searchResults.sources.join(', ')}</p>
            <p><strong>Timestamp:</strong> {new Date(searchResults.timestamp).toLocaleString()}</p>
          </div>

          <div className="results-breakdown">
            {searchResults.results.linkedin && searchResults.results.linkedin.length > 0 && (
              <div className="source-results">
                <h3>👥 LinkedIn Results ({searchResults.results.linkedin.length})</h3>
                <div className="results-grid">
                  {searchResults.results.linkedin.map((contact, index) => (
                    <div key={index} className="result-card">
                      <h4>{contact.name}</h4>
                      <p><strong>Title:</strong> {contact.title}</p>
                      <p><strong>Company:</strong> {contact.company}</p>
                      <p><strong>Location:</strong> {contact.location}</p>
                      <p><strong>Email:</strong> {contact.email}</p>
                      <p><strong>Match Score:</strong> {(contact.match_score * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.results.google && searchResults.results.google.length > 0 && (
              <div className="source-results">
                <h3>🔍 Google Results ({searchResults.results.google.length})</h3>
                <div className="results-grid">
                  {searchResults.results.google.map((result, index) => (
                    <div key={index} className="result-card">
                      <h4>{result.title}</h4>
                      <p><strong>Company:</strong> {result.company}</p>
                      <p><strong>Location:</strong> {result.location}</p>
                      <p><strong>Snippet:</strong> {result.snippet}</p>
                      <p><strong>Match Score:</strong> {(result.match_score * 100).toFixed(1)}%</p>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                        View Source →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.results.warn && searchResults.results.warn.length > 0 && (
              <div className="source-results">
                <h3>⚠️ WARN Notices ({searchResults.results.warn.length})</h3>
                <div className="results-grid">
                  {searchResults.results.warn.map((notice, index) => (
                    <div key={index} className="result-card">
                      <h4>{notice.company_name}</h4>
                      <p><strong>Date:</strong> {notice.received_date}</p>
                      <p><strong>Employees Affected:</strong> {notice.employee_count}</p>
                      <p><strong>Location:</strong> {notice.location}</p>
                      <p><strong>Industry:</strong> {notice.industry}</p>
                      <p><strong>Match Score:</strong> {(notice.match_score * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {(!searchResults.results.linkedin || searchResults.results.linkedin.length === 0) &&
             (!searchResults.results.google || searchResults.results.google.length === 0) &&
             (!searchResults.results.warn || searchResults.results.warn.length === 0) && (
              <div className="no-results">
                <h3>🔍 No Results Found</h3>
                <p>Try adjusting your search query or filters to find more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main search interface
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
                  onClick={() => handleRepeatSearch(search.query)}
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