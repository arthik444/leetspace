import re
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class PasswordCriteria:
    """Password validation criteria configuration"""
    min_length: int = 8
    max_length: int = 128
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    min_special_chars: int = 1
    disallow_common_patterns: bool = True
    disallow_personal_info: bool = True

class PasswordStrength:
    """Password strength levels"""
    VERY_WEAK = 0
    WEAK = 1
    FAIR = 2
    GOOD = 3
    STRONG = 4
    VERY_STRONG = 5

    @classmethod
    def get_label(cls, strength: int) -> str:
        labels = {
            cls.VERY_WEAK: "Very Weak",
            cls.WEAK: "Weak", 
            cls.FAIR: "Fair",
            cls.GOOD: "Good",
            cls.STRONG: "Strong",
            cls.VERY_STRONG: "Very Strong"
        }
        return labels.get(strength, "Unknown")

    @classmethod
    def get_color(cls, strength: int) -> str:
        colors = {
            cls.VERY_WEAK: "#dc2626",  # red-600
            cls.WEAK: "#ea580c",       # orange-600
            cls.FAIR: "#d97706",       # amber-600
            cls.GOOD: "#ca8a04",       # yellow-600
            cls.STRONG: "#16a34a",     # green-600
            cls.VERY_STRONG: "#059669" # emerald-600
        }
        return colors.get(strength, "#6b7280")

