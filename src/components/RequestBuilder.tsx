import { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { HttpMethod, BodyType, AuthType, KeyValuePair, RequestConfig } from '../types';

type RequestBuilderProps = {
  config: RequestConfig;
  onChange: (config: RequestConfig) => void;
  onSend: () => void;
  isSending: boolean;
};

export default function RequestBuilder({ config, onChange, onSend, isSending }: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

  const addKeyValuePair = (type: 'headers' | 'queryParams') => {
    const newPair: KeyValuePair = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true,
    };
    onChange({
      ...config,
      [type]: [...config[type], newPair],
    });
  };

  const updateKeyValuePair = (
    type: 'headers' | 'queryParams',
    id: string,
    field: keyof KeyValuePair,
    value: string | boolean
  ) => {
    onChange({
      ...config,
      [type]: config[type].map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      ),
    });
  };

  const removeKeyValuePair = (type: 'headers' | 'queryParams', id: string) => {
    onChange({
      ...config,
      [type]: config[type].filter(pair => pair.id !== id),
    });
  };

  const renderKeyValueEditor = (type: 'headers' | 'queryParams', pairs: KeyValuePair[]) => (
    <div className="space-y-2">
      {pairs.map(pair => (
        <div key={pair.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={e => updateKeyValuePair(type, pair.id, 'enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <input
            type="text"
            placeholder="Key"
            value={pair.key}
            onChange={e => updateKeyValuePair(type, pair.id, 'key', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Value"
            value={pair.value}
            onChange={e => updateKeyValuePair(type, pair.id, 'value', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => removeKeyValuePair(type, pair.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      <button
        onClick={() => addKeyValuePair(type)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Plus size={16} />
        Add {type === 'headers' ? 'Header' : 'Parameter'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 mb-4">
          <select
            value={config.method}
            onChange={e => onChange({ ...config, method: e.target.value as HttpMethod })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            {httpMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Enter request URL"
            value={config.url}
            onChange={e => onChange({ ...config, url: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={onSend}
            disabled={isSending || !config.url}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Send size={18} />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {(['params', 'headers', 'body', 'auth'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'params' && renderKeyValueEditor('queryParams', config.queryParams)}

        {activeTab === 'headers' && renderKeyValueEditor('headers', config.headers)}

        {activeTab === 'body' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['none', 'json', 'xml', 'form', 'raw'] as BodyType[]).map(type => (
                <button
                  key={type}
                  onClick={() => onChange({ ...config, body: { ...config.body, type } })}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    config.body.type === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            {config.body.type !== 'none' && (
              <textarea
                value={config.body.content}
                onChange={e => onChange({ ...config, body: { ...config.body, content: e.target.value } })}
                placeholder={`Enter ${config.body.type.toUpperCase()} content`}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            )}
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-4">
            <select
              value={config.auth.type}
              onChange={e => onChange({ ...config, auth: { type: e.target.value as AuthType } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">No Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey">API Key</option>
              <option value="basic">Basic Auth</option>
            </select>

            {config.auth.type === 'bearer' && (
              <input
                type="text"
                placeholder="Token"
                value={config.auth.token || ''}
                onChange={e => onChange({ ...config, auth: { ...config.auth, token: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {config.auth.type === 'apikey' && (
              <>
                <input
                  type="text"
                  placeholder="Key"
                  value={config.auth.key || ''}
                  onChange={e => onChange({ ...config, auth: { ...config.auth, key: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={config.auth.value || ''}
                  onChange={e => onChange({ ...config, auth: { ...config.auth, value: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}

            {config.auth.type === 'basic' && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={config.auth.username || ''}
                  onChange={e => onChange({ ...config, auth: { ...config.auth, username: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={config.auth.password || ''}
                  onChange={e => onChange({ ...config, auth: { ...config.auth, password: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
