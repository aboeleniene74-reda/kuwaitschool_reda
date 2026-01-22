import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Phone, Settings, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminContentManagement() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: allSettings, refetch } = trpc.admin.getAllSettings.useQuery();
  const initializeMutation = trpc.admin.initializeSettings.useMutation();
  const updateMutation = trpc.admin.updateSetting.useMutation();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect if not admin
  if (!loading && (!user || user.role !== 'admin')) {
    if (!user) {
      window.location.href = getLoginUrl();
    } else {
      setLocation('/');
    }
    return null;
  }

  useEffect(() => {
    if (allSettings) {
      const data: Record<string, string> = {};
      allSettings.forEach(setting => {
        data[setting.key] = setting.value || '';
      });
      setFormData(data);
    }
  }, [allSettings]);

  const handleInitialize = async () => {
    try {
      await initializeMutation.mutateAsync();
      await refetch();
      toast.success("تم تهيئة الإعدادات الافتراضية بنجاح");
    } catch (error) {
      toast.error("فشل في تهيئة الإعدادات");
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (key: string) => {
    try {
      await updateMutation.mutateAsync({
        key,
        value: formData[key] || '',
      });
      toast.success("تم حفظ التعديلات بنجاح");
      setHasChanges(false);
      await refetch();
    } catch (error) {
      toast.error("فشل في حفظ التعديلات");
    }
  };

  const handleSaveAll = async (category: string) => {
    const categorySettings = allSettings?.filter(s => s.category === category) || [];
    
    try {
      for (const setting of categorySettings) {
        await updateMutation.mutateAsync({
          key: setting.key,
          value: formData[setting.key] || '',
        });
      }
      toast.success("تم حفظ جميع التعديلات بنجاح");
      setHasChanges(false);
      await refetch();
    } catch (error) {
      toast.error("فشل في حفظ بعض التعديلات");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const generalSettings = allSettings?.filter(s => s.category === 'general') || [];
  const contactSettings = allSettings?.filter(s => s.category === 'contact') || [];
  const aboutSettings = allSettings?.filter(s => s.category === 'about') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إدارة المحتوى</h1>
              <p className="text-slate-600 mt-1">تعديل محتوى الصفحات والإعدادات</p>
            </div>
            <div className="flex items-center gap-3">
              {!allSettings || allSettings.length === 0 ? (
                <Button onClick={handleInitialize} disabled={initializeMutation.isPending}>
                  {initializeMutation.isPending ? 'جاري التهيئة...' : 'تهيئة الإعدادات الافتراضية'}
                </Button>
              ) : null}
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  العودة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {!allSettings || allSettings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">لم يتم تهيئة الإعدادات بعد</p>
              <Button onClick={handleInitialize} disabled={initializeMutation.isPending}>
                {initializeMutation.isPending ? 'جاري التهيئة...' : 'تهيئة الإعدادات الافتراضية'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="general" className="gap-2">
                <Settings className="h-4 w-4" />
                إعدادات عامة
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2">
                <Phone className="h-4 w-4" />
                معلومات التواصل
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <FileText className="h-4 w-4" />
                صفحة من نحن
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                  <CardDescription>تعديل عنوان الموقع ونص الترحيب</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generalSettings.map(setting => (
                    <div key={setting.key} className="space-y-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.description && (
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      )}
                      {setting.type === 'textarea' ? (
                        <Textarea
                          id={setting.key}
                          value={formData[setting.key] || ''}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          rows={4}
                          className="font-sans"
                        />
                      ) : (
                        <Input
                          id={setting.key}
                          value={formData[setting.key] || ''}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveAll('general')}
                      disabled={!hasChanges || updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التواصل</CardTitle>
                  <CardDescription>تعديل اسم المعلم وأرقام التواصل</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactSettings.map(setting => (
                    <div key={setting.key} className="space-y-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.description && (
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      )}
                      <Input
                        id={setting.key}
                        value={formData[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                      />
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveAll('contact')}
                      disabled={!hasChanges || updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Settings */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>محتوى صفحة "من نحن"</CardTitle>
                  <CardDescription>تعديل النصوص في صفحة من نحن</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {aboutSettings.map(setting => (
                    <div key={setting.key} className="space-y-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      <Textarea
                        id={setting.key}
                        value={formData[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        rows={6}
                        className="font-sans"
                      />
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveAll('about')}
                      disabled={!hasChanges || updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
