import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

const ComplaintStatusChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Card title="Complaints by Status">
      <p className="text-gray-500 text-center">No data available for complaint statuses.</p>
    </Card>;
  }

  const COLORS_MAP = {
    'Pending': '#FFBB28',
    'In Progress': '#00C49F',
    'Resolved': '#82ca9d',
    'Closed': '#8884d8',
  };

  return (
    <Card title="Complaints by Status">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8">
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={COLORS_MAP[entry.status] || '#cccccc'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComplaintStatusChart;
