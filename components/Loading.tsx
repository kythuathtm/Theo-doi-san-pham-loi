import React from 'react';

const Loading: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full p-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-slate-500 font-medium">Đang tải...</span>
  </div>
);

export default Loading;