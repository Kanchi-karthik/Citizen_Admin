import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

const FeedbackRatioChart = ({ totalFeedbacks, data }) => {
  console.log('FeedbackRatioChart - totalFeedbacks:', totalFeedbacks, 'data:', data);
  
  // Show loading or no data state
  if (!data) {
    return (
      <Card title="Feedback Statistics">
        <div className="flex flex-col items-center justify-center h-80">
          <p className="text-gray-500 text-center">Loading feedback data...</p>
        </div>
      </Card>
    );
  }

  // If no feedbacks at all
  if (totalFeedbacks === 0) {
    return (
      <Card title="Feedback Statistics">
        <div className="flex flex-col items-center justify-center h-80">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
            <p className="text-sm font-medium text-blue-600 mb-2">Total Feedbacks</p>
            <p className="text-3xl font-bold text-blue-900">0</p>
            <p className="text-gray-500 text-sm mt-4">No feedback data available yet.</p>
          </div>
        </div>
      </Card>
    );
  }

  // If feedbacks exist but no breakdown (show total count)
  if (data.length === 0 && totalFeedbacks > 0) {
    return (
      <Card title="Feedback Statistics">
        <div className="flex flex-col h-full items-center justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200 text-center w-full">
            <p className="text-sm font-medium text-blue-600 mb-2">Total Feedbacks</p>
            <p className="text-4xl font-bold text-blue-900 mb-4">{totalFeedbacks}</p>
            <p className="text-gray-600 text-sm">Feedback breakdown data is being processed...</p>
          </div>
        </div>
      </Card>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  // Format data for pie chart
  const chartData = data.filter(item => item.count > 0).map((item, index) => ({
    name: item.category || `Category ${index + 1}`,
    value: item.count || 0,
    percentage: totalFeedbacks > 0 ? ((item.count / totalFeedbacks) * 100).toFixed(1) : 0
  }));

  // If no data after filtering, show total with message
  if (chartData.length === 0) {
    return (
      <Card title="Feedback Statistics">
        <div className="flex flex-col h-full items-center justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200 text-center w-full">
            <p className="text-sm font-medium text-blue-600 mb-2">Total Feedbacks</p>
            <p className="text-4xl font-bold text-blue-900 mb-4">{totalFeedbacks}</p>
            <p className="text-gray-600 text-sm">Category breakdown not available</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderCustomLabel = (entry) => {
    return `${entry.percentage}%`;
  };

  return (
    <Card title="Feedback Statistics">
      <div className="flex flex-col h-full">
        {/* Total Feedbacks Box */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-4 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Feedbacks</p>
          <p className="text-3xl font-bold text-blue-900">{totalFeedbacks}</p>
        </div>

        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} feedbacks`, 'Count']}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Detailed Breakdown */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">Feedback Breakdown</p>
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">{item.value}</span>
                <span className="text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FeedbackRatioChart;