class PasswordValidator:
    """Comprehensive password validation and strength checking"""
    
    # Common weak passwords (a subset - in production, use a larger list)
    COMMON_PASSWORDS = {
        "password", "123456", "123456789", "qwerty", "abc123", "password123",
        "admin", "login", "welcome", "monkey", "1234567890", "letmein",
        "dragon", "master", "shadow", "1234567", "football", "baseball",
        "superman", "access", "trustno1", "batman", "hello", "zaq1zaq1"
    }
    
    # Common patterns to avoid
    COMMON_PATTERNS = [
        r"(.)\1{2,}",  # Repeated characters (aaa, 111, etc.)
        r"12345|23456|34567|45678|56789|67890",  # Sequential numbers
        r"abcde|bcdef|cdefg|defgh|efghi|fghij",  # Sequential letters
        r"qwert|werty|ertyu|rtyui|tyuio|yuiop",  # Keyboard patterns
        r"asdfg|sdfgh|dfghj|fghjk|ghjkl",  # Keyboard patterns
        r"zxcvb|xcvbn|cvbnm"  # Keyboard patterns
    ]
    
    def __init__(self, criteria: PasswordCriteria = None):
        self.criteria = criteria or PasswordCriteria()
    
    def validate_password(self, password: str, user_info: Dict = None) -> Tuple[bool, List[str], int]:
        """
        Validate password against criteria and return validation result.
        
        Args:
            password: Password to validate
            user_info: Optional user information (email, name) to check against
            
        Returns:
            Tuple of (is_valid, error_messages, strength_score)
        """
        errors = []
        
        # Length validation
        if len(password) < self.criteria.min_length:
            errors.append(f"Password must be at least {self.criteria.min_length} characters long")
        
        if len(password) > self.criteria.max_length:
            errors.append(f"Password must be no more than {self.criteria.max_length} characters long")
        
        # Character type validation
        if self.criteria.require_uppercase and not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")
        
        if self.criteria.require_lowercase and not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")
        
        if self.criteria.require_numbers and not re.search(r"\d", password):
            errors.append("Password must contain at least one number")
        
        if self.criteria.require_special_chars:
            special_chars = re.findall(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password)
            if len(special_chars) < self.criteria.min_special_chars:
                errors.append(f"Password must contain at least {self.criteria.min_special_chars} special character(s)")
        
        # Common password validation
        if self.criteria.disallow_common_patterns:
            if password.lower() in self.COMMON_PASSWORDS:
                errors.append("Password is too common. Please choose a more unique password")
            
            # Check for common patterns
            for pattern in self.COMMON_PATTERNS:
                if re.search(pattern, password.lower()):
                    errors.append("Password contains common patterns. Please avoid sequences or repeated characters")
                    break
        
        # Personal information validation
        if self.criteria.disallow_personal_info and user_info:
            if self._contains_personal_info(password, user_info):
                errors.append("Password should not contain personal information")
        
        # Calculate strength
        strength = self._calculate_strength(password)
        
        return len(errors) == 0, errors, strength
    
    def _contains_personal_info(self, password: str, user_info: Dict) -> bool:
        """Check if password contains personal information."""
        password_lower = password.lower()
        
        # Check email
        if user_info.get("email"):
            email_local = user_info["email"].split("@")[0].lower()
            if len(email_local) > 2 and email_local in password_lower:
                return True
        
        # Check name
        if user_info.get("full_name"):
            name_parts = user_info["full_name"].lower().split()
            for part in name_parts:
                if len(part) > 2 and part in password_lower:
                    return True
        
        return False
    
    def _calculate_strength(self, password: str) -> int:
        """Calculate password strength score (0-5)."""
        score = 0
        
        # Length scoring
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Character variety scoring
        has_upper = bool(re.search(r"[A-Z]", password))
        has_lower = bool(re.search(r"[a-z]", password))
        has_numbers = bool(re.search(r"\d", password))
        has_special = bool(re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password))
        
        char_types = sum([has_upper, has_lower, has_numbers, has_special])
        
        if char_types >= 3:
            score += 1
        if char_types == 4:
            score += 1
        
        # Complexity bonus
        if len(password) >= 12 and char_types >= 3:
            # Check for additional complexity
            special_count = len(re.findall(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password))
            number_count = len(re.findall(r"\d", password))
            
            if special_count >= 2 and number_count >= 2:
                score += 1
        
        # Penalties for common patterns
        password_lower = password.lower()
        
        # Check for repeated characters
        if re.search(r"(.)\1{2,}", password):
            score = max(0, score - 1)
        
        # Check for common patterns
        for pattern in self.COMMON_PATTERNS[:3]:  # Check only most common patterns
            if re.search(pattern, password_lower):
                score = max(0, score - 1)
                break
        
        # Check against common passwords
        if password_lower in self.COMMON_PASSWORDS:
            score = 0
        
        return min(score, PasswordStrength.VERY_STRONG)
    
    def get_strength_feedback(self, password: str) -> Dict:
        """Get detailed feedback about password strength."""
        strength = self._calculate_strength(password)
        
        suggestions = []
        
        if len(password) < 12:
            suggestions.append("Use at least 12 characters for better security")
        
        if not re.search(r"[A-Z]", password):
            suggestions.append("Add uppercase letters")
        
        if not re.search(r"[a-z]", password):
            suggestions.append("Add lowercase letters")
        
        if not re.search(r"\d", password):
            suggestions.append("Add numbers")
        
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~`]", password):
            suggestions.append("Add special characters (!@#$%^&*)")
        
        if re.search(r"(.)\1{2,}", password):
            suggestions.append("Avoid repeating characters")
        
        # Check for patterns
        for pattern in self.COMMON_PATTERNS:
            if re.search(pattern, password.lower()):
                suggestions.append("Avoid common patterns and sequences")
                break
        
        return {
            "strength": strength,
            "strength_label": PasswordStrength.get_label(strength),
            "strength_color": PasswordStrength.get_color(strength),
            "suggestions": suggestions[:3],  # Limit to top 3 suggestions
            "score_percentage": (strength / PasswordStrength.VERY_STRONG) * 100
        }

# Create default validator instance
default_password_validator = PasswordValidator()

def validate_password(password: str, user_info: Dict = None) -> Tuple[bool, List[str], int]:
    """Convenience function using default validator."""
    return default_password_validator.validate_password(password, user_info)

def get_password_strength(password: str) -> Dict:
    """Convenience function to get password strength feedback."""
    return default_password_validator.get_strength_feedback(password)