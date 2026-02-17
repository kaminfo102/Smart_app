
import React from 'react';
import { Copy, Terminal, Shield, Globe, GraduationCap } from 'lucide-react';

const AdminHelp: React.FC = () => {
  const instructorRoleSnippet = `
// 1. افزودن نقش مربی (Instructor) به وردپرس
function add_lms_instructor_role() {
    add_role(
        'instructor',
        'مربی',
        array(
            'read'         => true,  // امکان ورود
            'edit_posts'   => false,
            'upload_files' => true,  // آپلود فایل
            'level_1'      => true,
        )
    );
}
add_action('init', 'add_lms_instructor_role');
`;

  const studentRoleSnippet = `
// 2. افزودن نقش دانش‌آموز (Student) به وردپرس
function add_lms_student_role() {
    add_role(
        'student',
        'دانش‌آموز',
        array(
            'read'    => true,  // امکان ورود و مشاهده
            'level_0' => true,
        )
    );
}
add_action('init', 'add_lms_student_role');
`;

  const corsSnippet = `
// 3. تنظیمات CORS (برای حل مشکل اتصال API)
add_action('init', function() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
});
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('کد در کلیپ‌بورد کپی شد!');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary-500" />
            راهنمای پیکربندی وردپرس
        </h2>

        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-2xl text-sm leading-relaxed">
            <strong>توجه مهم:</strong> برای اینکه اپلیکیشن بتواند نقش‌های مربی و دانش‌آموز را شناسایی کند، باید کدهای زیر را در فایل 
            <code className="mx-1 bg-white/50 px-1 rounded font-mono">functions.php</code> 
            قالب وردپرس خود یا از طریق افزونه 
            <strong> Code Snippets </strong> 
            اضافه کنید.
        </div>

        <div className="grid gap-6">
            {/* Instructor Role Snippet */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <Shield className="w-5 h-5 text-purple-600" />
                        ۱. کد ایجاد نقش مربی
                    </div>
                    <button onClick={() => copyToClipboard(instructorRoleSnippet)} className="text-xs flex items-center gap-1 text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                        کپی کد
                    </button>
                </div>
                <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto" dir="ltr">
                    <pre>{instructorRoleSnippet}</pre>
                </div>
            </div>

            {/* Student Role Snippet */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        ۲. کد ایجاد نقش دانش‌آموز
                    </div>
                    <button onClick={() => copyToClipboard(studentRoleSnippet)} className="text-xs flex items-center gap-1 text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                        کپی کد
                    </button>
                </div>
                <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto" dir="ltr">
                    <pre>{studentRoleSnippet}</pre>
                </div>
            </div>

            {/* CORS Snippet */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <Globe className="w-5 h-5 text-orange-600" />
                        ۳. رفع خطای CORS (اختیاری)
                    </div>
                    <button onClick={() => copyToClipboard(corsSnippet)} className="text-xs flex items-center gap-1 text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                        کپی کد
                    </button>
                </div>
                <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto" dir="ltr">
                    <pre>{corsSnippet}</pre>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminHelp;
