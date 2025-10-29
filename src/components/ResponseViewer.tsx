import { useState } from 'react';
import { Clock, FileText, Code, Copy, Check } from 'lucide-react';
import { ApiResponse } from '../types';

type ResponseViewerProps = {
  response: ApiResponse | null;
};

export default function ResponseViewer({ response }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
        <Code size={64} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">No response yet</p>
        <p className="text-sm">Send a request to see the response here</p>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatJson = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isJson = () => {
    try {
      JSON.parse(response.body);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className={`px-3 py-1 rounded-lg font-semibold ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{response.time}ms</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{formatBytes(response.size)}</span>
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'body'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'headers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Headers ({Object.keys(response.headers).length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'body' && (
          <div className="relative h-full">
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors z-10"
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
            <pre className="p-4 text-sm font-mono overflow-auto h-full">
              {isJson() ? formatJson(response.body) : response.body}
            </pre>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4">
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex gap-4 py-2 border-b border-gray-100">
                  <div className="font-medium text-gray-700 w-1/3">{key}:</div>
                  <div className="text-gray-600 flex-1 break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
