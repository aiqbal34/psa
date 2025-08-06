import React from 'react';
import { PollOption } from '@/lib/api';
import { calculatePercentage } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PollResultsProps {
  options: PollOption[];
  totalVotes: number;
  colors: string[];
  showChart?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({ 
  options, 
  totalVotes, 
  colors,
  showChart = false 
}) => {
  const maxVotes = Math.max(...options.map(opt => opt.votes || 0));
  
  // Prepare data for chart
  const chartData = options.map((option, index) => ({
    name: option.text.length > 20 ? `${option.text.slice(0, 20)}...` : option.text,
    votes: option.votes || 0,
    percentage: calculatePercentage(option.votes || 0, totalVotes),
    color: colors[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-primary-600">
            {data.votes} votes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalVotes === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <BarChart className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500">No votes yet</p>
        <p className="text-sm text-gray-400">Be the first to vote!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Results */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const votes = option.votes || 0;
          const percentage = calculatePercentage(votes, totalVotes);
          const isWinning = votes === maxVotes && votes > 0;
          
          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {option.text}
                </span>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">
                    {votes} vote{votes !== 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold text-gray-900 min-w-[3rem] text-right">
                    {percentage}%
                  </span>
                  {isWinning && votes > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      Leading
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index],
                    minWidth: percentage > 0 ? '1%' : '0%',
                  }}
                >
                  {percentage >= 15 && (
                    <span className="text-xs font-medium text-white">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart View (Optional) */}
      {showChart && options.length <= 6 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Chart View</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
        <span>Total responses: {totalVotes}</span>
        {maxVotes > 0 && (
          <span>
            Highest: {maxVotes} vote{maxVotes !== 1 ? 's' : ''} 
            ({calculatePercentage(maxVotes, totalVotes)}%)
          </span>
        )}
      </div>
    </div>
  );
};

export default PollResults;