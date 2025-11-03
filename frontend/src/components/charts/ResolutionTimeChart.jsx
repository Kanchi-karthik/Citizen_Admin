import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

const ResolutionTimeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <Card title="Average Resolution Time">
      <div className="flex flex-col items-center justify-center h-80">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
          <p className="text-sm font-medium text-blue-600 mb-2">Resolution Time</p>
          <p className="text-3xl font-bold text-blue-900">N/A</p>
          <p className="text-gray-500 text-sm mt-4">No resolved complaints yet.</p>
        </div>
      </div>
    </Card>;
  }

  // Calculate average from all data points
  const avgResolution = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.avgDays, 0) / data.length).toFixed(1)
    : 0;

  const minResolution = data.length > 0
    ? Math.min(...data.map(item => item.avgDays)).toFixed(1)
    : 0;

  const maxResolution = data.length > 0
    ? Math.max(...data.map(item => item.avgDays)).toFixed(1)
    : 0;

  return (
    <Card title="Average Resolution Time (Days)">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-600 mb-1">Average</p>
            <p className="text-2xl font-bold text-blue-900">{avgResolution}</p>
            <p className="text-xs text-blue-600 mt-1">days</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-600 mb-1">Fastest</p>
            <p className="text-2xl font-bold text-green-900">{minResolution}</p>
            <p className="text-xs text-green-600 mt-1">days</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
            <p className="text-xs font-medium text-orange-600 mb-1">Slowest</p>
            <p className="text-2xl font-bold text-orange-900">{maxResolution}</p>
            <p className="text-xs text-orange-600 mt-1">days</p>
          </div>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              stroke="#9ca3af"
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)} days`, 'Resolution Time']}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgDays" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 8 }}
              name="Avg Resolution Time"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ResolutionTimeChart;
