import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Download, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';

interface PostActionsDropdownProps {
  postId: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility?: () => void;
  onDownload?: () => void;
  onCopyLink: (postId: string, slug?: string, title?: string) => void;
  currentStatus?: 'published' | 'draft';
  slug?: string;     
  title?: string;    
}

export default function PostActionsDropdown({
  postId,
  isOwner,
  onEdit,
  onDelete,
  onToggleVisibility,
  onDownload,
  onCopyLink,        
  currentStatus = 'published',
  slug,            
  title             
}: PostActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 
  if (!isOwner) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Post options"
      >
        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 py-1">
          
          <button
            onClick={() => {
              onCopyLink(postId, slug, title);
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LinkIcon className="w-4 h-4 mr-3" />
            Copy Link
          </button>

          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Edit className="w-4 h-4 mr-3" />
            Edit Post
          </button>

          {onToggleVisibility && (
            <button
              onClick={() => {
                onToggleVisibility();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {currentStatus === 'published' ? (
                <>
                  <EyeOff className="w-4 h-4 mr-3" />
                  Move to Draft
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-3" />
                  Publish Now
                </>
              )}
            </button>
          )}

          {onDownload && (
            <button
              onClick={() => {
                onDownload();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-3" />
              Download Post
            </button>
          )}

          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}