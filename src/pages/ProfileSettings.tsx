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
  const { user, profile, updateProfile } = useAuth();
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

  // Fetch current avatar URL
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };
    fetchAvatar();
  }, [user?.id]);

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_settings')
          .select('email_study_reminders, email_task_due_dates')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setEmailStudyReminders(data.email_study_reminders ?? true);
          setEmailTaskDueDates(data.email_task_due_dates ?? true);
        }
      }
    };
    fetchNotificationSettings();
  }, [user?.id]);

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          email_study_reminders: emailStudyReminders,
          email_task_due_dates: emailTaskDueDates
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
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

      setAvatarUrl(publicUrl + '?t=' + Date.now()); // Add timestamp to force refresh
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Profile Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account preferences</p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Separator className="my-4" />

              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
                className="w-full sm:w-auto"
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how StudyHub looks for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Choose between light, dark, or custom themes
                  </p>
                </div>
                <ThemeSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/forgot-password')}
                >
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="study-reminders" className="font-medium">
                    Study Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email reminders to stay on track with your study schedule
                  </p>
                </div>
                <Switch
                  id="study-reminders"
                  checked={emailStudyReminders}
                  onCheckedChange={setEmailStudyReminders}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-due-dates" className="font-medium">
                    Task Due Date Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when tasks are approaching their due dates
                  </p>
                </div>
                <Switch
                  id="task-due-dates"
                  checked={emailTaskDueDates}
                  onCheckedChange={setEmailTaskDueDates}
                />
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleSaveNotifications} 
                disabled={isSavingNotifications}
                className="w-full sm:w-auto"
              >
                {isSavingNotifications ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;