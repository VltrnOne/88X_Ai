import React, { useState } from 'react';
import { apiClient } from '../api/apiClient.js';
import MissionResults from './MissionResults.jsx';

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
  const [executionPlan, setExecutionPlan] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, planning, plan-ready, executing, complete, error
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [missionId, setMissionId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    setStatus('planning');
    setStatusMessage('Analyzing your request...');

    try {
      // Step 1: Parse Intent
      const missionBrief = await apiClient.parseIntent(prompt);
      setStatusMessage('Generating execution strategy...');
      
      // Step 2: Generate Plan
      const plan = await apiClient.generatePlan(missionBrief);
      setExecutionPlan(plan);
      setStatus('plan-ready');
      setStatusMessage('Strategy ready for review.');

    } catch (error) {
      console.error("Failed to generate plan:", error);
      setStatus('error');
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!executionPlan) return;
    
    setStatus('executing');
    setStatusMessage('Launching mission...');
    
    try {
      const result = await apiClient.executePlan(executionPlan);
      setStatus('complete');
      setStatusMessage(`Mission launched successfully. ID: ${result.missionId || 'N/A'}`);
      setMissionId(result.missionId);
      
      // Immediately show results for mock system
      setTimeout(() => {
        setShowResults(true);
      }, 1000); // Brief delay for UX
      
    } catch (error) {
      console.error("Failed to execute plan:", error);
      setStatus('error');
      setStatusMessage(`Execution failed: ${error.message}`);
    }
  };

  const handleEditStep = (index, updatedStep) => {
    setExecutionPlan(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? updatedStep : step)
    }));
  };

  const handleReset = () => {
    setExecutionPlan(null);
    setStatus('idle');
    setStatusMessage('');
    setPrompt('');
    setShowResults(false);
    setMissionId(null);
  };

  const handleBackFromResults = () => {
    setShowResults(false);
    setMissionId(null);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'planning': return 'text-blue-600';
      case 'plan-ready': return 'text-green-600';
      case 'executing': return 'text-yellow-600';
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-4">VLTRN</h1>
          <p className="text-xl text-gray-600">Your Autonomous Acquisition Engine</p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Phase */}
          {!executionPlan && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">What would you like to accomplish?</h2>
                <p className="text-gray-600">Describe your mission in natural language</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Find me recently laid off software engineers in California with 401k funds who might be interested in our product..."
                  className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  rows={4}
                  disabled={isSubmitting}
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting || !prompt.trim()}
                  className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Strategy...
                    </div>
                  ) : (
                    'Generate Strategy'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Plan Review Phase */}
          {executionPlan && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Generated Strategy</h2>
                <p className="text-gray-600 mb-4">"{executionPlan.originalBrief?.rawPrompt || prompt}"</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Ready for execution
                </div>
              </div>

              {/* Plan Steps */}
              <div className="space-y-2 mb-8">
                {executionPlan.steps?.map((step, index) => (
                  <PlanStep
                    key={`${step.agent}-${index}`}
                    step={step}
                    index={index}
                    isEditable={status === 'plan-ready'}
                    onEdit={handleEditStep}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExecutePlan}
                  disabled={status === 'executing'}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {status === 'executing' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Launching...
                    </div>
                  ) : (
                    'Launch Mission'
                  )}
                </button>
              </div>

              {/* View Results Button (appears after completion) */}
              {status === 'complete' && missionId && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowResults(true)}
                    className="py-3 px-8 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                  >
                    View Mission Results
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Phase */}
          {showResults && missionId && (
            <MissionResults missionId={missionId} onBack={handleBackFromResults} />
          )}
        </div>

        {/* Status Footer */}
        {statusMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className={`px-4 py-2 rounded-full shadow-lg bg-white border border-gray-200 ${getStatusColor()}`}>
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 