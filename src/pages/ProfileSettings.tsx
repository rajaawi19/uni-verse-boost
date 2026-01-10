import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitcher } from '@/components/dashboard/ThemeSwitcher';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Camera, 
  Save, 
  Loader2,
  Shield,
  Palette,
  Bell
} from 'lucide-react';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [emailStudyReminders, setEmailStudyReminders] = useState(true);
  const [emailTaskDueDates, setEmailTaskDueDates] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Update display name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  // Sync avatar from profile context
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('email_study_reminders, email_task_due_dates')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setEmailStudyReminders(data.email_study_reminders ?? true);
          setEmailTaskDueDates(data.email_task_due_dates ?? true);
        } else if (!data && !error) {
          // Create user_settings if it doesn't exist
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id });
        }
      }
    };
    fetchNotificationSettings();
  }, [user?.id]);

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    setIsSavingNotifications(true);
    try {
      // First try to update
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            email_study_reminders: emailStudyReminders,
            email_task_due_dates: emailTaskDueDates
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            email_study_reminders: emailStudyReminders,
            email_task_due_dates: emailTaskDueDates
          });
        
        if (error) throw error;
      }
      
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save notification preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      await supabase.storage.from('avatars').remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      const newAvatarUrl = publicUrl + '?t=' + Date.now();
      setAvatarUrl(newAvatarUrl);
      updateAvatar(newAvatarUrl); // Sync with context
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile(displayName.trim());
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold truncate">Profile Settings</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Manage your account</p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                    <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                    <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="text-sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Separator className="my-3 sm:my-4" />

              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
                className="w-full sm:w-auto text-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Customize how StudyHub looks for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Account Security
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/forgot-password')}
                  className="w-full sm:w-auto text-sm"
                >
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <Label htmlFor="study-reminders" className="font-medium text-sm">
                    Study Reminders
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Stay on track with your study schedule
                  </p>
                </div>
                <Switch
                  id="study-reminders"
                  checked={emailStudyReminders}
                  onCheckedChange={setEmailStudyReminders}
                  className="shrink-0"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <Label htmlFor="task-due-dates" className="font-medium text-sm">
                    Task Due Date Alerts
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get notified for upcoming deadlines
                  </p>
                </div>
                <Switch
                  id="task-due-dates"
                  checked={emailTaskDueDates}
                  onCheckedChange={setEmailTaskDueDates}
                  className="shrink-0"
                />
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleSaveNotifications} 
                disabled={isSavingNotifications}
                className="w-full sm:w-auto text-sm"
              >
                {isSavingNotifications ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;