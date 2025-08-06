import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';

const PasswordStrengthIndicator = ({ 
  password, 
  email = '', 
  fullName = '', 
  showToggle = true,
  className = ''
}) => {
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!password || password.length === 0) {
      setStrength(null);
      return;
    }

    const checkStrength = async () => {
      setLoading(true);
      try {
        const response = await apiService.request('/auth/password-strength', {
          method: 'POST',
          body: JSON.stringify({
            password,
            email: email || undefined,
            full_name: fullName || undefined
          })
        });
        setStrength(response);
      } catch (error) {
        console.error('Password strength check failed:', error);
        // Fallback to basic client-side validation
        setStrength(getBasicStrength(password));
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(checkStrength, 300);
    return () => clearTimeout(timeoutId);
  }, [password, email, fullName]);

  const getBasicStrength = (pass) => {
    let score = 0;
    const errors = [];
    
    if (pass.length >= 8) score += 1;
    else errors.push('At least 8 characters');
    
    if (/[A-Z]/.test(pass)) score += 1;
    else errors.push('One uppercase letter');
    
    if (/[a-z]/.test(pass)) score += 1;
    else errors.push('One lowercase letter');
    
    if (/\d/.test(pass)) score += 1;
    else errors.push('One number');
    
    if (/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]/.test(pass)) score += 1;
    else errors.push('One special character');

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#059669'];
    
    return {
      is_valid: errors.length === 0,
      errors,
      strength: score,
      strength_label: strengthLabels[Math.min(score, 4)],
      strength_color: strengthColors[Math.min(score, 4)],
      score_percentage: (score / 5) * 100,
      suggestions: errors
    };
  };

  const getStrengthBarColor = () => {
    if (!strength) return 'bg-gray-200';
    
    const scorePercentage = strength.score_percentage;
    if (scorePercentage <= 20) return 'bg-red-500';
    if (scorePercentage <= 40) return 'bg-orange-500';
    if (scorePercentage <= 60) return 'bg-yellow-500';
    if (scorePercentage <= 80) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Password strength</span>
          {strength && (
            <span 
              className="font-medium"
              style={{ color: strength.strength_color }}
            >
              {loading ? 'Checking...' : strength.strength_label}
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
            style={{ width: `${strength?.score_percentage || 0}%` }}
          />
        </div>
      </div>

      {/* Validation Messages */}
      {strength && !loading && (
        <div className="space-y-2">
          {/* Errors */}
          {strength.errors && strength.errors.length > 0 && (
            <div className="space-y-1">
              {strength.errors.map((error, index) => (
                <div key={index} className="flex items-center text-sm text-red-600">
                  <X className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {strength.suggestions && strength.suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <AlertCircle className="w-3 h-3 mr-2" />
                <span>Suggestions:</span>
              </div>
              {strength.suggestions.map((suggestion, index) => (
                <div key={index} className="text-sm text-gray-600 ml-5">
                  • {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* Success message */}
          {strength.is_valid && (
            <div className="flex items-center text-sm text-green-600">
              <Check className="w-3 h-3 mr-2" />
              <span>Password meets all requirements</span>
            </div>
          )}
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="border-t pt-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Requirements:</div>
        <div className="grid grid-cols-1 gap-1 text-sm">
          <RequirementItem met={password.length >= 8} text="At least 8 characters" />
          <RequirementItem met={/[A-Z]/.test(password)} text="One uppercase letter" />
          <RequirementItem met={/[a-z]/.test(password)} text="One lowercase letter" />
          <RequirementItem met={/\d/.test(password)} text="One number" />
          <RequirementItem 
            met={/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]/.test(password)} 
            text="One special character (!@#$%^&*)" 
          />
        </div>
      </div>
    </div>
  );
};

const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? (
      <Check className="w-3 h-3 mr-2 flex-shrink-0" />
    ) : (
      <X className="w-3 h-3 mr-2 flex-shrink-0" />
    )}
    <span>{text}</span>
  </div>
);

export default PasswordStrengthIndicator;