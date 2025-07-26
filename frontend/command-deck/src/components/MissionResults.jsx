import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient.js';
import './MissionResults.css';

// --- High-Quality SVG Icons ---
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
};

// --- Mock Data for Layout Verification ---
const mockMission = {
  missionId: 'mission-1753520088600',
  status: 'completed',
  missionSummary: {
    originalPrompt: 'find newly laid off tech in california making at least 65k',
    parsedPersona: 'Tech Employee',
    parsedGeography: 'California',
    parsedFinancials: 'Salary > $65,000'
  },
  executionMetrics: {
    totalLeadsFound: 450,
    companiesIdentified: 25,
    enrichmentRate: '84.4%',
    missionDuration: '7m 14s'
  },
  leads: [
    { id: 'lead-001', name: 'Jane Doe', title: 'Senior Software Engineer', company: 'TechCorp Inc.', location: 'San Francisco, CA', email: 'jane.doe@email.com', linkedinUrl: '#', status: 'Enriched' },
    { id: 'lead-002', name: 'John Smith', title: 'Product Manager', company: 'Innovate LLC', location: 'Los Angeles, CA', email: 'john.smith@email.com', linkedinUrl: '#', status: 'Enriched' },
    { id: 'lead-003', name: 'Sarah Johnson', title: 'DevOps Engineer', company: 'TechCorp Inc.', location: 'San Francisco, CA', email: 'sarah.johnson@email.com', linkedinUrl: '#', status: 'Enriched' },
    { id: 'lead-004', name: 'Mike Chen', title: 'Frontend Developer', company: 'StartupXYZ', location: 'San Diego, CA', email: 'mike.chen@email.com', linkedinUrl: '#', status: 'Enriched' },
    { id: 'lead-005', name: 'Emily Rodriguez', title: 'Data Scientist', company: 'TechCorp Inc.', location: 'San Francisco, CA', email: 'emily.rodriguez@email.com', linkedinUrl: '#', status: 'Enriched' },
  ],
  visualizations: {
    leadsByCompany: [
      { company: 'TechCorp Inc.', count: 75 },
      { company: 'Innovate LLC', count: 62 },
      { company: 'StartupXYZ', count: 45 },
      { company: 'DataFlow Systems', count: 38 },
      { company: 'CloudTech Solutions', count: 32 }
    ],
    leadsByLocation: [
      { city: 'San Francisco', count: 150 },
      { city: 'Los Angeles', count: 95 },
      { city: 'San Diego', count: 78 },
      { city: 'San Jose', count: 65 },
      { city: 'Sacramento', count: 42 }
    ]
  }
};

