import { useState } from 'react';

export default function WebSearchResults({ results }) {
  const [isSourcesVisible, setIsSourcesVisible] = useState(false);
  
  if (!results || !results.results || !results.results.length) {
    return null;
  }
  
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col">
        <div className="text-gray-700">
          <p>I found information from {results.results.length} web sources that may help answer your query.</p>
        </div>
        
        <button 
          onClick={() => setIsSourcesVisible(!isSourcesVisible)}
          className="mt-2 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
        >
          {isSourcesVisible ? 'Hide sources' : 'Show sources'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform duration-200 ${isSourcesVisible ? 'transform rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isSourcesVisible && (
          <div className="mt-3 space-y-2">
            {results.results.map((result, index) => (
              <a 
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-600 truncate hover:underline">
                    {result.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {result.publishedDate ? new Date(result.publishedDate).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}