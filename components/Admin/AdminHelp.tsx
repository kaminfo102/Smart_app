
import React, { useState } from 'react';
import { Copy, Terminal, Shield, Globe, Database, Server, Box, Download, FileText } from 'lucide-react';

const AdminHelp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'database' | 'plugin' | 'roles'>('plugin');

  const sqlSnippet = `
CREATE TABLE IF NOT EXISTS wp_lms_cooperation (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    full_name varchar(255) NOT NULL,
    education varchar(255) NOT NULL,
    gender varchar(50) NOT NULL,
    province varchar(100) NOT NULL,
    city varchar(100) NOT NULL,
    type varchar(50) NOT NULL,
    mobile varchar(20) NOT NULL,
    description text,
    created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status varchar(50) DEFAULT 'pending',
    PRIMARY KEY  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

  const pluginCode = `<?php
/*
Plugin Name: افزونه API اختصاصی فروشگاه
Description: مدیریت ارتباط با اپلیکیشن، حل مشکل CORS و جدول همکاری (بدون نیاز به Snippet)
Version: 1.0
Author: App Admin
*/

if (!defined('ABSPATH')) exit;

// 1. تنظیمات CORS
add_action('init', function() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit();
    }
});

// 2. رفع مشکل کوکی و خطای 403 در API
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) return $result;
    $route = untrailingslashit($GLOBALS['wp']->query_vars['rest_route'] ?? '');
    if (strpos($route, '/lms/v1') !== false) {
        return true;
    }
    return $result;
});

// 3. تعریف مسیرهای API
add_action('rest_api_init', function () {
    // ثبت درخواست همکاری
    register_rest_route('lms/v1', '/cooperation', [
        'methods' => 'POST',
        'callback' => 'lms_api_create_cooperation',
        'permission_callback' => '__return_true'
    ]);
    
    // دریافت لیست درخواست‌ها
    register_rest_route('lms/v1', '/cooperation', [
        'methods' => 'GET',
        'callback' => 'lms_api_get_cooperation',
        'permission_callback' => '__return_true'
    ]);
});

function lms_api_create_cooperation($request) {
    global $wpdb;
    $table = $wpdb->prefix . 'lms_cooperation';
    $p = $request->get_json_params();

    $wpdb->insert($table, [
        'full_name' => sanitize_text_field($p['fullName']),
        'education' => sanitize_text_field($p['education']),
        'gender' => sanitize_text_field($p['gender']),
        'province' => sanitize_text_field($p['province']),
        'city' => sanitize_text_field($p['city']),
        'type' => sanitize_text_field($p['type']),
        'mobile' => sanitize_text_field($p['mobile']),
        'description' => sanitize_textarea_field($p['description']),
        'created_at' => current_time('mysql'),
        'status' => 'pending'
    ]);

    return new WP_REST_Response(['id' => $wpdb->insert_id, 'msg' => 'Success'], 200);
}

function lms_api_get_cooperation() {
    global $wpdb;
    $table = $wpdb->prefix . 'lms_cooperation';
    // بررسی وجود جدول برای جلوگیری از خطا
    if($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table) {
        return [];
    }
    return $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
}
?>`;

  const rolesSnippet = `
// کد ایجاد نقش‌ها (اختیاری - در صورت نیاز به فایل افزونه بالا اضافه کنید)
add_action('init', function() {
    add_role('instructor', 'مربی', array('read' => true, 'upload_files' => true, 'level_1' => true));
    add_role('student', 'دانش‌آموز', array('read' => true, 'level_0' => true));
});
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('کد کپی شد!');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary-500" />
                راهنمای نصب (روش پلاگین)
            </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-x-auto">
            <button 
                onClick={() => setActiveTab('plugin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'plugin' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
                <Box className="w-4 h-4" />
                ۱. ساخت افزونه (راه حل ۴۰۳)
            </button>
            <button 
                onClick={() => setActiveTab('database')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'database' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
                <Database className="w-4 h-4" />
                ۲. دیتابیس (انجام شده)
            </button>
            <button 
                onClick={() => setActiveTab('roles')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'roles' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
                <Shield className="w-4 h-4" />
                ۳. نقش‌ها
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm min-h-[400px]">
            
            {/* TAB 1: PLUGIN METHOD */}
            {activeTab === 'plugin' && (
                <div className="animate-in fade-in">
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 border-b border-green-100 dark:border-green-800">
                        <h3 className="font-bold text-green-800 dark:text-green-200 flex items-center gap-2 mb-2">
                            <Box className="w-5 h-5" />
                            دور زدن خطای ۴۰۳ با نصب افزونه
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-4">
                            از آنجایی که فایروال هاست شما اجازه ذخیره کد در افزونه Code Snippets را نمی‌دهد، بهترین راه این است که کد زیر را به عنوان یک افزونه مستقل نصب کنید. این روش ۱۰۰٪ استاندارد و امن است.
                        </p>
                        <ol className="list-decimal list-inside text-sm space-y-2 font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                            <li>کد زیر را کپی کنید.</li>
                            <li>یک فایل متنی در کامپیوتر خود بسازید و نام آن را <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">my-shop-api.php</code> بگذارید.</li>
                            <li>کد را درون فایل قرار داده و ذخیره کنید.</li>
                            <li>فایل را Zip کنید (اختیاری) یا مستقیماً به هاست بروید.</li>
                            <li>در پنل وردپرس: <strong>افزونه‌ها » افزودن » بارگذاری افزونه</strong> را بزنید و فایل را آپلود و فعال کنید.</li>
                        </ol>
                    </div>
                    <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto relative" dir="ltr">
                        <button onClick={() => copyToClipboard(pluginCode)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            کپی کد افزونه
                        </button>
                        <pre>{pluginCode}</pre>
                    </div>
                </div>
            )}

            {/* TAB 2: DATABASE */}
            {activeTab === 'database' && (
                <div className="animate-in fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 border-b border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                            <Server className="w-5 h-5" />
                            ساخت جدول دیتابیس
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            شما قبلاً اعلام کردید که این مرحله را با موفقیت در phpMyAdmin انجام داده‌اید. اگر نیاز به کد مجدد دارید، در زیر موجود است.
                        </p>
                    </div>
                    <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto relative group" dir="ltr">
                        <button onClick={() => copyToClipboard(sqlSnippet)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors">
                            <Copy className="w-4 h-4" />
                        </button>
                        <pre>{sqlSnippet}</pre>
                    </div>
                </div>
            )}

            {/* TAB 3: ROLES */}
            {activeTab === 'roles' && (
                <div className="animate-in fade-in">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 border-b border-purple-100 dark:border-purple-800">
                        <h3 className="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5" />
                            نقش‌های کاربری
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                            می‌توانید این کد کوتاه را نیز به انتهای فایل افزونه (<code className="font-mono">my-shop-api.php</code>) اضافه کنید تا نقش‌های کاربری هم ساخته شوند.
                        </p>
                    </div>
                    <div className="p-4 bg-[#1e1e1e] text-gray-300 text-xs md:text-sm font-mono overflow-x-auto relative" dir="ltr">
                        <button onClick={() => copyToClipboard(rolesSnippet)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors">
                            <Copy className="w-4 h-4" />
                        </button>
                        <pre>{rolesSnippet}</pre>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default AdminHelp;
