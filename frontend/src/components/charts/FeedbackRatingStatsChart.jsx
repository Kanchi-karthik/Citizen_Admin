import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

const FeedbackRatingStatsChart = ({ data, totalFeedbacks }) => {
  console.log('FeedbackRatingStatsChart - data:', data, 'totalFeedbacks:', totalFeedbacks);
  
  // Show loading or no data state
  if (!data || data.length === 0) {
    return (
      <Card title="Feedback Rating Statistics">
        <div className="flex flex-col items-center justify-center h-80">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
            <p className="text-sm font-medium text-blue-600 mb-2">Rating Statistics</p>
            <p className="text-3xl font-bold text-blue-900">0</p>
            <p className="text-gray-500 text-sm mt-4">No feedback data available yet.</p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate rating statistics
  const ratingCounts = {
    1: data.filter(f => f.rating === 1).length,
    2: data.filter(f => f.rating === 2).length,
    3: data.filter(f => f.rating === 3).length,
    4: data.filter(f => f.rating === 4).length,
    5: data.filter(f => f.rating === 5).length,
  };

  // Chart data for line chart
  const chartData = [
    {
      name: '1 Star',
      count: ratingCounts[1],
      percentage: totalFeedbacks > 0 ? ((ratingCounts[1] / totalFeedbacks) * 100).toFixed(1) : 0,
      emoji: '😢',
    },
    {
      name: '2 Stars',
      count: ratingCounts[2],
      percentage: totalFeedbacks > 0 ? ((ratingCounts[2] / totalFeedbacks) * 100).toFixed(1) : 0,
      emoji: '😕',
    },
    {
      name: '3 Stars',
      count: ratingCounts[3],
      percentage: totalFeedbacks > 0 ? ((ratingCounts[3] / totalFeedbacks) * 100).toFixed(1) : 0,
      emoji: '😐',
    },
    {
      name: '4 Stars',
      count: ratingCounts[4],
      percentage: totalFeedbacks > 0 ? ((ratingCounts[4] / totalFeedbacks) * 100).toFixed(1) : 0,
      emoji: '😊',
    },
    {
      name: '5 Stars',
      count: ratingCounts[5],
      percentage: totalFeedbacks > 0 ? ((ratingCounts[5] / totalFeedbacks) * 100).toFixed(1) : 0,
      emoji: '😄',
    },
  ];

  const COLORS = ['#ff7c7c', '#ffc658', '#ffeb3b', '#82ca9d', '#8884d8'];

  // Calculate average rating
  const totalRating = data.reduce((sum, f) => sum + (f.rating || 0), 0);
  const averageRating = totalFeedbacks > 0 ? (totalRating / totalFeedbacks).toFixed(2) : 0;

  // Calculate satisfaction percentage (4-5 stars)
  const satisfiedCount = ratingCounts[4] + ratingCounts[5];
  const satisfactionPercentage = totalFeedbacks > 0 ? ((satisfiedCount / totalFeedbacks) * 100).toFixed(1) : 0;

  return (
    <Card title="Feedback Rating Statistics">
      <div className="flex flex-col h-full">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-600 mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-blue-900">{averageRating}</p>
            <p className="text-xs text-blue-600 mt-1">out of 5.0</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-600 mb-1">Satisfied (4-5 ★)</p>
            <p className="text-3xl font-bold text-green-900">{satisfactionPercentage}%</p>
            <p className="text-xs text-green-600 mt-1">{satisfiedCount} feedbacks</p>
          </div>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              stroke="#9ca3af"
            />
            <Tooltip 
              formatter={(value) => `${value} feedbacks`}
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 6 }}
              activeDot={{ r: 8 }}
              name="Number of Feedbacks"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Detailed Rating Breakdown */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-3">Rating Breakdown</p>
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 ml-2 min-w-[50px] text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FeedbackRatingStatsChart;
