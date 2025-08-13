import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { validatePassword } from "@/lib/authService";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Trash2, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { 
    user, 
    isEmailVerified, 
    hasPasswordProvider, 
    hasGoogleProvider,
    updateProfile, 
    updatePassword, 
    sendEmailVerification,
    deleteAccount 
  } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    verification: false,
    delete: false
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Delete account state
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmText: ""
  });
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));

    try {
      const result = await updateProfile({
        displayName: profileForm.displayName.trim()
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      toast.error("Password doesn't meet requirements");
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));

    try {
      if (passwordForm.currentPassword === passwordForm.newPassword) {
        toast.error("New password must be different from current password");
        setLoading(prev => ({ ...prev, password: false }));
        return;
      }
      const result = await updatePassword(
        passwordForm.currentPassword, 
        passwordForm.newPassword
      );

      if (result.success) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        toast.success("Password updated successfully!");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to update password");
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleSendVerification = async () => {
    setLoading(prev => ({ ...prev, verification: true }));
    
    try {
      await sendEmailVerification();
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setLoading(prev => ({ ...prev, verification: false }));
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (deleteForm.confirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));

    try {
      const result = await deleteAccount(
        hasPasswordProvider ? deleteForm.password : null
      );

      if (result.success) {
        toast.success("Account deleted successfully");
        // User will be redirected automatically when auth state changes
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Please sign in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 mb-6">
          <div className="border-b border-gray-200 dark:border-zinc-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Information
                  </h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-300 dark:bg-zinc-700 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-700 shadow-sm">
                            <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {user.displayName || "No display name"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      <div>
                        <Label htmlFor="displayName" className="text-gray-700 dark:text-gray-300">
                          Display Name
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm(prev => ({ 
                            ...prev, 
                            displayName: e.target.value 
                          }))}
                          placeholder="Enter your display name"
                          className="mt-1 bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-700 dark:text-gray-300">Email Address</Label>
                        <div className="flex items-center gap-3 mt-1">
                          <Input
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                          />
                          <div className="flex items-center gap-1">
                            {isEmailVerified ? (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Mail className="w-5 h-5" />
                                <span className="text-sm font-medium">Unverified</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!isEmailVerified && (
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleSendVerification}
                              disabled={loading.verification}
                              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              {loading.verification ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Mail className="w-4 h-4 mr-2" />
                              )}
                              Send Verification Email
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading.profile}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading.profile ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                {/* Account Providers */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Connected Accounts
                  </h2>
                  <div className="space-y-3">
                    {hasGoogleProvider && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Google Account</span>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    )}
                    {hasPasswordProvider && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Email & Password</span>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Password (only for email/password accounts) */}
                {hasPasswordProvider && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h2>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div>
                        <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                          Current Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              currentPassword: e.target.value 
                            }))}
                            className="pr-10 bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ 
                              ...prev, 
                              current: !prev.current 
                            }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                          New Password
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              newPassword: e.target.value 
                            }))}
                            className="pr-10 bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                          />
                        </div>
                        {passwordForm.newPassword && (
                          <div className="mt-2">
                            <PasswordStrengthIndicator password={passwordForm.newPassword} />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              confirmPassword: e.target.value 
                            }))}
                            className="pr-10 bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ 
                              ...prev, 
                              confirm: !prev.confirm 
                            }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading.password}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading.password ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Update Password
                      </Button>
                    </form>
                  </div>
                )}

                {/* Danger Zone */}
                <div>
                  <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                    Danger Zone
                  </h2>

                  <form onSubmit={handleDeleteAccount} className="space-y-6">
                    {hasPasswordProvider && (
                      <div>
                        <Label htmlFor="deletePassword" className="text-gray-700 dark:text-gray-300">
                          Confirm Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="deletePassword"
                            type={showDeletePassword ? "text" : "password"}
                            value={deleteForm.password}
                            onChange={(e) => setDeleteForm(prev => ({ 
                              ...prev, 
                              password: e.target.value 
                            }))}
                            className="pr-10 bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDeletePassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          >
                            {showDeletePassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="confirmText" className="text-gray-700 dark:text-gray-300">
                        Type DELETE to confirm
                      </Label>
                      <Input
                        id="confirmText"
                        type="text"
                        value={deleteForm.confirmText}
                        onChange={(e) => setDeleteForm(prev => ({ 
                          ...prev, 
                          confirmText: e.target.value 
                        }))}
                        className="bg-white text-black dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-400"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading.delete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {loading.delete ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete Account
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}