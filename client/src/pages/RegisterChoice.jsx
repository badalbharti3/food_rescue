import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function RegisterChoice() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Join FreshRoute</h2>
          <p className="text-gray-600 mt-2">Choose how you want to participate.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card clay className="text-center p-8 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#245C45]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="font-bold text-xl text-[#245C45] mb-2">Donate Surplus Food</h3>
            <p className="text-sm text-gray-600 mb-6">For restaurants, hotels, caterers, banquet halls, and other food businesses with surplus food.</p>
            <Link to="/register/donor"><Button className="w-full">Register as Donor</Button></Link>
          </Card>
          <Card clay className="text-center p-8 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#245C45]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-bold text-xl text-[#245C45] mb-2">Receive Food Donations</h3>
            <p className="text-sm text-gray-600 mb-6">For NGOs, orphanages, community kitchens, shelters, and charitable organizations.</p>
            <Link to="/register/receiver"><Button variant="secondary" className="w-full">Register as NGO</Button></Link>
          </Card>
        </div>
        <p className="text-center mt-8 text-sm text-gray-600">Already have an account? <Link to="/login" className="text-[#245C45] font-semibold hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
