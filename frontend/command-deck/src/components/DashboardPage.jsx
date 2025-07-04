import React from 'react';
import WarnTable from './WarnTable'; // Import our new component

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>🎉 You're now logged in!</p>

      <WarnTable />
    </div>
  );
};

export default DashboardPage;