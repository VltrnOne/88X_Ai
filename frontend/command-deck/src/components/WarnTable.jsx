import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './WarnTable.css'; // We will create this file next for basic styling

const WarnTable = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWarnNotices = async () => {
      try {
        const response = await apiClient.get('/api/warn-notices');
        setNotices(response.data);
      } catch (err) {
        setError('Failed to fetch WARN notices. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarnNotices();
  }, []);

  if (isLoading) {
    return <p>Loading WARN notices...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="warn-table-container">
      <h2>WARN Act Notices</h2>
      <table>
        <thead>
          <tr>
            <th>Notice Date</th>
            <th>Company</th>
            <th>City</th>
            <th>Employees Affected</th>
          </tr>
        </thead>
        <tbody>
          {notices.length > 0 ? (
            notices.map((notice) => (
              <tr key={notice.id}>
                <td>{new Date(notice.notice_date).toLocaleDateString()}</td>
                <td>{notice.company_name}</td>
                <td>{notice.city}</td>
                <td>{notice.employees_affected}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No WARN notices found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarnTable;
