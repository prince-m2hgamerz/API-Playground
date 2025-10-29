import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase, Collection } from '../lib/supabase';

type SaveRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, collectionId: string | null) => void;
};

export default function SaveRequestModal({ isOpen, onClose, onSave }: SaveRequestModalProps) {
  const [name, setName] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCollections(data);
      if (data.length > 0 && !selectedCollectionId) {
        setSelectedCollectionId(data[0].id);
      }
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const { data, error } = await supabase
      .from('collections')
      .insert([{ name: newCollectionName, description: '' }])
      .select()
      .single();

    if (data && !error) {
      setCollections(prev => [data, ...prev]);
      setSelectedCollectionId(data.id);
      setNewCollectionName('');
      setIsCreatingCollection(false);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, selectedCollectionId);
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Save Request</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My API Request"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection
            </label>

            {!isCreatingCollection ? (
              <>
                <select
                  value={selectedCollectionId || ''}
                  onChange={e => setSelectedCollectionId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                >
                  <option value="">No Collection</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCreatingCollection(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Create new collection
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCreateCollection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingCollection(false);
                    setNewCollectionName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
