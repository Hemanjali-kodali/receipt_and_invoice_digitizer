import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, DollarSign, Target, 
  TrendingUp, Plus, Bell, MoreVertical, 
  CheckCircle2, Clock 
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [latestData, setLatestData] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setProcessing(true);
      const res = await axios.post(`${API_URL}/invoice/upload`, formData);
      
      setLatestData({
        vendor: res.data.extracted_text.vendor_name,
        total: res.data.extracted_text.total_amount,
        invoice_number: res.data.extracted_text.invoice_number,
        date: res.data.extracted_text.date,
      });

      setFiles(prev => [{ id: res.data.invoice_id, filename: res.data.filename, status: 'Processed' }, ...prev]);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* 1. Integrated Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FileText size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">DigiDoc</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Bell size={20} /></button>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">Ankit Sharma</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-1">Pro Plan</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Ankit+Sharma&background=6366f1&color=fff" alt="avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {/* 2. Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Receipt & Invoice Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your business expenses with AI-powered extraction.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <TrendingUp size={18} /> Export
            </button>
            <label className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer">
              <Plus size={18} /> New Upload
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </header>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Processed" value={files.length} icon={<FileText size={20}/>} trend="+12%" color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Total Value" value="$12,450.00" icon={<DollarSign size={20}/>} trend="+8.4%" color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Accuracy Rate" value="99.8%" icon={<Target size={20}/>} trend="Stable" color="text-purple-600" bg="bg-purple-50" />
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Upload Area */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-white p-2 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
            >
              <label className="border-2 border-dashed border-slate-200 rounded-[22px] p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all block relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Drop your invoices here</h3>
                  <p className="text-slate-400 mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleUpload} />
                {processing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 font-bold text-indigo-600 tracking-wide">AI is extracting data...</p>
                    </div>
                  </div>
                )}
              </label>
            </motion.div>

            {/* Recent Extractions Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold">Recent Extractions</h2>
                <button className="text-indigo-600 font-bold text-sm hover:underline">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.1em] font-black">
                    <tr>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400"><FileText size={16}/></div>
                            <span className="font-semibold text-slate-700">{file.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={12} /> Processed
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">$245.00</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"><MoreVertical size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: AI Extraction Details */}
          <aside className="col-span-12 lg:col-span-4">
            <AnimatePresence mode="wait">
              {latestData ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 p-6 sticky top-28"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Extraction Result</h2>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">AI Confidence 98%</span>
                  </div>

                  {/* Mock Image Preview */}
                  <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-6 overflow-hidden border border-slate-200 relative group cursor-zoom-in">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=500" 
                      alt="Receipt" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                  </div>

                  <div className="space-y-5">
                    <DetailItem label="Vendor Name" value={latestData.vendor} />
                    <DetailItem label="Invoice Number" value={latestData.invoice_number} />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label="Date" value={latestData.date} />
                      <DetailItem label="Category" value="Infrastructure" />
                    </div>
                    
                    <div className="mt-6 p-5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={60}/></div>
                      <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Total Amount</p>
                      <p className="text-4xl font-black mt-1">${latestData.total}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <button className="py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">Approve</button>
                    <button className="py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">Edit Data</button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center sticky top-28">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Clock size={32}/></div>
                  <p className="font-bold text-slate-500">No Recent Extraction</p>
                  <p className="text-sm mt-1">Upload an invoice to see the AI magic happen here.</p>
                </div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components for Clean Code ---

function StatCard({ title, value, icon, trend, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 flex justify-between items-start">
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        <p className="text-xs font-bold mt-2 flex items-center gap-1">
          <span className="text-emerald-500">{trend}</span>
          <span className="text-slate-300 font-medium tracking-tight">vs last month</span>
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-800 font-bold text-lg leading-tight">{value || "---"}</p>
    </div>
  );
}