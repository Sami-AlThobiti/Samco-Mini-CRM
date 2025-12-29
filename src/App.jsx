import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  Copy, 
  CheckCircle2, 
  MoveRight,
  Trash2,
  X,
  Palette,
  Home,
  Menu,
  MoreVertical,
  Youtube,
  Instagram,
  Twitter, // Represents X
  Music2, // Represents TikTok
  Info,
  Zap,
  Heart,
  Sparkles, // New
  Loader2, // New
  Wand2 // New
} from 'lucide-react';

// --- Gemini API Helper ---
const generateGeminiContent = async (prompt) => {
  const apiKey = ""; // API Key injected at runtime
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // System instruction to ensure Arabic and Professional persona
          systemInstruction: { parts: [{ text: "أنت مساعد ذكي لمصمم جرافيك ومطور مواقع. يجب أن تكون ردودك باللغة العربية، احترافية، مختصرة، ومفيدة." }] }
        }),
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من توليد النص.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.";
  }
};

// --- Components ---

// 1. Toast Notification
const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce-in border border-gray-700">
      <CheckCircle2 className="text-green-400 w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

// 2. Animated Social Button
const SocialButton = ({ href, icon: Icon, color, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`group relative p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex flex-col items-center justify-center gap-2 overflow-hidden`}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-tr ${color}`} />
    <Icon className="w-8 h-8 text-white z-10 group-hover:scale-125 transition-transform duration-300" />
    <span className="text-xs font-bold text-white/80 z-10">{label}</span>
  </a>
);

// 3. AI Plan Modal
const AIPlanModal = ({ isOpen, onClose, content, loading, themeStyle }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border ${themeStyle} relative`}>
        <button onClick={onClose} className="absolute top-4 left-4 opacity-50 hover:opacity-100">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-yellow-400" /> خطة العمل المقترحة
        </h3>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-70">
            <Loader2 className="animate-spin w-10 h-10 mb-2" />
            <p>جارٍ استشارة الذكاء الاصطناعي...</p>
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-sm max-h-[60vh] overflow-y-auto p-2 bg-black/10 rounded-xl">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [clients, setClients] = useState([
    { id: 1, name: 'شركة الأفق', project: 'تصميم هوية بصرية', phone: '966500000000', status: 'new', budget: '5000' },
    { id: 2, name: 'مطعم الساحل', project: 'إدارة سوشيال ميديا', phone: '966511111111', status: 'in-progress', budget: '3500' },
    { id: 3, name: 'تطبيق فاست', project: 'تصميم واجهة UX/UI', phone: '966522222222', status: 'review', budget: '8000' },
    { id: 4, name: 'متجر زهرة', project: 'متجر إلكتروني', phone: '966533333333', status: 'done', budget: '6000' },
  ]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [currentTheme, setCurrentTheme] = useState('cyber'); // cyber, minimal, sunset

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Kanban AI Modal State
  const [kanbanAiModal, setKanbanAiModal] = useState({ open: false, content: '', loading: false });

  // Quick Templates
  const templates = [
    { title: "استلام التفاصيل", text: "أهلاً بك عزيزي، تم استلام كافة التفاصيل بنجاح ✅. سيتم مراجعتها والبدء في العمل قريباً." },
    { title: "النسخة الأولى", text: "مرحباً، تم إرسال النسخة الأولى من العمل 🎬. بانتظار ملاحظاتك القيمة لنقوم بالتعديلات اللازمة." },
    { title: "تسليم نهائي", text: "العمل جاهز للتسليم النهائي! ✅ تفضل الملفات المرفقة، وسعدت جداً بالتعامل معك." },
    { title: "تذكير بالدفع", text: "مساء الخير، تذكير لطيف بموعد الدفعة المستحقة لاستكمال مراحل العمل 💰. شكراً لتفهمك." }
  ];

  // Helper Functions
  const showNotification = (msg) => {
    setToast({ show: true, message: msg });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("تم نسخ النص بنجاح!");
  };

  // AI Message Generator Handler
  const handleAiMessageGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    
    const prompt = `اكتب رسالة واتساب احترافية لعميل بخصوص: ${aiPrompt}. اجعلها ودودة وقصيرة.`;
    const result = await generateGeminiContent(prompt);
    
    setAiResponse(result);
    setIsAiLoading(false);
  };

  // AI Kanban Planner Handler
  const handleAiPlanGenerate = async (projectName) => {
    setKanbanAiModal({ open: true, content: '', loading: true });
    
    const prompt = `لدي مشروع بعنوان "${projectName}". قم بإنشاء قائمة مهام (Checklist) من 5 خطوات رئيسية وعملية لإنجاز هذا المشروع كمصمم محترف. بدون مقدمات طويلة.`;
    const result = await generateGeminiContent(prompt);
    
    setKanbanAiModal({ open: true, content: result, loading: false });
  };

  // Drag & Drop Logic
  const handleDragStart = (e, clientId) => {
    e.dataTransfer.setData("clientId", clientId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    const clientId = parseInt(e.dataTransfer.getData("clientId"));
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    showNotification("تم تحديث حالة العميل");
  };

  // Theme Styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'minimal':
        return "bg-slate-50 text-slate-900";
      case 'sunset':
        return "bg-gradient-to-br from-orange-500 via-red-500 to-purple-800 text-white";
      case 'cyber':
      default:
        return "bg-slate-900 text-white";
    }
  };

  const getCardStyle = () => {
    switch (currentTheme) {
      case 'minimal': return "bg-white border-slate-200 shadow-sm text-slate-800";
      case 'sunset': return "bg-white/20 backdrop-blur-md border-white/30 text-white shadow-lg";
      case 'cyber': return "bg-slate-800 border-slate-700 text-slate-100 shadow-xl";
      default: return "bg-slate-800 border-slate-700 text-slate-100 shadow-xl";
    }
  };

  // --- Views ---

  // 1. Dashboard View
  const DashboardView = () => {
    const stats = {
      total: clients.length,
      new: clients.filter(c => c.status === 'new').length,
      active: clients.filter(c => ['in-progress', 'review'].includes(c.status)).length,
      revenue: clients.reduce((acc, curr) => acc + parseInt(curr.budget || 0), 0)
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6">لوحة المعلومات</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي العملاء', val: stats.total, icon: Users, color: 'text-blue-500' },
            { label: 'قيد التنفيذ', val: stats.active, icon: KanbanSquare, color: 'text-yellow-500' },
            { label: 'طلبات جديدة', val: stats.new, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'الدخل المتوقع', val: `${stats.revenue} ريال`, icon: LayoutDashboard, color: 'text-purple-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${getCardStyle()} flex items-center justify-between`}>
              <div>
                <p className="text-sm opacity-70 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.val}</h3>
              </div>
              <div className={`p-3 rounded-full bg-opacity-10 ${currentTheme === 'minimal' ? 'bg-slate-100' : 'bg-white/10'}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Chart Visualization */}
        <div className={`p-6 rounded-2xl border ${getCardStyle()}`}>
          <h3 className="font-bold mb-4">أداء المشاريع</h3>
          <div className="flex items-end gap-2 h-40">
            {['جديد', 'قيد العمل', 'مراجعة', 'مكتمل'].map((label, i) => {
               const count = clients.filter(c => 
                 i === 0 ? c.status === 'new' : 
                 i === 1 ? c.status === 'in-progress' :
                 i === 2 ? c.status === 'review' : c.status === 'done'
               ).length;
               const height = count > 0 ? `${(count / clients.length) * 100}%` : '5%';
               
               return (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                   <div 
                    style={{ height }} 
                    className={`w-full max-w-[60px] rounded-t-xl transition-all duration-500 group-hover:opacity-80
                      ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-purple-500' : 'bg-green-500'}
                    `}
                   ></div>
                   <span className="text-xs opacity-70">{label}</span>
                 </div>
               )
            })}
          </div>
        </div>

        {/* Social Links Section in Dashboard */}
        <div className="mt-8">
           <h3 className="font-bold mb-4 flex items-center gap-2">
             <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
             تابع سامكو للمزيد من الأدوات
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SocialButton label="X / Twitter" href="https://x.com/designer_samco?s=21&t=dbffdoGcvgOluktAOa9LHA" icon={Twitter} color="from-slate-700 to-black" />
              <SocialButton label="TikTok" href="https://www.tiktok.com/@samco_designer?_t=ZS-90FZRdOXUiG&_r=1" icon={Music2} color="from-black via-red-500 to-teal-400" />
              <SocialButton label="Instagram" href="https://www.instagram.com/samco_design?igsh=MXhiN2RjbG1ydHducg%3D%3D&utm_source=qr" icon={Instagram} color="from-purple-600 via-pink-600 to-yellow-500" />
              <SocialButton label="YouTube" href="https://www.youtube.com/@samco-desing" icon={Youtube} color="from-red-600 to-red-800" />
           </div>
        </div>
      </div>
    );
  };

  // 2. Kanban View
  const KanbanView = () => {
    const columns = [
      { id: 'new', title: 'طلب جديد', color: 'border-blue-500' },
      { id: 'in-progress', title: 'جاري العمل', color: 'border-yellow-500' },
      { id: 'review', title: 'مراجعة', color: 'border-purple-500' },
      { id: 'done', title: 'مكتمل', color: 'border-green-500' },
    ];

    return (
      <div className="h-full flex flex-col animate-fade-in">
        <h2 className="text-3xl font-bold mb-6">لوحة المهام (Kanban)</h2>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[800px] h-full">
            {columns.map(col => (
              <div 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 min-w-[250px] p-4 rounded-xl border-t-4 ${col.color} ${currentTheme === 'minimal' ? 'bg-slate-100' : 'bg-white/5'}`}
              >
                <h3 className="font-bold mb-4 flex justify-between items-center">
                  {col.title}
                  <span className="bg-black/20 px-2 py-0.5 rounded text-sm">
                    {clients.filter(c => c.status === col.id).length}
                  </span>
                </h3>
                
                <div className="space-y-3">
                  {clients.filter(c => c.status === col.id).map(client => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      className={`p-4 rounded-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200 border group ${getCardStyle()}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{client.name}</h4>
                        <div className="flex gap-1">
                          {/* AI Magic Button */}
                          <button 
                             onClick={() => handleAiPlanGenerate(client.project)}
                             className="p-1 rounded-full hover:bg-yellow-500/20 text-yellow-500 transition-colors"
                             title="أنشئ خطة عمل بالذكاء الاصطناعي"
                          >
                            <Wand2 size={16} />
                          </button>
                          <MoreVertical size={16} className="opacity-50" />
                        </div>
                      </div>
                      <p className="text-sm opacity-70 mb-2">{client.project}</p>
                      <div className="flex justify-between items-center text-xs opacity-60">
                        <span>{client.budget} ريال</span>
                        <span>#{client.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 3. Templates View (With AI Feature)
  const TemplatesView = () => (
    <div className="animate-fade-in pb-20">
      <h2 className="text-3xl font-bold mb-6">قوالب ومولد الرسائل</h2>
      
      {/* AI Generator Section */}
      <div className={`mb-8 p-6 rounded-2xl border relative overflow-hidden ${getCardStyle()}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Sparkles className="text-purple-400 fill-purple-400 animate-pulse" /> 
          مولد رسائل ذكي
        </h3>
        
        <div className="flex flex-col gap-4">
          <textarea
             value={aiPrompt}
             onChange={(e) => setAiPrompt(e.target.value)}
             placeholder="عن ماذا تريد أن تكتب؟ (مثلاً: اعتذار عن التأخير، طلب دفعة مقدمة، شكر للعميل...)"
             className={`w-full p-4 rounded-xl outline-none resize-none h-24 transition-colors ${currentTheme === 'minimal' ? 'bg-slate-100 focus:bg-white border-slate-200 border' : 'bg-black/20 focus:bg-black/40 border-white/10 border'}`}
          />
          <button 
             onClick={handleAiMessageGenerate}
             disabled={isAiLoading || !aiPrompt.trim()}
             className="self-end px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAiLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
            توليد الرسالة
          </button>
        </div>

        {/* AI Result */}
        {aiResponse && (
          <div className="mt-6 animate-fade-in">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm opacity-60 font-bold">الرد المقترح:</span>
               <button onClick={() => copyToClipboard(aiResponse)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                 <Copy size={14} /> نسخ
               </button>
             </div>
             <div className={`p-4 rounded-xl border ${currentTheme === 'minimal' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'} whitespace-pre-wrap leading-relaxed`}>
               {aiResponse}
             </div>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-4 opacity-80">قوالب جاهزة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 group ${getCardStyle()}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                {tpl.title}
              </h3>
              <button 
                onClick={() => copyToClipboard(tpl.text)}
                className="p-2 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
            <div className={`p-4 rounded-xl ${currentTheme === 'minimal' ? 'bg-slate-50' : 'bg-black/20'} font-mono text-sm leading-relaxed mb-4 min-h-[80px]`}>
              {tpl.text}
            </div>
            <button 
               onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(tpl.text)}`, '_blank')}
               className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              إرسال عبر واتساب <MoveRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. Clients View (Simple List)
  const ClientsView = () => (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">العملاء</h2>
        <button 
          onClick={() => {
            const newName = prompt("اسم العميل الجديد:");
            if(newName) {
              setClients([...clients, { id: Date.now(), name: newName, project: 'مشروع جديد', status: 'new', budget: '0', phone: '' }]);
              showNotification("تمت إضافة العميل");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> إضافة عميل
        </button>
      </div>

      <div className={`overflow-hidden rounded-xl border ${getCardStyle()}`}>
        <table className="w-full text-right">
          <thead className={currentTheme === 'minimal' ? 'bg-slate-100' : 'bg-white/5'}>
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">المشروع</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold">{client.name}</td>
                <td className="p-4">{client.project}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold 
                    ${client.status === 'done' ? 'bg-green-500/20 text-green-500' : 
                      client.status === 'new' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {client.status === 'done' ? 'مكتمل' : client.status === 'new' ? 'جديد' : 'جاري العمل'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => {
                       setClients(clients.filter(c => c.id !== client.id));
                       showNotification("تم حذف العميل");
                    }}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 5. Settings View (Theme Switcher)
  const SettingsView = () => (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">الإعدادات والمظهر</h2>
      
      <div className={`p-6 rounded-2xl border mb-6 ${getCardStyle()}`}>
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Palette className="text-pink-500" />
          اختر الثيم (المظهر)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setCurrentTheme('cyber')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
              ${currentTheme === 'cyber' ? 'border-blue-500 bg-slate-800' : 'border-transparent bg-slate-800 opacity-50'}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-600"></div>
            <span className="font-bold text-white">سايبر (داكن)</span>
          </button>

          <button 
            onClick={() => setCurrentTheme('minimal')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
              ${currentTheme === 'minimal' ? 'border-blue-500 bg-white' : 'border-transparent bg-white opacity-50'}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300"></div>
            <span className="font-bold text-slate-800">مينيمال (فاتح)</span>
          </button>

          <button 
            onClick={() => setCurrentTheme('sunset')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
              ${currentTheme === 'sunset' ? 'border-yellow-300 bg-gradient-to-r from-orange-500 to-purple-600' : 'border-transparent bg-gradient-to-r from-orange-500 to-purple-600 opacity-50'}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40"></div>
            <span className="font-bold text-white">غروب (ملون)</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 6. About View (NEW)
  const AboutView = () => (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-10">
      {/* Hero Section */}
      <div className={`p-8 rounded-3xl border text-center relative overflow-hidden ${getCardStyle()}`}>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-6 rotate-3 hover:rotate-6 transition-transform">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Samco Mini-CRM</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
            ليس مجرد أداة إدارة، بل هو مساحتك الخاصة لترتيب الفوضى وإطلاق العنان للإبداع.
            صُمم خصيصاً للمصممين، المطورين، وصناع المحتوى.
          </p>
        </div>
        {/* Decorative BG Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why this App */}
        <div className={`p-6 rounded-2xl border ${getCardStyle()}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" /> لماذا هذا التطبيق؟
          </h3>
          <p className="opacity-70 leading-relaxed text-sm md:text-base">
            في عالم الإبداع، الوقت هو العملة الأغلى. جاءت فكرة "إدارة عملاء سريعة" لتلغي تعقيدات الأنظمة الضخمة. 
            هنا لا توجد قوائم لا تنتهي؛ فقط ما تحتاجه: عملاؤك، حالة مشاريعك، ورسائل جاهزة لعملائك بضغطة زر.
          </p>
        </div>

        {/* For Creatives */}
        <div className={`p-6 rounded-2xl border ${getCardStyle()}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="text-red-500" /> مجتمع المبدعين
          </h3>
          <p className="opacity-70 leading-relaxed text-sm md:text-base">
            نحن نؤمن بأن التنظيم هو أساس الحرية الإبداعية. عندما لا تقلق بشأن "من دفع؟" أو "ماذا أرسل للعميل؟"، 
            يصبح عقلك حراً للابتكار. هذا التطبيق هو هدية بسيطة لكل مبدع يسعى للاحترافية.
          </p>
        </div>
      </div>

      {/* About Samco Section */}
      <div className={`p-8 rounded-2xl border ${getCardStyle()} flex flex-col md:flex-row items-center gap-8`}>
         <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-1 flex-shrink-0 shadow-xl overflow-hidden">
           {/* IMAGE UPDATE: Using local file with fallback */}
           <img 
             src="/samco-profile.jpg" 
             onError={(e) => e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Samco"}
             alt="Samco" 
             className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
           />
         </div>
         <div className="text-center md:text-right flex-1">
           <h3 className="text-2xl font-bold mb-2">عن سامكو (Samco Design)</h3>
           <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-pink-400 mb-4">
             مبرمج مطور مواقع | مصمم مبدع | كاتب قصص
           </h4>
           <p className="opacity-70 mb-6 leading-relaxed">
             مصمم ومطور شغوف بدمج الجمال مع الوظيفة. بصفتي كاتب قصص أيضاً، أرى في كل مشروع "حكاية" يجب أن تُروى بأجمل صورة.
             أسعى دائماً لتقديم أدوات وحلول رقمية ترتقي بتجربة المستخدم العربي. هذا المشروع هو جزء من رؤية أكبر لدعم المجتمع الإبداعي.
           </p>
           <div className="flex justify-center md:justify-start gap-3 flex-wrap">
             <a href="https://x.com/designer_samco?s=21&t=dbffdoGcvgOluktAOa9LHA" target="_blank" className="px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-black text-white border border-white/10 transition-colors font-bold text-sm flex items-center gap-2">
                <Twitter size={16} /> منصة X
             </a>
             <a href="https://www.tiktok.com/@samco_designer?_t=ZS-90FZRdOXUiG&_r=1" target="_blank" className="px-4 py-2 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2">
                <Music2 size={16} /> تيك توك
             </a>
             <a href="https://www.instagram.com/samco_design?igsh=MXhiN2RjbG1ydHducg%3D%3D&utm_source=qr" target="_blank" className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-colors font-bold text-sm flex items-center gap-2">
                <Instagram size={16} /> انستقرام
             </a>
           </div>
         </div>
      </div>
    </div>
  );

  // Background Animation Component
  const AnimatedBackground = () => {
    if (currentTheme === 'minimal') return null;
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-float-delayed"></div>
        {currentTheme === 'sunset' && (
           <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-yellow-500/20 rounded-full blur-[80px] animate-pulse-slow"></div>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl" className={`min-h-screen font-sans transition-colors duration-500 ${getThemeStyles()} relative overflow-x-hidden selection:bg-pink-500 selection:text-white`}>
      <AnimatedBackground />
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      
      {/* AI Modal for Kanban */}
      <AIPlanModal 
         isOpen={kanbanAiModal.open} 
         loading={kanbanAiModal.loading}
         content={kanbanAiModal.content} 
         onClose={() => setKanbanAiModal({...kanbanAiModal, open: false})}
         themeStyle={getCardStyle()}
      />

      {/* Mobile Navbar Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Samco CRM</h1>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2">
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-0 right-0 h-screen w-64 border-l border-white/10 backdrop-blur-xl z-30 transition-transform duration-300
          ${showMobileMenu ? 'translate-x-0 bg-black/90' : 'translate-x-full md:translate-x-0'}
          ${currentTheme === 'minimal' ? 'bg-white/80 border-slate-200' : 'bg-black/20'}
        `}>
          <div className="p-6">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center shadow-lg">
                 <span className="text-white font-bold text-xl">S</span>
               </div>
               <div>
                 <h1 className="font-bold text-lg leading-none">Samco</h1>
                 <span className="text-xs opacity-60">Mini-CRM</span>
               </div>
             </div>

             <nav className="space-y-2">
               {[
                 { id: 'dashboard', label: 'اللوحة الرئيسية', icon: LayoutDashboard },
                 { id: 'clients', label: 'العملاء', icon: Users },
                 { id: 'kanban', label: 'كانبان (Kanban)', icon: KanbanSquare },
                 { id: 'templates', label: 'قوالب الرسائل', icon: MessageSquare },
                 { id: 'settings', label: 'الإعدادات', icon: Settings },
                 { id: 'about', label: 'عن التطبيق', icon: Info },
               ].map(item => (
                 <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setShowMobileMenu(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                     ${activeTab === item.id 
                       ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                       : 'hover:bg-white/10 opacity-70 hover:opacity-100'}
                   `}
                 >
                   <item.icon size={20} />
                   <span>{item.label}</span>
                 </button>
               ))}
             </nav>
          </div>

          <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-pink-400 transition-colors w-full justify-center"
            >
              <Home size={16} />
              <span>العودة للرئيسية</span>
            </button>
            <p className="text-center text-xs opacity-30 mt-4">© 2026 Samco Design</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-hidden">
          {/* Top Bar (Desktop) */}
          <header className="hidden md:flex justify-between items-center mb-8">
             <div>
               <h2 className="text-2xl font-bold">مرحباً بك، المصمم المبدع 👋</h2>
               <p className="opacity-60 text-sm">إليك ملخص سريع لأعمالك اليوم</p>
             </div>
             <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${currentTheme === 'minimal' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <Search size={16} className="opacity-50" />
                  <input placeholder="بحث سريع..." className="bg-transparent border-none outline-none text-sm w-32 md:w-48 placeholder:opacity-50" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samco" alt="Profile" className="w-full h-full rounded-full bg-black" />
                </div>
             </div>
          </header>

          {/* Dynamic Page Content */}
          <div className="min-h-[80vh]">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'clients' && <ClientsView />}
            {activeTab === 'kanban' && <KanbanView />}
            {activeTab === 'templates' && <TemplatesView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'about' && <AboutView />}
          </div>

          {/* Global Footer / Socials (Visible on bottom of long pages) */}
          {activeTab !== 'dashboard' && activeTab !== 'about' && (
             <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="mb-4 opacity-60 font-medium">تابع سامكو للمزيد من الأدوات</p>
                <div className="flex justify-center gap-4 flex-wrap">
                   <a href="https://x.com/designer_samco?s=21&t=dbffdoGcvgOluktAOa9LHA" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-black hover:text-white transition-all"><Twitter size={20} /></a>
                   <a href="https://www.tiktok.com/@samco_designer?_t=ZS-90FZRdOXUiG&_r=1" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-black hover:text-pink-500 transition-all"><Music2 size={20} /></a>
                   <a href="https://www.instagram.com/samco_design?igsh=MXhiN2RjbG1ydHducg%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-purple-600 hover:text-white transition-all"><Instagram size={20} /></a>
                   <a href="https://www.youtube.com/@samco-desing" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-red-600 hover:text-white transition-all"><Youtube size={20} /></a>
                </div>
             </div>
          )}
        </main>
      </div>

      {/* Animations Styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 40px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
        .animate-float-slow { animation: float-slow 8s infinite ease-in-out; }
        .animate-float-delayed { animation: float-delayed 10s infinite ease-in-out; }
        .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes bounceIn {
          0% { transform: translate(-50%, 100%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
