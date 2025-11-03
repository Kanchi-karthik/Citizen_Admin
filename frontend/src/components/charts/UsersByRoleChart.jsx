import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Card from '../common/Card.jsx';

const UsersByRoleChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Card title="Users by Role">
      <p className="text-gray-500 text-center">No data available for user roles.</p>
    </Card>;
  }

  const COLORS_MAP = {
    'user': '#10b981',
    'admin': '#f59e0b',
    'manager': '#3b82f6',
    'director': '#8b5cf6',
    'support': '#06b6d4',
  };

  // Transform data with color info
  const chartData = data.map(item => ({
    ...item,
    color: COLORS_MAP[item.role] || '#6b7280',
    displayRole: item.role.charAt(0).toUpperCase() + item.role.slice(1)
  }));

  return (
    <Card title="Users by Role">
      <div className="space-y-6">
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="displayRole" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip 
              formatter={(value) => `${value} users`}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="count" name="Number of Users" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Role Legend with Colors */}
        <div className="grid grid-cols-2 gap-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{item.displayRole}</span>
              <span className="text-sm font-semibold text-gray-900 ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default UsersByRoleChart;
