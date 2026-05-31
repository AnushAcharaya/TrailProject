import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/Layout';
import FarmerLayout from '../components/farmerDashboard/FarmerLayout';
import VetLayout from '../components/vetDashboard/VetLayout';
import {
  ChevronDown, ChevronUp, Mail, Phone,
  Shield, Syringe, PawPrint, Calendar,
  ArrowRightLeft, BarChart2, MessageSquare, AlertCircle, BookOpen,
} from 'lucide-react';

function getUserRole() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    return user.role || 'admin';
  } catch (_) {
    return 'admin';
  }
}

const faqs = [
  {
    question: 'How do I add a new livestock animal?',
    answer:
      'Navigate to the Livestock section from the sidebar, then click "Add Livestock". Fill in details like species, breed, tag ID, age, and health status, then submit the form.',
  },
  {
    question: 'How do I record a vaccination for my animal?',
    answer:
      'Go to the Vaccination section, click "Add Vaccination", select the animal by tag ID, choose the vaccine type and date given, and fill in the veterinarian details.',
  },
  {
    question: 'How do I enroll my livestock in an insurance plan?',
    answer:
      'Open the Insurance section and click "Enroll". Follow the 4-step process: select your livestock, choose a plan, upload payment proof, then review and submit. Your enrollment will be reviewed by an admin.',
  },
  {
    question: 'How do I submit an insurance claim?',
    answer:
      'Your enrollment must be Active before submitting a claim. Go to Insurance → Submit Claim, select the active enrollment, fill in incident details, and upload supporting documents.',
  },
  {
    question: 'How do I request a vet appointment?',
    answer:
      'Go to Appointments and click "Request Appointment". Choose your preferred vet, pick a date and time, and describe the issue. The vet will confirm or reschedule.',
  },
  {
    question: 'How do I transfer livestock ownership?',
    answer:
      "Use the Profile Transfer section. Select the animal, enter the receiver's details, and submit the request. The admin reviews and approves all transfers.",
  },
  {
    question: 'Where can I download vaccination or treatment reports?',
    answer:
      'Go to the Reports section, find the animal, and click "View Vaccination Records" or "View Treatment Records". In the modal, click "Download PDF" to get a formatted PDF report.',
  },
  {
    question: 'How do I change my profile or password?',
    answer:
      'Click on your profile avatar in the top-right corner or go to Settings in the sidebar. You can update your name, phone, profile photo, and change your password from there.',
  },
];

const guides = [
  { icon: PawPrint,       title: 'Livestock Management', desc: 'Add, edit, and track all your animals in one place.' },
  { icon: Syringe,        title: 'Vaccination Records',  desc: 'Keep vaccination history updated and get due-date alerts.' },
  { icon: BookOpen,       title: 'Medical Treatment',    desc: 'Log treatments, diagnoses, and follow-up schedules.' },
  { icon: Shield,         title: 'Insurance',            desc: 'Enroll livestock, pay premiums, and track claims.' },
  { icon: Calendar,       title: 'Appointments',         desc: 'Request and manage vet visits with ease.' },
  { icon: ArrowRightLeft, title: 'Profile Transfer',     desc: 'Securely transfer animal ownership between farmers.' },
  { icon: BarChart2,      title: 'Reports',              desc: 'Download vaccination and treatment reports as PDF.' },
  { icon: MessageSquare,  title: 'Messages',             desc: 'Chat directly with vets and other farmers.' },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-emerald-50 transition-colors"
      >
        <span className="font-medium text-gray-800 pr-4">{question}</span>
        {open
          ? <ChevronUp size={18} className="text-emerald-700 shrink-0" />
          : <ChevronDown size={18} className="text-emerald-700 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-emerald-50 text-gray-700 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function HelpContent({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-8 max-w-5xl mx-auto space-y-10">

        {/* Feature Guides */}
        <section>
          <h2 className="text-lg font-bold text-emerald-900 mb-4">Quick Feature Guide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {guides.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-start gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-900 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-bold text-emerald-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-bold text-emerald-900 mb-4">Contact Support</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-900 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Email Us</p>
                <p className="text-gray-500 text-xs mt-1">support@livestockhub.com</p>
                <p className="text-gray-400 text-xs mt-1">Response within 24 hours</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-900 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Call Us</p>
                <p className="text-gray-500 text-xs mt-1">+977-01-4XXXXXX</p>
                <p className="text-gray-400 text-xs mt-1">Sun – Fri, 9 AM – 5 PM</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-900 flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Report an Issue</p>
                <p className="text-gray-500 text-xs mt-1">Contact admin directly for urgent issues.</p>
                <button
                  onClick={() => navigate('/admin/broadcast')}
                  className="mt-2 text-xs text-emerald-700 font-medium hover:underline"
                >
                  Go to Broadcast →
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 pb-4">
          LivestockHub — Livestock Management System &nbsp;|&nbsp; All rights reserved &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const role = getUserRole();

  if (role === 'farmer') {
    return (
      <FarmerLayout pageTitle="Help & Support">
        <HelpContent navigate={navigate} />
      </FarmerLayout>
    );
  }

  if (role === 'vet') {
    return (
      <VetLayout pageTitle="Help & Support">
        <HelpContent navigate={navigate} />
      </VetLayout>
    );
  }

  // Admin — full layout with sidebar + top nav
  return (
    <AdminLayout>
      <HelpContent navigate={navigate} />
    </AdminLayout>
  );
}
