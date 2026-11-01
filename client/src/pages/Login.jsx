import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success('Welcome back');
      navigate(u.role === 'donor' ? '/donor' : u.role === 'receiver' ? '/receiver' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <>
    <LoadingOverlay show={loading} message={loading ? 'Signing you in...' : ''} />
    <div className="min-h-screen grid md:grid-cols-2 bg-[#F7F5EF]">
      <div className="hidden md:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80" alt="Fresh food" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#173F32]/70 to-[#245C45]/40" />
        <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
          <h2 className="text-3xl font-extrabold">Good Food Deserves a Second Chance.</h2>
          <p className="mt-3 text-white/80 max-w-md">Join FreshRoute to turn surplus meals into community support.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 w-full max-w-md shadow-xl">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#245C45] text-white flex items-center justify-center font-bold mb-3">F</div>
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your FreshRoute account</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-xs text-gray-500 hover:text-gray-800">{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <p className="text-sm text-center mt-5 text-gray-600">No account? <Link to="/register" className="text-[#245C45] font-semibold hover:underline">Register</Link></p>
        </div>
      </div>
    </div>
    </>
  );
}
