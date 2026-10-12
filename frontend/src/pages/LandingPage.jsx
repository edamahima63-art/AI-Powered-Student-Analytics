import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, BarChart3, Brain, Users, Shield,
  BookOpen, FileText, ChevronRight, CheckCircle2, ArrowRight,
  Sparkles, Target, Menu, X, ChevronDown, Eye,
  Lightbulb, UserCheck, Building2, Lock
} from 'lucide-react'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Academic Analytics',
    desc: 'Visualize performance trends, subject comparisons, and semester-wise progress with beautiful, interactive charts.',
    color: 'bg-royal-50 text-royal-600',
  },
  {
    icon: Brain,
    title: 'AI Early-Warning System',
    desc: 'Machine-learning models identify students who may benefit from additional support before problems escalate.',
    color: 'bg-lavender-50 text-lavender-600',
  },
  {
    icon: Lightbulb,
    title: 'Personalized Recommendations',
    desc: 'Data-driven study suggestions, revision plans, and actionable steps tailored to each student\'s needs.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Dedicated experiences for students, teachers, parents, administrators, and academic advisors.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: FileText,
    title: 'Reports & Exports',
    desc: 'Generate comprehensive progress reports, attendance summaries, and institutional analytics on demand.',
    color: 'bg-royal-50 text-royal-600',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    desc: 'Role-based authorization, secure data handling, and responsible AI practices protect student information.',
    color: 'bg-navy-50 text-navy-700',
  },
]

const HOW_IT_WORKS = [
  { step: 1, title: 'Import Academic Data', desc: 'Upload student records, attendance, and assessment data via CSV or enter directly.', icon: FileText },
  { step: 2, title: 'Analyze Performance', desc: 'Platform calculates trends, identifies patterns, and generates visual analytics.', icon: BarChart3 },
  { step: 3, title: 'AI Risk Assessment', desc: 'Machine learning models assess academic risk and flag students needing support.', icon: Brain },
  { step: 4, title: 'Take Action', desc: 'Students receive personalized plans. Teachers get alerts. Progress is monitored.', icon: Target },
]

const BENEFITS = {
  students: [
    'See your academic performance clearly',
    'Get personalized study recommendations',
    'Track progress toward your goals',
    'Plan your study schedule effectively',
    'Understand your strengths and areas to improve',
  ],
  teachers: [
    'Identify struggling students early',
    'Track class-wide performance trends',
    'Record attendance and marks efficiently',
    'Manage academic interventions',
    'Generate class performance reports',
  ],
  institutions: [
    'Monitor institutional performance metrics',
    'Department-wise and semester-wise analytics',
    'Track intervention success rates',
    'Import and manage academic data at scale',
    'Generate compliance and accreditation reports',
  ],
}

