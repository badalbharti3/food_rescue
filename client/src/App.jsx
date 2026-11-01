import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const RegisterChoice = lazy(() => import('./pages/RegisterChoice'));
const RegisterDonor = lazy(() => import('./pages/RegisterDonor'));
const RegisterReceiver = lazy(() => import('./pages/RegisterReceiver'));

const DonorOverview = lazy(() => import('./pages/donor/Overview'));
const CreateListing = lazy(() => import('./pages/donor/CreateListing'));
const RecurringDonations = lazy(() => import('./pages/donor/RecurringDonations'));
const MyListings = lazy(() => import('./pages/donor/MyListings'));
const NgoRequests = lazy(() => import('./pages/donor/NgoRequests'));
const ActiveAllocations = lazy(() => import('./pages/donor/ActiveAllocations'));
const DonorPickups = lazy(() => import('./pages/donor/PickupSchedule'));
const DonationHistory = lazy(() => import('./pages/donor/DonationHistory'));
const BranchManagement = lazy(() => import('./pages/donor/BranchManagement'));
const DonorNotifications = lazy(() => import('./pages/donor/Notifications'));
const DonorAnalytics = lazy(() => import('./pages/donor/Analytics'));
const DonorProfile = lazy(() => import('./pages/donor/Profile'));
const ImpactCertificate = lazy(() => import('./pages/shared/ImpactCertificate'));

const ReceiverOverview = lazy(() => import('./pages/receiver/Overview'));
const NearbyFood = lazy(() => import('./pages/receiver/NearbyFood'));
const MapView = lazy(() => import('./pages/receiver/MapView'));
const MyRequests = lazy(() => import('./pages/receiver/MyRequests'));
const ApprovedAllocations = lazy(() => import('./pages/receiver/ApprovedAllocations'));
const AdditionalQty = lazy(() => import('./pages/receiver/AdditionalQty'));
const ReceiverPickups = lazy(() => import('./pages/receiver/PickupSchedule'));
const CollectionHistory = lazy(() => import('./pages/receiver/CollectionHistory'));
const ReceiverNotifications = lazy(() => import('./pages/receiver/Notifications'));
const Capacity = lazy(() => import('./pages/receiver/Capacity'));
const ReceiverProfile = lazy(() => import('./pages/receiver/Profile'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const Verifications = lazy(() => import('./pages/admin/Verifications'));
const AdminDonors = lazy(() => import('./pages/admin/Donors'));
const AdminNgos = lazy(() => import('./pages/admin/Ngos'));
const AdminListings = lazy(() => import('./pages/admin/Listings'));
const AdminAllocations = lazy(() => import('./pages/admin/Allocations'));
const AdminDisputes = lazy(() => import('./pages/admin/Disputes'));
const AdminAudit = lazy(() => import('./pages/admin/AuditLogs'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminOpsMap = lazy(() => import('./pages/admin/OpsMap'));

function D({ children }) { return <DashboardLayout>{children}</DashboardLayout>; }
function Fallback() { return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-4 border-[#245C45] border-t-transparent rounded-full animate-spin" /></div>; }

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<><Navbar /><Landing /><Footer /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterChoice />} />
            <Route path="/register/donor" element={<RegisterDonor />} />
            <Route path="/register/receiver" element={<RegisterReceiver />} />

            <Route element={<ProtectedRoute roles={['donor']} />}>
              <Route path="/donor" element={<D><DonorOverview /></D>} />
              <Route path="/donor/create" element={<D><CreateListing /></D>} />
              <Route path="/donor/recurring" element={<D><RecurringDonations /></D>} />
              <Route path="/donor/listings" element={<D><MyListings /></D>} />
              <Route path="/donor/requests" element={<D><NgoRequests /></D>} />
              <Route path="/donor/allocations" element={<D><ActiveAllocations /></D>} />
              <Route path="/donor/pickups" element={<D><DonorPickups /></D>} />
              <Route path="/donor/history" element={<D><DonationHistory /></D>} />
              <Route path="/donor/branches" element={<D><BranchManagement /></D>} />
              <Route path="/donor/notifications" element={<D><DonorNotifications /></D>} />
              <Route path="/donor/analytics" element={<D><DonorAnalytics /></D>} />
              <Route path="/donor/certificate" element={<D><ImpactCertificate /></D>} />
              <Route path="/donor/profile" element={<D><DonorProfile /></D>} />
            </Route>

            <Route element={<ProtectedRoute roles={['receiver']} />}>
              <Route path="/receiver" element={<D><ReceiverOverview /></D>} />
              <Route path="/receiver/nearby" element={<D><NearbyFood /></D>} />
              <Route path="/receiver/map" element={<D><MapView /></D>} />
              <Route path="/receiver/requests" element={<D><MyRequests /></D>} />
              <Route path="/receiver/allocations" element={<D><ApprovedAllocations /></D>} />
              <Route path="/receiver/additional" element={<D><AdditionalQty /></D>} />
              <Route path="/receiver/pickups" element={<D><ReceiverPickups /></D>} />
              <Route path="/receiver/history" element={<D><CollectionHistory /></D>} />
              <Route path="/receiver/notifications" element={<D><ReceiverNotifications /></D>} />
              <Route path="/receiver/capacity" element={<D><Capacity /></D>} />
              <Route path="/receiver/certificate" element={<D><ImpactCertificate /></D>} />
              <Route path="/receiver/profile" element={<D><ReceiverProfile /></D>} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<D><AdminOverview /></D>} />
              <Route path="/admin/verifications" element={<D><Verifications /></D>} />
              <Route path="/admin/donors" element={<D><AdminDonors /></D>} />
              <Route path="/admin/ngos" element={<D><AdminNgos /></D>} />
              <Route path="/admin/listings" element={<D><AdminListings /></D>} />
              <Route path="/admin/allocations" element={<D><AdminAllocations /></D>} />
              <Route path="/admin/ops-map" element={<D><AdminOpsMap /></D>} />
              <Route path="/admin/disputes" element={<D><AdminDisputes /></D>} />
              <Route path="/admin/audit" element={<D><AdminAudit /></D>} />
              <Route path="/admin/analytics" element={<D><AdminAnalytics /></D>} />
              <Route path="/admin/notifications" element={<D><AdminNotifications /></D>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
