import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCopy, FiCheck, FiKey, FiUpload, FiCode, FiServer, FiDatabase, FiPlus, FiTrash2, FiLoader, FiEye, FiEyeOff, FiAward, FiUserPlus } from 'react-icons/fi';
import { FaWhatsapp, FaGithub, FaTelegram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const API = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');
  const [isDeveloper, setIsDeveloper] = useState(true);
  const [checkingDeveloper, setCheckingDeveloper] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const baseUrl = 'https://appapi.megan.qzz.io';

  useEffect(() => {
    if (user) {
      loadApiKeys();
    } else {
      setCheckingDeveloper(false);
    }
  }, [user]);

  const checkDeveloperStatus = async () => {
    try {
      const result = await api.getMe();
      if (result.success) {
        setIsDeveloper(result.data.user?.userType === 'developer');
        if (true) {
          loadApiKeys();
        }
      }
    } catch (error) {
      console.error('Failed to check developer status:', error);
    } finally {
      setCheckingDeveloper(false);
    }
  };

  const upgradeToDeveloper = async () => {
    setUpgrading(true);
    try {
      const result = await api.upgradeDeveloper({});
      if (result.success) {
        setIsDeveloper(true);
        loadApiKeys();
      } else {
        alert('Failed to upgrade. Please try again.');
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      alert('Failed to upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const loadApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const result = await api.getApiKeys();
      if (result.success) {
        setApiKeys(result.data.keys || []);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const generateApiKey = async () => {
    setGenerating(true);
    try {
      const result = await api.createApiKey('Default Key');
      if (result.success) {
        setNewKey(result.data.key);
        await loadApiKeys();
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setGenerating(false);
    }
  };

  const revokeApiKey = async (keyId) => {
    try {
      await api.deleteApiKey(keyId);
      await loadApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const languageExamples = {
    curl: {
      publish: `curl -X POST ${baseUrl}/api/publish \\
  -H "X-API-Key: megan_live_xxx" \\
  -F 'metadata={"name":"My App","type":"website","developer":"John","description":"Awesome app","category":"tools","website":"https://example.com"}' \\
  -F 'icon=@icon.png'`,
      getApps: `curl ${baseUrl}/api/apps`,
      getApp: `curl ${baseUrl}/api/app/megan-movie-api-r8wlkev1e`
    },
    js: {
      publish: `const formData = new FormData();
formData.append('metadata', JSON.stringify({
  name: 'My App',
  type: 'website',
  developer: 'John',
  description: 'Awesome app',
  category: 'tools',
  website: 'https://example.com'
}));
formData.append('icon', iconFile);

const response = await fetch('${baseUrl}/api/publish', {
  method: 'POST',
  headers: { 'X-API-Key': 'megan_live_xxx' },
  body: formData
});
const data = await response.json();`,
      getApps: `const response = await fetch('${baseUrl}/api/apps');
const data = await response.json();
console.log(data.data.apps);`,
      getApp: `const response = await fetch('${baseUrl}/api/app/megan-movie-api-r8wlkev1e');
const data = await response.json();
console.log(data.data.app);`
    },
    python: {
      publish: `import requests, json

metadata = {
    "name": "My App",
    "type": "website",
    "developer": "John",
    "description": "Awesome app",
    "category": "tools",
    "website": "https://example.com"
}

files = {
    'metadata': (None, json.dumps(metadata), 'application/json'),
    'icon': ('icon.png', open('icon.png', 'rb'), 'image/png')
}

headers = {'X-API-Key': 'megan_live_xxx'}
response = requests.post('${baseUrl}/api/publish', files=files, headers=headers)
print(response.json())`,
      getApps: `import requests
response = requests.get('${baseUrl}/api/apps')
print(response.json()['data']['apps'])`,
      getApp: `import requests
response = requests.get('${baseUrl}/api/app/megan-movie-api-r8wlkev1e')
print(response.json()['data']['app'])`
    },
    php: {
      publish: `<?php
$metadata = json_encode([
    'name' => 'My App',
    'type' => 'website',
    'developer' => 'John',
    'description' => 'Awesome app',
    'category' => 'tools',
    'website' => 'https://example.com'
]);

$postfields = [
    'metadata' => $metadata,
    'icon' => new CURLFile('icon.png')
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '${baseUrl}/api/publish');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: megan_live_xxx']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
print_r(json_decode($response, true));`,
      getApps: `<?php
$response = file_get_contents('${baseUrl}/api/apps');
$data = json_decode($response, true);
print_r($data['data']['apps']);`,
      getApp: `<?php
$response = file_get_contents('${baseUrl}/api/app/megan-movie-api-r8wlkev1e');
$data = json_decode($response, true);
print_r($data['data']['app']);`
    }
  };

  return (
    <div className="api-docs">
      <div className="docs-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>

        <div className="docs-header">
          <h1>Megan Apps API</h1>
          <p className="subtitle">Powerful REST API for publishing and managing apps programmatically</p>
          <div className="header-badges">
            <span className="badge">v1.0</span>
            <span className="badge">REST</span>
            <span className="badge">JSON</span>
          </div>
        </div>

        <div className="section">
          <h2><FiServer /> Base URL</h2>
          <div className="code-block">
            <code>https://appapi.megan.qzz.io</code>
            <button onClick={() => copyToClipboard('https://appapi.megan.qzz.io', 'base')}>
              {copied === 'base' ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
          <p>All API requests should be made to this base URL. HTTPS is required.</p>
        </div>

        {/* API Keys Section */}
        <div className="section highlight">
          <h2><FiKey /> Your API Keys</h2>
          {!user ? (
            <div className="signin-prompt">
              <p>Sign in to view and manage your API keys.</p>
              <Link to="/login" className="signin-btn">Sign In</Link>
            </div>
          ) : checkingDeveloper ? (
            <div className="loading-state">
              <FiLoader className="spinning" /> Checking account...
            </div>
          ) : !isDeveloper ? (
            <div className="upgrade-prompt">
              <div className="upgrade-icon">
                <FiAward />
              </div>
              <h3>Become a Developer</h3>
              <p>Upgrade to a developer account to generate API keys and publish apps programmatically.</p>
              <button 
                className="upgrade-btn"
                onClick={upgradeToDeveloper}
                disabled={upgrading}
              >
                {upgrading ? <FiLoader className="spinning" /> : <FiUserPlus />}
                {upgrading ? 'Upgrading...' : 'Upgrade to Developer'}
              </button>
              <p className="upgrade-note">Free forever. No credit card required.</p>
            </div>
          ) : (
            <>
              <div className="api-keys-header">
                <p>Use these keys to authenticate your API requests.</p>
                <button 
                  className="generate-btn"
                  onClick={generateApiKey}
                  disabled={generating}
                >
                  {generating ? <FiLoader className="spinning" /> : <FiPlus />}
                  Generate New Key
                </button>
              </div>

              {newKey && (
                <div className="new-key-box">
                  <div className="new-key-header">
                    <span>Your new API Key (copy it now - it won't be shown again!)</span>
                    <button onClick={() => setShowKey(!showKey)}>
                      {showKey ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <code>{showKey ? newKey : '•'.repeat(40)}</code>
                  <button onClick={() => copyToClipboard(newKey, 'newkey')}>
                    {copied === 'newkey' ? <FiCheck /> : <FiCopy />} Copy
                  </button>
                </div>
              )}

              <div className="api-keys-list">
                {loadingKeys ? (
                  <div className="loading-keys">
                    <FiLoader className="spinning" /> Loading keys...
                  </div>
                ) : apiKeys.length === 0 ? (
                  <p className="no-keys">No API keys yet. Generate one to get started.</p>
                ) : (
                  apiKeys.map(key => (
                    <div key={key.id} className="api-key-item">
                      <div className="key-info">
                        <code>{key.key}</code>
                        <span className="key-date">Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        className="revoke-btn"
                        onClick={() => revokeApiKey(key.id)}
                      >
                        <FiTrash2 /> Revoke
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="section">
          <h2><FiCode /> Code Examples</h2>
          <div className="tabs">
            <button className={activeTab === 'curl' ? 'active' : ''} onClick={() => setActiveTab('curl')}>cURL</button>
            <button className={activeTab === 'js' ? 'active' : ''} onClick={() => setActiveTab('js')}>JavaScript</button>
            <button className={activeTab === 'python' ? 'active' : ''} onClick={() => setActiveTab('python')}>Python</button>
            <button className={activeTab === 'php' ? 'active' : ''} onClick={() => setActiveTab('php')}>PHP</button>
          </div>

          <div className="example-section">
            <h3>Publish an App (Website)</h3>
            <div className="code-block">
              <code>{languageExamples[activeTab].publish}</code>
              <button onClick={() => copyToClipboard(languageExamples[activeTab].publish, `publish-${activeTab}`)}>
                {copied === `publish-${activeTab}` ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <h3>List All Apps</h3>
            <div className="code-block">
              <code>{languageExamples[activeTab].getApps}</code>
              <button onClick={() => copyToClipboard(languageExamples[activeTab].getApps, `getApps-${activeTab}`)}>
                {copied === `getApps-${activeTab}` ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <h3>Get Single App</h3>
            <div className="code-block">
              <code>{languageExamples[activeTab].getApp}</code>
              <button onClick={() => copyToClipboard(languageExamples[activeTab].getApp, `getApp-${activeTab}`)}>
                {copied === `getApp-${activeTab}` ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
          </div>
        </div>

        <div className="section">
          <h2><FiDatabase /> Public APIs</h2>
          <p className="section-desc">No authentication required. Anyone can access these endpoints.</p>
          <div className="endpoint-grid">
            <EndpointCard method="GET" path="/api/apps" desc="List all published apps" />
            <EndpointCard method="GET" path="/api/apps?category=entertainment" desc="Filter apps by category" />
            <EndpointCard method="GET" path="/api/apps?type=apk" desc="Filter by type (apk, website, wap, bot)" />
            <EndpointCard method="GET" path="/api/app/:slug" desc="Get single app details" />
            <EndpointCard method="GET" path="/api/search?q=query" desc="Search apps by name, developer, or tags" />
            <EndpointCard method="GET" path="/api/download/:meganId" desc="Download app file (redirects to CDN)" />
          </div>
        </div>

        <div className="section">
          <h2><FiCode /> Developer APIs</h2>
          <p className="section-desc">Requires authentication (Firebase token).</p>
          <div className="endpoint-grid">
            <EndpointCard method="GET" path="/api/developer/apps" desc="List all your apps" auth="Bearer Token" />
            <EndpointCard method="GET" path="/api/developer/stats" desc="Get developer statistics" auth="Bearer Token" />
            <EndpointCard method="PUT" path="/api/developer/apps/:meganId" desc="Update app metadata" auth="Bearer Token" />
            <EndpointCard method="DELETE" path="/api/developer/apps/:meganId" desc="Delete your app" auth="Bearer Token" />
          </div>
        </div>

        <div className="section">
          <h2>Rate Limits</h2>
          <div className="rate-limit-grid">
            <div className="rate-card"><h3>Public APIs</h3><p className="limit">100 req/hour</p><p>Per IP address</p></div>
            <div className="rate-card"><h3>API Key</h3><p className="limit">100 req/day</p><p>Per API key</p></div>
            <div className="rate-card"><h3>Authenticated</h3><p className="limit">500 req/hour</p><p>Per user</p></div>
          </div>
        </div>

        <div className="section">
          <h2>Support</h2>
          <div className="support-grid">
            <a href="https://wa.me/254758476795" target="_blank" rel="noopener noreferrer" className="support-card whatsapp">
              <FaWhatsapp /> WhatsApp<br />
              <span>+254 758 476 795</span>
              <small>Quick support</small>
            </a>
            <a href="https://github.com/TrackerWanga" target="_blank" rel="noopener noreferrer" className="support-card github">
              <FaGithub /> GitHub<br />
              <span>TrackerWanga</span>
              <small>Open source</small>
            </a>
            <a href="https://t.me/megan-ceo" target="_blank" rel="noopener noreferrer" className="support-card telegram">
              <FaTelegram /> Telegram<br />
              <span>@megan_ceo</span>
              <small>Direct message</small>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .api-docs { min-height: 100vh; background: #0a0a0f; padding: 40px 20px; }
        .docs-container { max-width: 1000px; margin: 0 auto; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); text-decoration: none; margin-bottom: 30px; }
        .back-link:hover { color: white; }
        h1 { font-size: 48px; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { font-size: 18px; color: rgba(255,255,255,0.6); margin-bottom: 16px; }
        .header-badges { display: flex; gap: 10px; }
        .badge { padding: 6px 14px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 30px; color: #a78bfa; font-size: 13px; font-weight: 500; }
        .section { margin-bottom: 48px; }
        .section.highlight { background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.15); border-radius: 20px; padding: 28px; }
        h2 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: white; display: flex; align-items: center; gap: 10px; }
        .section-desc { color: rgba(255,255,255,0.6); margin-bottom: 24px; }
        .code-block { background: #0d0d14; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; display: flex; align-items: flex-start; justify-content: space-between; margin: 12px 0; }
        .code-block code { font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; color: #a78bfa; white-space: pre-wrap; word-break: break-all; }
        .code-block button { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 4px 8px; border-radius: 6px; }
        .code-block button:hover { background: rgba(255,255,255,0.1); color: white; }

        .signin-prompt { text-align: center; padding: 30px; }
        .signin-prompt p { color: rgba(255,255,255,0.6); margin-bottom: 20px; }
        .signin-btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 30px; color: white; text-decoration: none; font-weight: 600; }

        .upgrade-prompt { text-align: center; padding: 40px 20px; background: rgba(99,102,241,0.05); border-radius: 20px; }
        .upgrade-icon { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white; }
        .upgrade-prompt h3 { font-size: 22px; margin-bottom: 12px; color: white; }
        .upgrade-prompt p { color: rgba(255,255,255,0.7); margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .upgrade-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 30px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; margin-bottom: 12px; }
        .upgrade-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .upgrade-note { font-size: 13px; color: rgba(255,255,255,0.4); }

        .loading-state { text-align: center; padding: 40px; color: rgba(255,255,255,0.5); }
        .loading-state svg { margin-right: 8px; }

        .api-keys-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .api-keys-header p { color: rgba(255,255,255,0.7); }
        .generate-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 30px; color: white; font-weight: 500; cursor: pointer; }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .new-key-box { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .new-key-header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981; font-weight: 500; }
        .new-key-box code { display: block; padding: 14px; background: #0d0d14; border-radius: 10px; font-family: monospace; font-size: 16px; margin-bottom: 14px; }
        .new-key-box button { padding: 8px 16px; background: #10b981; border: none; border-radius: 8px; color: white; cursor: pointer; }
        .api-keys-list { display: flex; flex-direction: column; gap: 12px; }
        .api-key-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; }
        .key-info code { font-family: monospace; color: #a78bfa; }
        .key-date { display: block; font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .revoke-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #ef4444; cursor: pointer; }
        .loading-keys, .no-keys { text-align: center; padding: 20px; color: rgba(255,255,255,0.5); }

        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tabs button { padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; color: rgba(255,255,255,0.6); cursor: pointer; }
        .tabs button.active { background: #6366f1; border-color: #6366f1; color: white; }
        .example-section h3 { font-size: 16px; margin: 20px 0 10px; color: rgba(255,255,255,0.8); }

        .support-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .support-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; text-align: center; text-decoration: none; color: white; transition: all 0.3s; }
        .support-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.06); }
        .support-card svg { font-size: 32px; margin-bottom: 12px; }
        .support-card span { font-size: 18px; font-weight: 600; display: block; margin: 8px 0 4px; }
        .support-card small { font-size: 12px; color: rgba(255,255,255,0.5); }
        .support-card.whatsapp svg { color: #25D366; }
        .support-card.github svg { color: white; }
        .support-card.telegram svg { color: #26A5E4; }

        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .endpoint-grid { display: grid; gap: 16px; }
        .rate-limit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .rate-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; text-align: center; }
        .rate-card .limit { font-size: 28px; font-weight: 700; color: #a78bfa; margin-bottom: 6px; }

        @media (max-width: 768px) {
          h1 { font-size: 36px; }
          .support-grid, .rate-limit-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const EndpointCard = ({ method, path, desc, auth }) => {
  const colors = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#06b6d4' };
  return (
    <div className="endpoint-card">
      <div className="endpoint-header">
        <span className="method" style={{ background: colors[method] }}>{method}</span>
        <code className="path">{path}</code>
        {auth && <span className="auth-badge">{auth}</span>}
      </div>
      <p className="endpoint-desc">{desc}</p>
      <style jsx>{`
        .endpoint-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 18px; }
        .endpoint-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
        .method { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; }
        .path { font-family: monospace; font-size: 14px; color: #a78bfa; }
        .auth-badge { padding: 3px 10px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; font-size: 11px; color: #f59e0b; margin-left: auto; }
        .endpoint-desc { color: rgba(255,255,255,0.7); font-size: 14px; }
      `}</style>
    </div>
  );
};

export default API;
