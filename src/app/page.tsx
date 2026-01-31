import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-brand overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center page-hero">
        <div className="text-center max-w-3xl animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-primary-200/50 backdrop-blur-sm mb-8 animate-slideInLeft">
            <span className="pulse-dot"></span>
            <span className="text-sm font-medium text-gray-700">Welcome to the future of freelancing</span>
          </div>

          {/* Main heading */}
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
              PeerPod
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-2xl animate-slideInRight" style={{ animationDelay: '0.2s' }}>
            Form <span className="font-semibold text-primary-600">perfectly matched</span> freelance teams based on skills, values, and compatibility
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInRight" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/login"
              className="btn-primary group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/signup"
              className="btn-secondary group"
            >
              <span className="flex items-center justify-center gap-2">
                Create Account
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-20 grid md:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered compatibility matching for ideal teams' },
              { icon: '🚀', title: 'Fast Teams', desc: 'Build teams in minutes, not weeks' },
              { icon: '✨', title: 'Quality Focus', desc: 'Vetted freelancers with proven track records' },
            ].map((feature, i) => (
              <div
                key={i}
                className="card animate-fadeIn"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
