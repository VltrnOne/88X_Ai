import React, { useState } from 'react';
import { apiClient } from '../api/apiClient.js';
import MissionResults from './MissionResults.jsx';
import LiveSearch from './LiveSearch.jsx';
import './VLTRNCanvas.css';

// API client is now imported from apiClient.js

// --- Agent Icon Mapping ---
const agentIcons = {
  'google-search': '🔍',
  'scout-selenium-py': '🤖',
  'lead-scorer': '🎯',
  'campaign-crafter': '✍️',
  'scout-warn': '📋',
  'marketer-agent': '📧',
  'marketer-enrich': '📊',
  'default': '⚙️'
};

// --- Plan Step Component (Coda-inspired) ---
const PlanStep = ({ step, index, isEditable, onEdit }) => {
  const icon = agentIcons[step.agent] || agentIcons.default;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(step.description);

  const handleSave = () => {
    onEdit(index, { ...step, description: editValue });
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      {/* Connection Line */}
      {index > 0 && (
        <div className="absolute left-6 top-0 w-0.5 h-8 bg-gray-200" />
      )}
      
      <div className="flex items-start gap-4 mb-6">
        {/* Step Number & Icon */}
        <div className="relative">
          <div className="bg-white border-2 border-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-lg font-semibold text-gray-600 shadow-sm">
            {index + 1}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-sm border border-gray-200">
            {icon}
          </div>
        </div>

        {/* Content Card */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{step.agent}</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              )}
            </div>
            
            {isEditable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main VLTRN Canvas Component ---
export default function VLTRNCanvas() {
  const [prompt, setPrompt] = useState('');
  const [missionBrief, setMissionBrief] = useState(null);
  const [executionPlan, setExecutionPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // 'input', 'brief', 'plan', 'results', 'search'
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const handleGenerateBrief = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const brief = await apiClient.parseIntent(prompt);
      setMissionBrief(brief);
      setCurrentStep('brief');
    } catch (error) {
      console.error("Failed to generate mission brief:", error);
      // Optionally set an error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!missionBrief) return;
    setIsLoading(true);
    try {
      const plan = await apiClient.generatePlan(missionBrief);
      setExecutionPlan(plan);
      setCurrentStep('plan');
    } catch (error) {
      console.error("Failed to generate plan:", error);
      // Optionally set an error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!executionPlan) return;
    
    // The original code had a status state, but the new code uses currentStep.
    // Assuming the intent is to show results when the plan is generated.
    setCurrentStep('results');
    setShowResults(true);
  };

  const handleEditStep = (index, updatedStep) => {
    setExecutionPlan(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? updatedStep : step)
    }));
  };

  const handleReset = () => {
    setExecutionPlan(null);
    setMissionBrief(null);
    setCurrentStep('input');
    setShowResults(false);
    setSearchResults(null);
  };

  const handleBackFromResults = () => {
    setShowResults(false);
    setMissionId(null); // This state was removed from the new_code, so it's removed here.
  };

  const getStatusColor = () => {
    // This function is no longer directly used in the new_code's renderContent,
    // but keeping it for now as it might be used elsewhere or for context.
    switch (currentStep) {
      case 'input': return 'text-blue-600';
      case 'brief': return 'text-green-600';
      case 'plan': return 'text-yellow-600';
      case 'results': return 'text-green-600';
      case 'search': return 'text-blue-600'; // For search results
      default: return 'text-gray-600';
    }
  };

  const handleSearchResults = (results) => {
    console.log('[VLTRNCanvas] Received search results:', results);
    setSearchResults(results);
    setCurrentStep('search');
  };

  const handleBackToInput = () => {
    setCurrentStep('input');
    setMissionBrief(null);
    setExecutionPlan(null);
    setShowResults(false);
    setSearchResults(null);
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'search':
        return (
          <div className="search-results-container">
            <div className="search-results-header">
              <button onClick={handleBackToInput} className="back-button">
                ← Back to Mission Control
              </button>
              <h2>🔍 Live Search Results</h2>
            </div>
            
            {searchResults && (
              <div className="search-results-content">
                <div className="results-summary">
                  <h3>Search Summary</h3>
                  <p><strong>Query:</strong> {searchResults.query}</p>
                  <p><strong>Sources:</strong> {searchResults.sources.join(', ')}</p>
                  <p><strong>Timestamp:</strong> {new Date(searchResults.timestamp).toLocaleString()}</p>
                </div>

                <div className="results-breakdown">
                  {searchResults.results.linkedin && (
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

                  {searchResults.results.google && (
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

                  {searchResults.results.warn && (
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
                </div>
              </div>
            )}
          </div>
        );

      case 'results':
        return <MissionResults missionId={executionPlan?.planId} />;

      default:
        return (
          <div className="vltrn-canvas">
            <div className="canvas-header">
              <h1>🚀 VLTRN Mission Control</h1>
              <p>AI-Powered Lead Generation & Intelligence Platform</p>
            </div>

            <div className="canvas-content">
              <div className="mission-section">
                <h2>🎯 Mission Brief</h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your mission: Who are you targeting? What are you offering? Where are they located?"
                  className="mission-input"
                  disabled={isLoading}
                />
                <button
                  onClick={handleGenerateBrief}
                  disabled={isLoading || !prompt.trim()}
                  className="generate-button"
                >
                  {isLoading ? '🔄 Generating...' : '🎯 Generate Mission Brief'}
                </button>
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="search-section">
                <h2>🔍 Live Multi-Source Search</h2>
                <p>Search across LinkedIn, Google, and WARN notices in real-time</p>
                <button
                  onClick={() => setCurrentStep('search')}
                  className="search-button"
                >
                  🔍 Start Live Search
                </button>
              </div>
            </div>

            {missionBrief && (
              <div className="brief-section">
                <h2>📋 Mission Brief Generated</h2>
                <div className="brief-content">
                  <p><strong>Target Persona:</strong> {missionBrief.targetPersona?.description}</p>
                  <p><strong>Offering:</strong> {missionBrief.offering?.product}</p>
                  <p><strong>Geographic Scope:</strong> {missionBrief.geographicScope?.location}</p>
                </div>
                <button
                  onClick={handleGeneratePlan}
                  disabled={isLoading}
                  className="generate-button"
                >
                  {isLoading ? '🔄 Generating...' : '📋 Generate Execution Plan'}
                </button>
              </div>
            )}

            {executionPlan && (
              <div className="plan-section">
                <h2>📋 Execution Plan Generated</h2>
                <div className="plan-content">
                  <p><strong>Plan ID:</strong> {executionPlan.planId}</p>
                  <p><strong>Summary:</strong> {executionPlan.summary}</p>
                  <p><strong>Steps:</strong> {executionPlan.steps?.length || 0} steps</p>
                </div>
                <button
                  onClick={handleExecutePlan}
                  disabled={isLoading}
                  className="execute-button"
                >
                  {isLoading ? '🔄 Executing...' : '🚀 Execute Mission'}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="vltrn-container">
      {currentStep === 'search' ? (
        <LiveSearch onSearchResults={handleSearchResults} />
      ) : (
        renderContent()
      )}
    </div>
  );
} 