import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Search,
    PenSquare,
    LogOut,
    Bell,
    Settings,
    ExternalLink,
    ChevronDown,
    PlusCircle,
    X,
    User,
    FileText,
    Tag,
    Folder
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { getMyBlog } from '@/src/services/blogs';
import { useDashboardSearch } from '@/src/component/search/DashboardSearchShadow';
import { SearchSuggestionsDropdown } from '@/src/component/search/SearchSuggestionsDropdown';
import { NotificationBell } from './NotificationBell';
import { NotificationProvider } from '@/src/contexts/NotificationContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
    const { userName, logout, token } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use the search hook
    const { data: searchData, isLoading: isSearchLoading } = useSearchSuggestions(
        searchQuery,
        5
    );

    // Fetch blog info
    const { data: blog } = useQuery({
        queryKey: ['my-blog-status'],
        queryFn: () => getMyBlog(token as string),
        enabled: !!token, 
    });

    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleWriteClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (blog) {
            router.push('/dashboard/create-post');
        } else {
            router.push('/dashboard/create-blog');
        }
    };

    // Search result handler
    const handleSelectResult = (result: any) => {
        switch (result.type) {
            case 'user':
                // The backend now sends the correct blog slug in 'data.slug'
                const targetPath = result.data.slug || result.data.username;

                if (targetPath) {
                    // This will now correctly hit /blogs/funny-guy
                    router.push(`/blogs/${targetPath}`);
                }
                break;

            case 'post':
                router.push(`/posts/${result.data.slug || result.data.id}`);
                break;

            default:
                break;
        }
        
        setSearchQuery('');
        setIsSearchFocused(false);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!token) return null;
  
    const errorMessage = searchError 
  ? (typeof searchError === 'string' 
      ? searchError 
      : (searchError as any).message || "Search failed")
  : undefined;

    return (
        
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50">
                <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    {/* Left: Wordoo Branding */}
                    <div className="flex items-center gap-8 flex-1">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-[22px] md:text-[26px] font-black tracking-tight text-gray-900 flex items-center group">
                                WORD
                                <span className="relative flex items-center text-indigo-600 ml-0.5">
                                    o
                                    <span className="-ml-1.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                                        o
                                    </span>
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                     bg-indigo-500 rounded-full 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 ease-out">
                                    </span>
                                </span>
                            </span>
                        </Link>

                        {/* UPDATED SEARCH BAR WITH FUNCTIONALITY */}
                        <div className="relative max-w-md w-full hidden md:block">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Wordoo..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-100 rounded-full bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <X size={16} className="text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {/* SEARCH SUGGESTIONS DROPDOWN */}
                            <SearchSuggestionsDropdown
                                visible={searchActive}
                                loading={searchLoading}
                                results={results}
                                error={errorMessage}
                                onSelect={handleSelectResult}
                                query={query}
                            />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            onClick={handleWriteClick}
                        >
                            <PenSquare size={20} />
                            <span className="hidden sm:inline">Write</span>
                        </Button>

                          {/* ✅ REPLACE with NotificationBell component */}
                          <NotificationBell />

                        {/* <button className="text-gray-500 hover:text-gray-900 p-2 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button> */}

                                <div className="relative ml-2" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-50 shadow-sm">
                                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-sm font-semibold text-gray-900 truncate uppercase tracking-tight">
                                            {userName || 'Account'}
                                        </p>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Wordoo Member</p>
                                    </div>

                                    <div className="py-2">
                                        {blog ? (
                                            <Link
                                                href={`/${blog.slug}`}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <ExternalLink size={18} className="text-gray-400" />
                                                View Blog
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/dashboard/create-blog"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <PlusCircle size={18} className="text-gray-400" />
                                                Create Blog
                                            </Link>
                                        )}

                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <Settings size={18} className="text-gray-400" />
                                            Settings
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-50 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                        >
                                            <LogOut size={18} />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full">
                {children}
            </main>
        </div>

    );
};