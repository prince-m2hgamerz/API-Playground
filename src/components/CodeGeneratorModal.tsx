import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { RequestConfig } from '../types';

type CodeGeneratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  config: RequestConfig;
};

type CodeLanguage = 'curl' | 'javascript' | 'python' | 'node';

export default function CodeGeneratorModal({ isOpen, onClose, config }: CodeGeneratorModalProps) {
  const [language, setLanguage] = useState<CodeLanguage>('curl');
  const [copied, setCopied] = useState(false);

  const buildQueryString = () => {
    const params = config.queryParams.filter(p => p.enabled && p.key);
    if (params.length === 0) return '';
    return '?' + params.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  };

  const buildHeaders = () => {
    const headers: Record<string, string> = {};
    config.headers.filter(h => h.enabled && h.key).forEach(h => {
      headers[h.key] = h.value;
    });

    if (config.auth.type === 'bearer' && config.auth.token) {
      headers['Authorization'] = `Bearer ${config.auth.token}`;
    } else if (config.auth.type === 'apikey' && config.auth.key && config.auth.value) {
      headers[config.auth.key] = config.auth.value;
    }

    if (config.body.type === 'json' && config.body.content) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  const generateCurl = () => {
    const url = config.url + buildQueryString();
    const headers = buildHeaders();
    let cmd = `curl -X ${config.method} '${url}'`;

    Object.entries(headers).forEach(([key, value]) => {
      cmd += ` \\\n  -H '${key}: ${value}'`;
    });

    if (config.body.content && config.body.type !== 'none') {
      cmd += ` \\\n  -d '${config.body.content.replace(/'/g, "'\\''")}'`;
    }

    return cmd;
  };

  const generateJavaScript = () => {
    const url = config.url + buildQueryString();
    const headers = buildHeaders();

    let code = `fetch('${url}', {\n`;
    code += `  method: '${config.method}',\n`;

    if (Object.keys(headers).length > 0) {
      code += `  headers: ${JSON.stringify(headers, null, 4)},\n`;
    }

    if (config.body.content && config.body.type !== 'none') {
      code += `  body: ${config.body.type === 'json' ? config.body.content : `'${config.body.content}'`}\n`;
    }

    code += `})\n`;
    code += `  .then(response => response.json())\n`;
    code += `  .then(data => console.log(data))\n`;
    code += `  .catch(error => console.error('Error:', error));`;

    return code;
  };

  const generatePython = () => {
    const url = config.url + buildQueryString();
    const headers = buildHeaders();

    let code = `import requests\n\n`;
    code += `url = '${url}'\n`;

    if (Object.keys(headers).length > 0) {
      code += `headers = ${JSON.stringify(headers, null, 4).replace(/"/g, "'")}\n`;
    }

    if (config.body.content && config.body.type !== 'none') {
      if (config.body.type === 'json') {
        code += `data = ${config.body.content}\n`;
      } else {
        code += `data = '${config.body.content}'\n`;
      }
    }

    code += `\nresponse = requests.${config.method.toLowerCase()}(url`;

    if (Object.keys(headers).length > 0) {
      code += `, headers=headers`;
    }

    if (config.body.content && config.body.type !== 'none') {
      code += config.body.type === 'json' ? `, json=data` : `, data=data`;
    }

    code += `)\n`;
    code += `print(response.json())`;

    return code;
  };

  const generateNode = () => {
    const url = config.url + buildQueryString();
    const headers = buildHeaders();

    let code = `const axios = require('axios');\n\n`;

    code += `axios({\n`;
    code += `  method: '${config.method.toLowerCase()}',\n`;
    code += `  url: '${url}',\n`;

    if (Object.keys(headers).length > 0) {
      code += `  headers: ${JSON.stringify(headers, null, 4)},\n`;
    }

    if (config.body.content && config.body.type !== 'none') {
      code += `  data: ${config.body.type === 'json' ? config.body.content : `'${config.body.content}'`}\n`;
    }

    code += `})\n`;
    code += `  .then(response => console.log(response.data))\n`;
    code += `  .catch(error => console.error('Error:', error));`;

    return code;
  };

  const generateCode = () => {
    switch (language) {
      case 'curl':
        return generateCurl();
      case 'javascript':
        return generateJavaScript();
      case 'python':
        return generatePython();
      case 'node':
        return generateNode();
      default:
        return '';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Generate Code</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            {(['curl', 'javascript', 'python', 'node'] as CodeLanguage[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript (Fetch)' : lang === 'node' ? 'Node.js (Axios)' : 'Python (Requests)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors z-10"
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-gray-200">
              {generateCode()}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