// --- Sortable Column Header Component ---
const SortableHeader = ({ field, currentSort, onSort, children }) => {
  const isActive = currentSort.field === field;
  const isAsc = currentSort.direction === 'asc';
  
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-left font-semibold text-secondary hover:text-primary transition-colors"
    >
      {children}
      <div className="flex flex-col">
        <svg 
          className={`w-3 h-3 ${isActive && isAsc ? 'text-brand' : 'text-tertiary'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <svg 
          className={`w-3 h-3 ${isActive && !isAsc ? 'text-brand' : 'text-tertiary'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </button>
  );
};

export default function MissionResults({ missionId, onBack }) {
  // State Management
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ company: null, location: null });
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        setLoading(true);
        if (missionId) {
          const data = await apiClient.getMissionResults(missionId);
          setMission(data);
        } else {
          // Use mock data for development
          setMission(mockMission);
        }
      } catch (err) {
        console.error('Failed to fetch mission results:', err);
        setError(err.message);
        // Fallback to mock data
        setMission(mockMission);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionData();
  }, [missionId]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Search and Filter Logic
  const filteredLeads = mission?.leads?.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompanyFilter = !activeFilters.company || lead.company === activeFilters.company;
    const matchesLocationFilter = !activeFilters.location || lead.location.includes(activeFilters.location);
    
    return matchesSearch && matchesCompanyFilter && matchesLocationFilter;
  }) || [];

  // Sorting Logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aValue = a[sortConfig.field]?.toLowerCase() || '';
    const bValue = b[sortConfig.field]?.toLowerCase() || '';
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Sorting Handler
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Lead Selection Handlers
  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === sortedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(sortedLeads.map(lead => lead.id));
    }
  };

  // Filter Handlers
  const handleFilterByCompany = (company) => {
    setActiveFilters(prev => ({
      ...prev,
      company: prev.company === company ? null : company
    }));
  };

  const handleFilterByLocation = (location) => {
    setActiveFilters(prev => ({
      ...prev,
      location: prev.location === location ? null : location
    }));
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const leadsToExport = selectedLeads.length > 0
      ? mission.leads.filter(lead => selectedLeads.includes(lead.id))
      : sortedLeads;

    const csvContent = [
      ['Name', 'Title', 'Company', 'Location', 'Email', 'LinkedIn', 'Status'],
      ...leadsToExport.map(lead => [
        lead.name,
        lead.title,
        lead.company,
        lead.location,
        lead.email,
        lead.linkedinUrl,
        lead.status
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vltrn-leads-${mission?.missionId || 'mission'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Modal Handlers
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading mission results...</p>
        </div>
      </div>
    );
  }

  if (error && !mission) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-error mb-4">Error loading results: {error}</div>
          <button onClick={onBack} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!mission) return null;

  return (
    <div className="mission-debrief-container min-h-screen bg-primary py-8 px-2 md:px-8 animate-fade-in">
      {/* Header Section */}
      <div className="header-section max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 border-primary">
          <div className="header-content">
            <h1 className="text-4xl font-bold text-primary leading-tight">Mission Debrief</h1>
            <div className="text-sm text-secondary mt-1">Mission ID: {mission.missionId} | Status: {mission.status}</div>
          </div>
          <div className="header-actions flex gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-ghost p-2"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button onClick={onBack} className="btn btn-secondary flex items-center gap-2">
              <Icons.ArrowLeft />
              Back to Missions
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={sortedLeads.length === 0}
              className="btn btn-primary flex items-center gap-2"
            >
              <Icons.Download />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Mission Prompt & Context */}
      <div className="mission-context-section max-w-6xl mx-auto mb-8">
        <div className="card p-6 animate-scale-in">
          <div className="text-lg font-semibold text-primary mb-2">"{mission.missionSummary.originalPrompt}"</div>
          <div className="flex flex-col md:flex-row gap-4 text-sm">
            <div><span className="text-tertiary">Persona:</span> {mission.missionSummary.parsedPersona}</div>
            <div><span className="text-tertiary">Geography:</span> {mission.missionSummary.parsedGeography}</div>
            <div><span className="text-tertiary">Financials:</span> {mission.missionSummary.parsedFinancials}</div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilters.company || activeFilters.location) && (
        <div className="filters-section max-w-6xl mx-auto mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-tertiary">Active filters:</span>
            {activeFilters.company && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand text-inverse">
                Company: {activeFilters.company}
                <button
                  onClick={() => handleFilterByCompany(activeFilters.company)}
                  className="ml-1 text-inverse hover:text-inverse/80"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.location && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-inverse">
                Location: {activeFilters.location}
                <button
                  onClick={() => handleFilterByLocation(activeFilters.location)}
                  className="ml-1 text-inverse hover:text-inverse/80"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stat Cards Section */}
      <div className="metrics-section max-w-6xl mx-auto mb-8">
        <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center animate-scale-in hover:animate-glow">
            <div className="text-3xl font-bold text-brand mb-2">{mission.executionMetrics.totalLeadsFound}</div>
            <div className="text-sm text-secondary">Leads Found</div>
            <div className="mt-2 text-brand">
              <Icons.Users />
            </div>
          </div>
          <div className="card p-6 text-center animate-scale-in hover:animate-glow">
            <div className="text-3xl font-bold text-success mb-2">{mission.executionMetrics.companiesIdentified}</div>
            <div className="text-sm text-secondary">Companies</div>
            <div className="mt-2 text-success">
              <Icons.Building />
            </div>
          </div>
          <div className="card p-6 text-center animate-scale-in hover:animate-glow">
            <div className="text-3xl font-bold text-warning mb-2">{mission.executionMetrics.enrichmentRate}</div>
            <div className="text-sm text-secondary">Enrichment Rate</div>
            <div className="mt-2 text-warning">
              <Icons.ChartBar />
            </div>
          </div>
          <div className="card p-6 text-center animate-scale-in hover:animate-glow">
            <div className="text-3xl font-bold text-error mb-2">{mission.executionMetrics.missionDuration}</div>
            <div className="text-sm text-secondary">Duration</div>
            <div className="mt-2 text-error">
              <Icons.Clock />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Table Section */}
      <div className="table-section max-w-6xl mx-auto mb-8">
        <div className="card p-6 animate-scale-in">
          <div className="table-header mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="table-title font-semibold text-primary text-lg">
              Leads ({sortedLeads.length} of {mission.leads.length})
            </div>
            <div className="search-container relative">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-4 py-2 w-full md:w-64" 
              />
            </div>
          </div>
          <div className="table-container overflow-x-auto">
            <table className="data-table min-w-full text-sm">
              <thead>
                <tr className="table-header-row bg-secondary">
                  <th className="table-header-cell px-3 py-2 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                  </th>
                  <th className="table-header-cell px-3 py-2">
                    <SortableHeader field="name" currentSort={sortConfig} onSort={handleSort}>
                      Name
                    </SortableHeader>
                  </th>
                  <th className="table-header-cell px-3 py-2">
                    <SortableHeader field="title" currentSort={sortConfig} onSort={handleSort}>
                      Title
                    </SortableHeader>
                  </th>
                  <th className="table-header-cell px-3 py-2">
                    <SortableHeader field="company" currentSort={sortConfig} onSort={handleSort}>
                      Company
                    </SortableHeader>
                  </th>
                  <th className="table-header-cell px-3 py-2">
                    <SortableHeader field="location" currentSort={sortConfig} onSort={handleSort}>
                      Location
                    </SortableHeader>
                  </th>
                  <th className="table-header-cell px-3 py-2 text-left font-semibold text-secondary">Contact</th>
                  <th className="table-header-cell px-3 py-2">
                    <SortableHeader field="status" currentSort={sortConfig} onSort={handleSort}>
                      Status
                    </SortableHeader>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    className="table-row even:bg-secondary hover:bg-tertiary cursor-pointer transition-colors"
                    onClick={() => handleLeadClick(lead)}
                  >
                    <td className="table-cell px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                    </td>
                    <td className="table-cell px-3 py-2 font-medium">{lead.name}</td>
                    <td className="table-cell px-3 py-2">{lead.title}</td>
                    <td className="table-cell px-3 py-2">{lead.company}</td>
                    <td className="table-cell px-3 py-2">{lead.location}</td>
                    <td className="table-cell px-3 py-2">
                      <div className="contact-links flex flex-col gap-1">
                        <a href={`mailto:${lead.email}`} className="text-brand hover:text-primary underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Icons.Mail />
                          {lead.email}
                        </a>
                        <a href={lead.linkedinUrl} className="text-brand hover:text-primary underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Icons.LinkedIn />
                          LinkedIn
                        </a>
                      </div>
                    </td>
                    <td className="table-cell px-3 py-2">
                      <span className="status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-inverse">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Intelligence Panel Section */}
      <div className="visualizations-section max-w-6xl mx-auto mb-8">
        <div className="visualizations-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leads by Company */}
          <div className="card p-6 animate-scale-in">
            <div className="visualization-header font-semibold text-primary mb-4 flex items-center gap-2">
              <Icons.Building />
              Leads by Company
            </div>
            <ul className="visualization-list space-y-3">
              {mission.visualizations.leadsByCompany.map(item => (
                <li key={item.company} className="visualization-item flex items-center gap-2">
                  <button
                    onClick={() => handleFilterByCompany(item.company)}
                    className="visualization-button flex-1 text-left hover:text-brand transition-colors"
                  >
                    <div className="progress-bar w-32 bg-brand/20 rounded-full h-3 mr-2">
                      <div className="progress-fill bg-brand h-3 rounded-full transition-all duration-300" style={{ width: `${item.count / 75 * 100}%` }}></div>
                    </div>
                    <span className="item-label text-sm text-primary">{item.company}</span>
                    <span className="item-count text-xs text-tertiary">{item.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Leads by Location */}
          <div className="card p-6 animate-scale-in">
            <div className="visualization-header font-semibold text-primary mb-4 flex items-center gap-2">
              <Icons.ChartBar />
              Leads by Location
            </div>
            <ul className="visualization-list space-y-3">
              {mission.visualizations.leadsByLocation.map(item => (
                <li key={item.city} className="visualization-item flex items-center gap-2">
                  <button
                    onClick={() => handleFilterByLocation(item.city)}
                    className="visualization-button flex-1 text-left hover:text-success transition-colors"
                  >
                    <div className="progress-bar w-32 bg-success/20 rounded-full h-3 mr-2">
                      <div className="progress-fill bg-success h-3 rounded-full transition-all duration-300" style={{ width: `${item.count / 150 * 100}%` }}></div>
                    </div>
                    <span className="item-label text-sm text-primary">{item.city}</span>
                    <span className="item-count text-xs text-tertiary">{item.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lead Dossier Modal */}
      {showModal && selectedLead && (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="modal-container card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="modal-content p-6">
              <div className="modal-header flex justify-between items-start mb-6">
                <h2 className="modal-title text-2xl font-bold text-primary">Lead Dossier</h2>
                <button 
                  onClick={handleCloseModal}
                  className="modal-close text-tertiary hover:text-primary transition-colors"
                >
                  <Icons.Close />
                </button>
              </div>
              <div className="modal-body space-y-6">
                <div className="lead-info">
                  <h3 className="lead-name text-lg font-semibold text-primary">{selectedLead.name}</h3>
                  <p className="lead-title text-secondary">{selectedLead.title}</p>
                </div>
                <div className="lead-details grid grid-cols-2 gap-4">
                  <div className="detail-item">
                    <span className="detail-label text-tertiary">Company:</span>
                    <p className="detail-value font-medium text-primary">{selectedLead.company}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label text-tertiary">Location:</span>
                    <p className="detail-value font-medium text-primary">{selectedLead.location}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label text-tertiary">Email:</span>
                    <p className="detail-value font-medium text-primary">{selectedLead.email}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label text-tertiary">Status:</span>
                    <p className="detail-value font-medium text-primary">{selectedLead.status}</p>
                  </div>
                </div>
                <div className="modal-actions flex gap-3 pt-4">
                  <a 
                    href={`mailto:${selectedLead.email}`}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Icons.Mail />
                    Send Email
                  </a>
                  <a 
                    href={selectedLead.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Icons.LinkedIn />
                    View LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 