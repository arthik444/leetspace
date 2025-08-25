// AuthDebug.jsx - Debug authentication flow

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkAuthState = async () => {
      if (user) {
        try {
          // Get ID token
          const idToken = await user.getIdToken();
          
          // Parse token manually for debugging
          const parts = idToken.split('.');
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          setDebugInfo({
            user: {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              displayName: user.displayName
            },
            token: {
              header,
              payload,
              fullToken: idToken.substring(0, 100) + '...'
            }
          });
        } catch (error) {
          setDebugInfo({ error: error.message });
        }
      } else {
        setDebugInfo({ error: 'No user logged in' });
      }
    };

    checkAuthState();
  }, [user]);

  const testBackendAuth = async () => {
    try {
      if (!user) {
        alert('Please log in first');
        return;
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/test-auth`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Backend authentication successful!');
      } else {
        alert(`Backend authentication failed: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error testing backend auth:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const testProblemsAPI = async () => {
    try {
      if (!user) {
        alert('Please log in first');
        return;
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/api/problems/?sort_by=date_solved&order=desc`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Problems API successful! Found ${data.length} problems`);
      } else {
        alert(`Problems API failed: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error testing problems API:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="space-x-2">
                <Button onClick={testBackendAuth}>Test Backend Auth</Button>
                <Button onClick={testProblemsAPI}>Test Problems API</Button>
              </div>
              
              <div>
                <h3 className="font-semibold">Debug Info:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p>Please log in to test authentication.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}