// AuthTest.jsx - Test page to verify Firebase authentication

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getIdToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export default function AuthTest() {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testGetIdToken = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      
      // Decode the token payload to show user info
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      setTokenInfo({
        token: token.substring(0, 50) + '...', // Show first 50 chars
        payload: {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name,
          email_verified: payload.email_verified,
          iat: new Date(payload.iat * 1000).toLocaleString(),
          exp: new Date(payload.exp * 1000).toLocaleString()
        }
      });
    } catch (error) {
      console.error('Error getting ID token:', error);
      setTokenInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBackendAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/test-auth`, {
        headers: {
          'Authorization': `Bearer ${await getIdToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setBackendResponse({
        status: response.status,
        data: data
      });
    } catch (error) {
      console.error('Error testing backend auth:', error);
      setBackendResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to test Firebase authentication.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Current User:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
              }, null, 2)}
            </pre>
          </div>
          
          <div className="space-x-2">
            <Button onClick={testGetIdToken} disabled={loading}>
              Get ID Token
            </Button>
            <Button onClick={testBackendAuth} disabled={loading}>
              Test Backend Auth
            </Button>
          </div>
        </CardContent>
      </Card>

      {tokenInfo && (
        <Card>
          <CardHeader>
            <CardTitle>ID Token Info</CardTitle>
          </CardHeader>
          <CardContent>
            {tokenInfo.error ? (
              <p className="text-red-600">Error: {tokenInfo.error}</p>
            ) : (
              <div className="space-y-2">
                <div>
                  <strong>Token:</strong> {tokenInfo.token}
                </div>
                <div>
                  <strong>Payload:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                    {JSON.stringify(tokenInfo.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {backendResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Backend Response</CardTitle>
          </CardHeader>
          <CardContent>
            {backendResponse.error ? (
              <p className="text-red-600">Error: {backendResponse.error}</p>
            ) : (
              <div className="space-y-2">
                <div>
                  <strong>Status:</strong> {backendResponse.status}
                </div>
                <div>
                  <strong>Response:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                    {JSON.stringify(backendResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}