const FAQS = [
  {
    q: 'Is my academic data private and secure?',
    a: 'Yes. The platform uses role-based access control so students only see their own records, teachers only access their authorized classes, and parents only view their linked student\'s information. All data is encrypted and access is audited.',
  },
  {
    q: 'How does the AI early-warning system work?',
    a: 'The system analyzes academic indicators like attendance patterns, assessment scores, assignment completion rates, and performance trends using machine learning. It identifies students who may benefit from additional support and suggests appropriate actions. It does not automatically label or penalize students.',
  },
  {
    q: 'Can I try the platform before using real data?',
    a: 'Absolutely! The platform includes a demo mode with synthetic data. You can explore all features using the provided demo accounts without uploading any real student information.',
  },
  {
    q: 'What data formats are supported for import?',
    a: 'Currently, the platform supports CSV imports with downloadable templates. The import process includes validation, error reporting, and preview before data is committed.',
  },
  {
    q: 'Are the statistics on the homepage real?',
    a: 'Statistics shown on this public page are illustrative examples to demonstrate platform capabilities. All analytics within the dashboard are calculated from your actual authorized academic records.',
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen">
      {/* ============ NAVIGATION ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">EduInsight</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How It Works</a>
              <a href="#benefits" className="text-sm text-white/70 hover:text-white transition-colors">Benefits</a>
              <a href="#faq" className="text-sm text-white/70 hover:text-white transition-colors">FAQ</a>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm bg-white text-navy-900 hover:bg-white/90 font-semibold">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-950 border-t border-white/10 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80 hover:text-white py-2">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80 hover:text-white py-2">How It Works</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80 hover:text-white py-2">Benefits</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80 hover:text-white py-2">FAQ</a>
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <Link to="/login" className="btn btn-sm flex-1 border border-white/30 text-white hover:bg-white/10">Sign In</Link>
                <Link to="/register" className="btn btn-sm flex-1 bg-white text-navy-900">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="gradient-hero-subtle pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-royal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-lavender-500/8 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-40 w-48 h-48 bg-teal-500/8 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0 lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10 animate-fade-in">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-white/80">AI-Powered Educational Analytics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight animate-fade-in-up">
              Turn Student Data Into{' '}
              <span className="text-gradient">Student Success.</span>
            </h1>

            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl animate-fade-in-up delay-100">
              Understand academic progress, identify learning gaps early, and discover personalized ways to improve with AI-powered educational analytics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-200">
              <a href="#features" className="btn btn-lg bg-white text-navy-900 hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all">
                Explore the Platform
                <ChevronRight size={18} />
              </a>
              <Link to="/register" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold">
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-white/40 text-sm animate-fade-in-up delay-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-400" />
                <span>Role-based access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-400" />
                <span>No setup required</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-400" />
                <span>Privacy-first</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div className="mt-16 lg:absolute lg:top-16 lg:right-0 lg:w-[480px] xl:w-[560px] lg:mt-0 animate-fade-in-up delay-400">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                {/* Mini dashboard preview */}
                <div className="bg-surface-secondary p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                      <GraduationCap size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">Student Dashboard</p>
                      <p className="text-[10px] text-text-tertiary">Semester 4 · Computer Science</p>
                    </div>
                    <span className="ml-auto badge badge-success text-[10px]">On Track</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'GPA', value: '8.4', sub: '+0.3', color: 'text-teal-600' },
                      { label: 'Attendance', value: '87%', sub: '↑2%', color: 'text-royal-600' },
                      { label: 'Tasks Done', value: '14/16', sub: '88%', color: 'text-lavender-600' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-navy-900">{stat.value}</p>
                        <p className="text-[10px] text-text-tertiary">{stat.label}</p>
                        <p className={`text-[10px] font-semibold ${stat.color}`}>{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-text-secondary mb-2">Performance Trend</p>
                    <div className="flex items-end gap-1.5 h-12">
                      {[40, 55, 48, 62, 58, 72, 68, 78, 74, 82, 80, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-royal-500 to-royal-300 opacity-80"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-white/30 mt-3">
                * Illustrative preview with sample data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-20 lg:py-28 bg-white/70 backdrop-blur-md border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-royal-50 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-royal-500" />
              <span className="text-xs font-semibold text-royal-600">Platform Features</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Everything you need for student success
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              From real-time analytics to AI-powered recommendations, every feature is designed
              to help students achieve their academic potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card p-6 card-interactive">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              How the platform works
            </h2>
            <p className="mt-4 text-text-secondary">
              From data to action in four clear steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                <div className="card p-6 text-center h-full">
                  <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight size={18} className="text-navy-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BENEFITS TABS ============ */}
      <section id="benefits" className="py-20 lg:py-28 bg-white/70 backdrop-blur-md border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Built for everyone in education
            </h2>
            <p className="mt-4 text-text-secondary">
              See how EduInsight benefits each member of the academic community.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-10">
            {[
              { key: 'students', label: 'Students', icon: GraduationCap },
              { key: 'teachers', label: 'Teachers', icon: BookOpen },
              { key: 'institutions', label: 'Institutions', icon: Building2 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card p-8 animate-fade-in" key={activeTab}>
              <ul className="space-y-4">
                {BENEFITS[activeTab].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-text-primary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AI & PRIVACY ============ */}
      <section className="py-20 lg:py-28 gradient-hero-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 border border-white/10">
                <Brain size={14} className="text-lavender-400" />
                <span className="text-xs font-semibold text-white/80">Responsible AI</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-6">
                AI that supports, never labels
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Our early-warning system is designed to identify students who may benefit from additional support, not to label or penalize them. Every prediction comes with explanations, limitations, and suggested actions.
              </p>
              <ul className="space-y-3">
                {[
                  'Interpretable models with clear contributing factors',
                  'Configurable risk thresholds — no black boxes',
                  'Human review required before any action',
                  'Never automatically penalizes or excludes students',
                  'Synthetic demo data protects privacy',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                    <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Data Privacy', desc: 'Role-based access and audit logging' },
                { icon: Eye, title: 'Transparency', desc: 'Every prediction is explainable' },
                { icon: UserCheck, title: 'Human Oversight', desc: 'Staff review before action' },
                { icon: Lock, title: 'Secure by Design', desc: 'Encrypted data, protected APIs' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <item.icon size={24} className="text-lavender-400 mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-20 lg:py-28 bg-white/70 backdrop-blur-md border-y border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-secondary transition-colors"
                >
                  <span className="text-sm font-semibold text-navy-900 pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-text-tertiary transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20 lg:py-28 bg-surface-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight mb-4">
            Ready to transform student outcomes?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Start exploring the platform today. See how AI-powered analytics can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg btn-primary font-bold">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-lg btn-secondary font-semibold">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-xs text-text-tertiary">
            Role-based access control · No credit card required
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-navy-950 text-white/40 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 gradient-accent rounded-lg flex items-center justify-center">
                  <GraduationCap size={14} className="text-white" />
                </div>
                <span className="text-white font-bold text-base">EduInsight</span>
              </div>
              <p className="text-xs leading-relaxed">
                AI-Powered Student Analytics and Success Platform. Transforming academic data into actionable insights.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white/70 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white/70 transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-white/70 transition-colors">Benefits</a></li>
                <li><a href="#faq" className="hover:text-white/70 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white/70 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Data Processing</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© 2026 EduInsight. AI-Powered Student Analytics and Success Platform.</p>
            <p className="text-[10px]">Built with responsible AI practices · Statistics on this page are illustrative</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
