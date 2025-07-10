import React, { useState, useEffect } from 'react'; // Ensure useState and useEffect are imported
import WarnTable from '../components/WarnTable';
import MissionControl from '../components/MissionControl';

const DashboardPage = () => {
  // State for the new SalesNav results
  const [salesNavResults, setSalesNavResults] = useState([]);

  // Fetch data from the new endpoint when the component mounts
  useEffect(() => {
    fetch('http://localhost:8080/api/results/sales-navigator')
      .then(res => res.json())
      .then(data => {
        setSalesNavResults(data);
      })
      .catch(err => console.error("Failed to fetch SalesNav results:", err));
  }, []); // The empty dependency array means this runs once on mount

  return (
    <div>
      <h1>Dashboard</h1>
      <p>You're now logged in!</p>

      <MissionControl />
      
      <WarnTable />

      {/* --- NEWLY ADDED RESULTS TABLE --- */}
      <h2>Sales Navigator Results</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Scraped At</th>
          </tr>
        </thead>
        <tbody>
          {salesNavResults.length > 0 ? (
            salesNavResults.map(result => (
              <tr key={result.id}>
                <td>{result.id}</td>
                <td>{result.title}</td>
                <td>{new Date(result.scraped_at).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No results found in the Dataroom.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardPage;