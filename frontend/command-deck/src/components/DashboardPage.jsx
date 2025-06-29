import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'notice_date', direction: 'descending' });
  
  // --- NEW: State for the search filter ---
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileResponse, leadsResponse] = await Promise.all([
        apiClient.get('/api/profile'),
        apiClient.get('/api/leads')
      ]);
      
      setProfileData(profileResponse.data);
      setLeads(leadsResponse.data.leads);
      setError('');
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError('Failed to load data. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MODIFIED: This logic now filters the data BEFORE sorting it ---
  const filteredAndSortedLeads = useMemo(() => {
    let filteredLeads = [...leads];
    
    // Apply search filter first
    if (filter) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.company_name.toLowerCase().includes(filter.toLowerCase()) ||
        lead.city.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Then sort the filtered results
    if (sortConfig.key !== null) {
      filteredLeads.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredLeads;
  }, [leads, sortConfig, filter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRunJob = async (agentName) => {
    setJobStatus(`Launching ${agentName}...`);
    try {
      const response = await apiClient.post(`/api/run-job/${agentName}`);
      setJobStatus(response.data.message);
      
      setTimeout(() => {
        setJobStatus('Refreshing leads data...');
        fetchData();
      }, 7000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Failed to launch ${agentName}.`;
      setJobStatus(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="dashboard-container"><p>Loading Mission Data...</p></div>;
  if (error) return <div className="dashboard-container"><p style={{ color: '#c93c3c' }}>{error}</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">VLTRN Mission Control</h1>
        {profileData && <p>Authenticated as: <strong>{profileData.user.email}</strong></p>}
        <button onClick={handleLogout} className="logout-button">Log Out</button>
      </div>

      <hr className="divider" />

      <div className="mission-control-section">
        <h2>Mission Control</h2>
        <div className="mission-buttons">
          <button className="mission-button" onClick={() => handleRunJob('scout-warn')}>Launch WARN Scout</button>
        </div>
        {jobStatus && <p className="job-status-message">{jobStatus}</p>}
      </div>

      <hr className="divider" />
      
      <div className="leads-section">
        <div className="leads-header">
          <h2>Acquired WARN Leads</h2>
          {/* --- NEW: Search Input Field --- */}
          <input 
            type="text"
            placeholder="Filter by company or city..."
            className="filter-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {filteredAndSortedLeads.length > 0 ? (
          <table className="leads-table">
            <thead>
              <tr>
                <th><button type="button" onClick={() => requestSort('company_name')} className="sort-button">Company Name</button></th>
                <th><button type="button" onClick={() => requestSort('city')} className="sort-button">City</button></th>
                <th><button type="button" onClick={() => requestSort('notice_date')} className="sort-button">Notice Date</button></th>
                <th><button type="button" onClick={() => requestSort('employees_affected')} className="sort-button">Employees Affected</button></th>
              </tr>
            </thead>
            <tbody>
              {/* --- UPDATED: Maps over filteredAndSortedLeads --- */}
              {filteredAndSortedLeads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.company_name}</td>
                  <td>{lead.city}</td>
                  <td>{new Date(lead.notice_date).toLocaleDateString()}</td>
                  <td>{lead.employees_affected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leads match the current filter or none found in the Dataroom.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
