
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Notification schema
const notificationFormSchema = z.object({
  examReminders: z.boolean().default(true),
  upcomingExams: z.boolean().default(true),
  gradesReleased: z.boolean().default(true),
  newExamAssigned: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Appearance schema
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  fontSizeMultiplier: z.number().min(80).max(120).default(100),
  highContrast: z.boolean().default(false),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const Settings = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      examReminders: true,
      upcomingExams: true,
      gradesReleased: true,
      newExamAssigned: true,
      emailNotifications: true,
    },
  });

  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      fontSizeMultiplier: 100,
      highContrast: false,
    },
  });

  function onSubmitProfile(data: ProfileFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
      console.log("Profile form data", data);
    }, 1000);
  }

  function onSubmitNotifications(data: NotificationFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
      console.log("Notification form data", data);
    }, 1000);
  }

  function onSubmitAppearance(data: AppearanceFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Appearance settings updated",
        description: "Your theme preferences have been saved.",
      });
      console.log("Appearance form data", data);
    }, 1000);
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your account preferences and settings</p>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-5">
            {/* User profile sidebar */}
            <Card className="md:col-span-2 h-fit">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>How others see you on the platform</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-muted-foreground mt-2 text-sm capitalize">
                    {user?.role} Account
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile form */}
            <Card className="md:col-span-3">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how we can reach you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormDescription>This is your display name.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the email we'll use to contact you.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a little bit about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description for your profile. (Optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="flex gap-2">
                      {isSubmitting && <span className="animate-spin">•</span>}
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)}>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you want to be notified about exams and academic activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-medium">Exam Notifications</h3>
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="examReminders"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">Exam Reminders</FormLabel>
                            <FormDescription>
                              Get notified 24 hours before your scheduled exams
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="upcomingExams"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">Upcoming Exams</FormLabel>
                            <FormDescription>
                              Weekly digest of your upcoming exams
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="gradesReleased"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">Grades Released</FormLabel>
                            <FormDescription>
                              Get notified when your exam results are published
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="newExamAssigned"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">New Exam Assigned</FormLabel>
                            <FormDescription>
                              Get notified when a new exam is assigned to you
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-lg font-medium">Email Preferences</h3>
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center rounded-lg border p-4">
                        <div>
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive email notifications for important updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting} className="flex gap-2">
                    {isSubmitting && <span className="animate-spin">•</span>}
                    <Save className="h-4 w-4 mr-1" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <Form {...appearanceForm}>
              <form onSubmit={appearanceForm.handleSubmit(onSubmitAppearance)}>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the application looks to you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="highContrast"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">High Contrast Mode</FormLabel>
                            <FormDescription>
                              Increase contrast for better readability
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting} className="flex gap-2">
                    {isSubmitting && <span className="animate-spin">•</span>}
                    <Save className="h-4 w-4 mr-1" />
                    Save Appearance
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-1">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Update your password to keep your account secure
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-1 text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete your account and all of your data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
