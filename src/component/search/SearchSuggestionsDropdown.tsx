import { SearchType } from '@/src/services/search';
import { User, FileText, Tag, Folder } from 'lucide-react';
import React from 'react';

interface SearchResultData {
  username?: string;
  slug?: string;
  id?: string;
  [key: string]: unknown; 
}

interface SearchResult {
  type: SearchType;
  text: string;
  score: number;
  data: SearchResultData; 
}

interface Props {
  visible: boolean;
  loading: boolean;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  query: string;
  error?: string; 
}

const typeIcons: Record<SearchType, React.ComponentType<any>> = {
  user: User,
  post: FileText,
  tag: Tag,
  category: Folder,
};

const typeColors: Record<SearchType, string> = {
  user: 'bg-blue-100 text-blue-700',
  post: 'bg-green-100 text-green-700',
  tag: 'bg-purple-100 text-purple-700',
  category: 'bg-amber-100 text-amber-700',
};

export function SearchSuggestionsDropdown({
  visible,
  loading,
  results,
  onSelect,
  error,
  query,
}: Props) {


  if (!visible) return null;

  return (
    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
      {error && (
        <div className="p-4 text-center text-sm text-red-500">
          Error: {error}
        </div>
      )}
      
      {!error && loading && (
        <div className="p-4 text-center text-sm text-gray-500">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-2"></div>
          Searching...
        </div>
      )}

      {!loading && !error && results.length === 0 && query.length > 0 && (
        <div className="p-4 text-sm text-gray-500 text-center">
          No results found for &quot;<span className="font-medium">{query}</span>&quot;
        </div>
      )}

      {!loading && !error && results.length === 0 && query.length === 0 && (
        <div className="p-4 text-sm text-gray-500 text-center">
          Start typing to search...
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="py-2">
          {results.map((item, index) => {

            
            const itemType = item.type || 'post';
            const Icon = typeIcons[itemType] || FileText;
            const colorClass = typeColors[itemType] || typeColors.post;
            
            const uniqueKey = `${itemType}-${item.text || 'item'}-${index}-${item.score}`;
            
            const score = item.score || 0;

            return (
              <button
                key={uniqueKey}
                onClick={() => onSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 group transition-colors"
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.text || 'Untitled'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass} font-semibold uppercase`}>
                      {itemType}
                    </span>

                    {item.data.username && (
                      <span className="text-xs text-gray-500">
                        @{item.data.username}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 font-medium">
                  {score.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}