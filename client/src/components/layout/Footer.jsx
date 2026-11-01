export default function Footer() {
  return (
    <footer className="mt-20 bg-[#173F32] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,#78A77B,transparent_40%),radial-gradient(circle_at_80%_80%,#245C45,transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-xl mb-3">
            <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">F</span>
            FreshRoute
          </div>
          <p className="text-sm text-white/70">Turning surplus food into someone's next meal. A smarter, fairer food redistribution platform.</p>
        </div>
        <div>
          <h5 className="font-bold mb-3 text-white/90">Platform</h5>
          <ul className="text-sm space-y-2 text-white/70">
            <li><a href="/#how" className="hover:text-white transition">How It Works</a></li>
            <li><a href="/#donors" className="hover:text-white transition">For Donors</a></li>
            <li><a href="/#ngos" className="hover:text-white transition">For NGOs</a></li>
            <li><a href="/#impact" className="hover:text-white transition">Our Impact</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-3 text-white/90">Resources</h5>
          <ul className="text-sm space-y-2 text-white/70">
            <li><a href="/register?role=donor" className="hover:text-white transition">Donate Food</a></li>
            <li><a href="/register?role=receiver" className="hover:text-white transition">Join as NGO</a></li>
            <li><a href="#" className="hover:text-white transition">Food Safety Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-3 text-white/90">Contact</h5>
          <p className="text-sm text-white/70">support@freshroute.local</p>
          <div className="flex gap-3 mt-4">
            {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
              <span key={s} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 transition cursor-pointer">{s[0]}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="relative text-center text-xs text-white/50 py-4 border-t border-white/10">© {new Date().getFullYear()} FreshRoute. All rights reserved.</div>
    </footer>
  );
}
