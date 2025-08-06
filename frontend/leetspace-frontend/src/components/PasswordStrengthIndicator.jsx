import { validatePassword } from "@/lib/authService";
import { Check, X } from "lucide-react";

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  const validation = validatePassword(password);
  
  if (!password) return null;

  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score) => {
    if (score <= 1) return "Very Weak";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Strong";
    return "Very Strong";
  };

  const requirements = [
    { 
      key: 'minLength', 
      label: 'At least 6 characters', 
      met: validation.minLength 
    },
    { 
      key: 'hasUpperCase', 
      label: 'One uppercase letter', 
      met: validation.hasUpperCase 
    },
    { 
      key: 'hasLowerCase', 
      label: 'One lowercase letter', 
      met: validation.hasLowerCase 
    },
    { 
      key: 'hasNumbers', 
      label: 'One number', 
      met: validation.hasNumbers 
    },
    { 
      key: 'hasSpecialChar', 
      label: 'One special character', 
      met: validation.hasSpecialChar 
    }
  ];

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Strength
          </span>
          <span className={`text-sm font-medium ${
            validation.score <= 2 ? 'text-red-600' : 
            validation.score <= 3 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {getStrengthText(validation.score)}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full ${
                level <= validation.score 
                  ? getStrengthColor(validation.score)
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Requirements:
          </span>
          <div className="space-y-1">
            {requirements.map((req) => (
              <div key={req.key} className="flex items-center space-x-2">
                {req.met ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${
                  req.met 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;