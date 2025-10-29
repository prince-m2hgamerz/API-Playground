import { useState, useEffect } from 'react';
import {
  FolderOpen,
  History,
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { supabase, Collection, SavedRequest } from '../lib/supabase';

type SidebarProps = {
  onSelectRequest: (request: SavedRequest) => void;
  onSelectHistory: (historyId: string) => void;
  onNewRequest: () => void;
};

export default function Sidebar({
  onSelectRequest,
  onSelectHistory,
  onNewRequest,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>(
    'collections'
  );
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set()
  );
  const [requestsByCollection, setRequestsByCollection] = useState<
    Record<string, SavedRequest[]>
  >({});

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const { data: collectionsData } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (collectionsData) {
      setCollections(collectionsData);
      loadRequestsForCollections(collectionsData.map((c) => c.id));
    }
  };

  const loadRequestsForCollections = async (collectionIds: string[]) => {
    const { data: requestsData } = await supabase
      .from('saved_requests')
      .select('*')
      .in('collection_id', collectionIds)
      .order('created_at', { ascending: false });

    if (requestsData) {
      const grouped = requestsData.reduce((acc, req) => {
        const collId = req.collection_id || 'uncategorized';
        if (!acc[collId]) acc[collId] = [];
        acc[collId].push(req);
        return acc;
      }, {} as Record<string, SavedRequest[]>);
      setRequestsByCollection(grouped);
    }
  };

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-green-600',
      POST: 'text-blue-600',
      PUT: 'text-orange-600',
      PATCH: 'text-yellow-600',
      DELETE: 'text-red-600',
      OPTIONS: 'text-gray-600',
      HEAD: 'text-gray-600',
    };
    return colors[method] || 'text-gray-600';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            M2H API Playground
          </h1>
        </div>
        <button
          onClick={onNewRequest}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'collections'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FolderOpen size={16} />
            Collections
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <History size={16} />
            History
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'collections' ? (
          <div className="p-2">
            {collections.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No collections yet. Create your first request!
              </div>
            ) : (
              collections.map((collection) => (
                <div key={collection.id} className="mb-2">
                  <button
                    onClick={() => toggleCollection(collection.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    {expandedCollections.has(collection.id) ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                    <FolderOpen size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-800 flex-1">
                      {collection.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {requestsByCollection[collection.id]?.length || 0}
                    </span>
                  </button>
                  {expandedCollections.has(collection.id) &&
                    requestsByCollection[collection.id] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {requestsByCollection[collection.id].map((request) => (
                          <button
                            key={request.id}
                            onClick={() => onSelectRequest(request)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left transition-colors"
                          >
                            <span
                              className={`text-xs font-bold ${getMethodColor(
                                request.method
                              )} w-12`}
                            >
                              {request.method}
                            </span>
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {request.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Request history will appear here
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
}
