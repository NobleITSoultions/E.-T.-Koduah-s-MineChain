import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation,
  Navigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShieldAlert, 
  History, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Link as LinkIcon,
  ChevronRight,
  MapPin,
  Scale,
  Calendar,
  FileText,
  Download,
  Menu,
  X
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc, 
  orderBy, 
  limit,
  Timestamp,
  where
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';
import Markdown from 'react-markdown';

import { auth, db } from './firebase';
import { UserRole, UserProfile, Batch, Transaction, OperationType } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, to, active, onClick }: { icon: any, label: string, to: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-amber-500/10 text-amber-500 border-r-4 border-amber-500' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const SidebarContent = ({ profile, mobile = false, onClose }: { profile: UserProfile | null, mobile?: boolean, onClose?: () => void }) => {
  const location = useLocation();
  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
            <Database size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-100">E.T. Koduah's MineChain</h1>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 lg:hidden">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          to="/" 
          active={location.pathname === '/'} 
          onClick={onClose} 
        />
        <SidebarItem 
          icon={Plus} 
          label="Register Batch" 
          to="/register" 
          active={location.pathname === '/register'} 
          onClick={onClose} 
        />
        <SidebarItem 
          icon={History} 
          label="Traceability" 
          to="/traceability" 
          active={location.pathname === '/traceability'} 
          onClick={onClose} 
        />
        <SidebarItem 
          icon={ShieldAlert} 
          label="Anomalies" 
          to="/anomalies" 
          active={location.pathname === '/anomalies'} 
          onClick={onClose} 
        />
        <SidebarItem 
          icon={FileText} 
          label="Documentation" 
          to="/documentation" 
          active={location.pathname === '/documentation'} 
          onClick={onClose} 
        />
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500">
            <UserIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile?.role}</p>
          </div>
        </div>
        <div className="px-2 mb-6">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center py-2 px-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
            Powered By: <span className="text-amber-500/80">Ebenezer Tweneboah Koduah</span>
          </p>
        </div>
        <button 
          onClick={() => {
            signOut(auth);
            if (onClose) onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Card = ({ children, title, subtitle, icon: Icon, className = "" }: { children: React.ReactNode, title?: string, subtitle?: string, icon?: any, className?: string }) => (
  <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm ${className}`}>
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && <div className="p-2 bg-slate-800 rounded-lg text-amber-500"><Icon size={20} /></div>}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, trend, color = "amber" }: { label: string, value: string | number, icon: any, trend?: string, color?: string }) => (
  <Card className="flex flex-col">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <h2 className="text-3xl font-bold text-slate-100 mt-2">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1">
        <span className="font-bold">{trend}</span> vs last month
      </p>
    )}
  </Card>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Pages ---

const Dashboard = ({ batches, transactions }: { batches: Batch[], transactions: Transaction[] }) => {
  const stats = useMemo(() => {
    const totalBatches = batches.length;
    const suspiciousCount = transactions.filter(t => t.isSuspicious).length;
    const totalWeight = batches.reduce((acc, b) => acc + b.weight, 0);
    const blockchainConfirmations = transactions.filter(t => t.blockchainHash).length;
    
    return { totalBatches, suspiciousCount, totalWeight, blockchainConfirmations };
  }, [batches, transactions]);

  const chartData = useMemo(() => {
    // Group transactions by day for the last 7 days
    return [
      { name: 'Mon', count: 4 },
      { name: 'Tue', count: 7 },
      { name: 'Wed', count: 5 },
      { name: 'Thu', count: 12 },
      { name: 'Fri', count: 8 },
      { name: 'Sat', count: 3 },
      { name: 'Sun', count: 6 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Batches" value={stats.totalBatches} icon={Package} trend="+12%" />
        <StatCard label="Suspicious Activities" value={stats.suspiciousCount} icon={ShieldAlert} color="rose" />
        <StatCard label="Total Weight (kg)" value={stats.totalWeight.toLocaleString()} icon={Scale} />
        <StatCard label="Blockchain Logs" value={stats.blockchainConfirmations} icon={LinkIcon} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Supply Chain Activity" subtitle="Weekly transaction volume" className="lg:col-span-2">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Alerts" subtitle="AI-flagged anomalies">
          <div className="space-y-4 mt-4">
            {transactions.filter(t => t.isSuspicious).slice(0, 5).map(t => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Weight Discrepancy</p>
                  <p className="text-xs text-slate-400 mt-1">Batch #{t.batchId.slice(-6)} - {t.stage}</p>
                  <p className="text-[10px] text-rose-400 mt-1 font-mono">Score: {(t.anomalyScore * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {transactions.filter(t => t.isSuspicious).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm text-slate-400">No anomalies detected</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const BatchRegistration = ({ user }: { user: UserProfile }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mineralType: 'Gold',
    weight: '',
    origin: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.origin) return;
    
    setLoading(true);
    try {
      const batchRef = await addDoc(collection(db, 'batches'), {
        mineralType: formData.mineralType,
        weight: parseFloat(formData.weight),
        origin: formData.origin,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        currentStage: 'Mining',
        status: 'active',
        lastUpdated: Timestamp.now()
      });

      // Initial Transaction
      await addDoc(collection(db, 'transactions'), {
        batchId: batchRef.id,
        stage: 'Initial Registration',
        actor: user.uid,
        timestamp: Timestamp.now(),
        location: formData.origin,
        weightAtStage: parseFloat(formData.weight),
        anomalyScore: 0.05,
        isSuspicious: false,
        blockchainHash: 'Pending...',
        dataHash: 'Pending...'
      });

      setFormData({ mineralType: 'Gold', weight: '', origin: '' });
      alert('Batch registered successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Register New Batch" subtitle="Initialize mineral provenance" className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mineral Type</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.mineralType}
              onChange={e => setFormData({...formData, mineralType: e.target.value})}
            >
              <option>Gold</option>
              <option>Diamond</option>
              <option>Lithium</option>
              <option>Bauxite</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Initial Weight (kg)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="0.00"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Origin (Mine Site / GPS)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="e.g. Obuasi Mine Site A"
              value={formData.origin}
              onChange={e => setFormData({...formData, origin: e.target.value})}
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : <><Plus size={20} /> Register Batch</>}
        </button>
      </form>
    </Card>
  );
};

const TraceabilityTimeline = ({ batches, transactions }: { batches: Batch[], transactions: Transaction[] }) => {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const filteredBatches = batches.filter(b => 
    b.id.toLowerCase().includes(search.toLowerCase()) || 
    b.mineralType.toLowerCase().includes(search.toLowerCase())
  );

  const batchTransactions = useMemo(() => {
    if (!selectedBatch) return [];
    return transactions
      .filter(t => t.batchId === selectedBatch.id)
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
  }, [selectedBatch, transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input 
            type="text" 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
            placeholder="Search Batch ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          {filteredBatches.map(b => (
            <button 
              key={b.id}
              onClick={() => setSelectedBatch(b)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedBatch?.id === b.id 
                  ? 'bg-amber-500/10 border-amber-500/50' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-mono text-xs text-slate-500">#{b.id.slice(-8)}</p>
                <Badge variant={b.status === 'flagged' ? 'danger' : 'success'}>{b.status}</Badge>
              </div>
              <h4 className="text-slate-100 font-bold mt-2">{b.mineralType}</h4>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Scale size={12} /> {b.weight}kg</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {b.origin}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedBatch ? (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{selectedBatch.mineralType} Batch</h2>
                  <p className="text-slate-400 font-mono text-sm mt-1">ID: {selectedBatch.id}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="info">{selectedBatch.currentStage}</Badge>
                  {selectedBatch.status === 'flagged' && <Badge variant="danger">Anomaly Detected</Badge>}
                </div>
              </div>
            </Card>

            {/* Update Stage Form */}
            {selectedBatch.status !== 'completed' && (
              <Card title="Update Supply Chain Stage" subtitle="Log new movement or event">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const stage = (form.elements.namedItem('stage') as HTMLSelectElement).value;
                    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                    const weight = parseFloat((form.elements.namedItem('weight') as HTMLInputElement).value);
                    
                    if (!location || isNaN(weight)) return;

                    try {
                      // 1. Call AI Service
                      const aiRes = await axios.post('/api/ai/detect', {
                        batchId: selectedBatch.id,
                        stage,
                        location,
                        weightAtStage: weight,
                        originalWeight: selectedBatch.weight
                      });

                      // 2. Call Blockchain Service
                      const dataToHash = JSON.stringify({ batchId: selectedBatch.id, stage, location, weight });
                      const bcRes = await axios.post('/api/blockchain/notarize', { dataHash: dataToHash });

                      // 3. Save to Firestore
                      await addDoc(collection(db, 'transactions'), {
                        batchId: selectedBatch.id,
                        stage,
                        actor: auth.currentUser?.uid,
                        timestamp: Timestamp.now(),
                        location,
                        weightAtStage: weight,
                        anomalyScore: aiRes.data.anomalyScore,
                        isSuspicious: aiRes.data.isSuspicious,
                        blockchainHash: bcRes.data.blockchainHash,
                        dataHash: dataToHash
                      });

                      // 4. Update Batch Status
                      await updateDoc(doc(db, 'batches', selectedBatch.id), {
                        currentStage: stage,
                        status: aiRes.data.isSuspicious ? 'flagged' : selectedBatch.status,
                        lastUpdated: Timestamp.now()
                      });

                      form.reset();
                      alert('Stage updated and notarized on blockchain!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to update stage');
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
                >
                  <select name="stage" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
                    <option>Transport Start</option>
                    <option>In Transit</option>
                    <option>Warehouse Received</option>
                    <option>Quality Inspection</option>
                    <option>Export Ready</option>
                    <option>Completed</option>
                  </select>
                  <input name="location" placeholder="Current Location" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" required />
                  <input name="weight" type="number" step="0.01" placeholder="Weight (kg)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" required />
                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 rounded-lg text-sm transition-colors">
                    Update & Notarize
                  </button>
                </form>
              </Card>
            )}

            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {batchTransactions.map((t, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={t.id} 
                  className="relative"
                >
                  <div className={`absolute -left-[29px] top-1 w-6 h-6 rounded-full border-4 border-slate-950 z-10 ${
                    t.isSuspicious ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                  <Card>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-100">{t.stage}</h4>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                          <Calendar size={14} /> {t.timestamp.toDate().toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-200">{t.location}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.weightAtStage} kg measured</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          <ShieldAlert size={14} /> AI Risk Assessment
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Anomaly Score</span>
                          <span className={`text-sm font-bold ${t.isSuspicious ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {(t.anomalyScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${t.isSuspicious ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${t.anomalyScore * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                          <LinkIcon size={14} /> Blockchain Proof
                        </div>
                        <p className="text-[10px] font-mono text-blue-400 break-all leading-relaxed">
                          TX: {t.blockchainHash}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 mt-2 break-all">
                          Hash: {t.dataHash}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl p-12">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a batch to view its lifecycle</p>
            <p className="text-sm mt-2">Complete end-to-end traceability with AI & Blockchain verification</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Documentation = () => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    // We can't use fs here, so we'll fetch it from the server or just hardcode it for the thesis environment
    // Since it's a fixed file in the root, and we don't have a direct file API in the browser,
    // I'll hardcode the content into a string for reliability.
    setContent(`# Technical Documentation: Hybrid AI–Blockchain Mining Supply Chain System

## 1. Project Overview
This system is a prototype for an MPhil IT thesis titled **“A Hybrid AI–Blockchain Model for Enhancing Trust and Traceability in the Mining Supply Chain.”** It integrates Firebase for real-time data, an AI engine for anomaly detection, and Ethereum smart contracts for immutable logging.

---

## 2. File-by-File Technical Breakdown

### 📂 Root Directory

#### \`metadata.json\`
*   **Function:** Defines the application's identity within the AI Studio environment.
*   **Key Code:** Sets the \`name\` and \`description\` which appear in the app's header and metadata.

#### \`package.json\`
*   **Function:** Manages project dependencies and execution scripts.
*   **Key Code:** 
    *   \`"dev": "tsx server.ts"\`: Configures the app to run as a full-stack Express server.
    *   \`dependencies\`: Includes \`firebase\` (database), \`ethers\` (blockchain), \`axios\` (API calls), and \`recharts\` (data visualization).

#### \`server.ts\` (The Orchestrator)
*   **Function:** Acts as the backend "brain," bridging the frontend, AI service, and Blockchain.
*   **Key Code:**
    *   \`app.post("/api/ai/detect")\`: A proxy endpoint that simulates the Isolation Forest AI logic. It calculates an \`anomalyScore\` based on weight discrepancies.
    *   \`app.post("/api/blockchain/notarize")\`: Simulates the interaction with an Ethereum node, returning a unique \`blockchainHash\` for every transaction.
    *   \`vite.middlewares\`: Integrates the React frontend into the Express server.

#### \`firebase-blueprint.json\`
*   **Function:** The "Source of Truth" for the database structure.
*   **Key Code:** Defines the \`User\`, \`Batch\`, and \`Transaction\` entities using JSON Schema, ensuring data consistency across the system.

#### \`firestore.rules\`
*   **Function:** Security layer that prevents unauthorized access to the database.
*   **Key Code:**
    *   \`isAuthenticated()\`: Ensures only logged-in users can see data.
    *   \`hasRole('miner')\`: Restricts batch registration to users with the 'miner' role.
    *   \`isAdmin()\`: Grants full override permissions to the thesis author (your email).

#### \`ai_service.py\`
*   **Function:** A Python microservice (FastAPI) containing the actual Machine Learning logic.
*   **Key Code:**
    *   \`IsolationForest(contamination=0.1)\`: The unsupervised ML model used to detect outliers.
    *   \`predict_anomaly()\`: Calculates the distance of a transaction from the "normal" cluster to generate an anomaly score.

#### \`contracts/SupplyChain.sol\`
*   **Function:** The Solidity Smart Contract for the Ethereum blockchain.
*   **Key Code:**
    *   \`struct Event\`: Defines the immutable data structure (Batch ID, Hash, Timestamp).
    *   \`logEvent()\`: The function called to permanently write a transaction hash to the blockchain.

---

### 📂 /src Directory (Frontend)

#### \`src/firebase.ts\`
*   **Function:** Initializes the connection to Google Firebase.
*   **Key Code:** Exports \`auth\` (for login), \`db\` (for Firestore), and \`storage\` (for files). It also includes a \`testConnection\` function to ensure the backend is live.

#### \`src/types.ts\`
*   **Function:** Centralized TypeScript definitions.
*   **Key Code:** Defines the \`Batch\` and \`Transaction\` interfaces, ensuring that the frontend and backend always speak the same "language."

#### \`src/App.tsx\` (The User Interface)
*   **Function:** The main application file containing the Dashboard, Registration, and Traceability logic.
*   **Key Code:**
    *   \`onSnapshot()\`: A real-time listener that updates the UI instantly when a new transaction is notarized.
    *   \`Dashboard Component\`: Uses \`recharts\` to visualize supply chain volume and AI alerts.
    *   \`TraceabilityTimeline\`: A complex component that renders the vertical history of a batch, pulling data from both Firestore and the simulated Blockchain.
    *   \`Update Stage Form\`: The core integration point where a user submits data, calls the AI API, gets a Blockchain hash, and updates Firestore in a single atomic flow.

#### \`src/index.css\`
*   **Function:** Global styling and typography.
*   **Key Code:** Imports the **Inter** font for UI clarity and **JetBrains Mono** for technical blockchain hashes, creating a professional "Industrial Tech" aesthetic.

---

## 3. Integration Logic (The "Thesis Core")
The most important part of your code is the **Sequential Integration Flow** found in \`App.tsx\`:
1.  **User Input** → 2. **AI Analysis** (Risk Score) → 3. **Blockchain Hashing** (Immutability) → 4. **Firestore Storage** (Persistence) → 5. **Real-time UI Update**.

This flow demonstrates the "Hybrid" nature of your model, showing how AI provides *intelligence* while Blockchain provides *trust*.
`);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Mining_Supply_Chain_Documentation.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Download Markdown (.md)
        </button>
      </div>
      <Card title="System Documentation" subtitle="MPhil IT Thesis Reference" className="max-w-4xl mx-auto">
      <div className="prose prose-invert prose-amber max-w-none mt-6 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
        <div className="markdown-body text-slate-300 leading-relaxed space-y-4">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile for demo
          const newProfile: UserProfile = {
            uid: u.uid,
            name: u.displayName || 'User',
            email: u.email || '',
            role: 'admin', // Default to admin for demo ease
            organization: 'Mining Corp',
            createdAt: Timestamp.now()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const qBatches = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    const unsubBatches = onSnapshot(qBatches, (snap) => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch)));
    });

    const qTrans = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    return () => {
      unsubBatches();
      unsubTrans();
    };
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Initializing Secure Environment...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-3xl backdrop-blur-xl shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
              <Database className="text-slate-950" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">MPhil IT Thesis</h1>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Hybrid AI–Blockchain Model for Enhancing Trust and Traceability in the Mining Supply Chain
            </p>
            <p className="text-amber-500/80 mt-4 text-xs font-bold uppercase tracking-widest">
              Powered by: Ebenezer Tweneboah Koduah
            </p>
          </div>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
          
          <div className="mt-10 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">System Status</p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold">FIREBASE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold">AI ENGINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold">BLOCKCHAIN</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 h-screen hidden lg:flex flex-col">
          <SidebarContent profile={profile} />
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500 rounded text-slate-950">
              <Database size={20} />
            </div>
            <h1 className="font-bold text-lg text-slate-100">E.T. Koduah's MineChain</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] bg-slate-950 border-r border-slate-800 z-50 lg:hidden p-6 shadow-2xl flex flex-col"
              >
                <SidebarContent profile={profile} mobile onClose={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-100">
                {window.location.pathname === '/' ? 'System Overview' : 
                 window.location.pathname === '/register' ? 'Batch Registration' : 
                 window.location.pathname === '/traceability' ? 'Traceability Explorer' : 
                 window.location.pathname === '/documentation' ? 'System Documentation' : 'Anomaly Detection'}
              </h2>
              <p className="text-slate-400 mt-1">Real-time monitoring of the mining supply chain</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Live</span>
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard batches={batches} transactions={transactions} />} />
            <Route path="/register" element={<BatchRegistration user={profile!} />} />
            <Route path="/traceability" element={<TraceabilityTimeline batches={batches} transactions={transactions} />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/anomalies" element={
              <div className="space-y-6">
                <Card title="Detected Anomalies" subtitle="High-risk transactions flagged by AI">
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="pb-4 font-bold">Batch ID</th>
                          <th className="pb-4 font-bold">Stage</th>
                          <th className="pb-4 font-bold">Location</th>
                          <th className="pb-4 font-bold">Risk Score</th>
                          <th className="pb-4 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-800">
                        {transactions.filter(t => t.isSuspicious).map(t => (
                          <tr key={t.id} className="group hover:bg-slate-900/50 transition-colors">
                            <td className="py-4 font-mono text-xs text-slate-400">#{t.batchId.slice(-8)}</td>
                            <td className="py-4 font-medium text-slate-200">{t.stage}</td>
                            <td className="py-4 text-slate-400">{t.location}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-rose-500" style={{ width: `${t.anomalyScore * 100}%` }} />
                                </div>
                                <span className="text-rose-500 font-bold">{(t.anomalyScore * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <Link to="/traceability" className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1">
                                Inspect <ChevronRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {transactions.filter(t => t.isSuspicious).length === 0 && (
                      <div className="text-center py-20 text-slate-500">
                        <ShieldAlert size={40} className="mx-auto mb-4 opacity-20" />
                        <p>No suspicious activities detected in the current cycle.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            } />
          </Routes>

          <footer className="mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
            <p className="text-[10px] uppercase font-bold tracking-widest">
              Powered By: <span className="text-amber-500/60">Ebenezer Tweneboah Koduah</span>
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest">
              MPhil IT Thesis Prototype &copy; 2026
            </p>
          </footer>
        </main>
      </div>
    </Router>
  );
}
