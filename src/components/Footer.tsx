import { Link } from 'react-router';
import { Shield, Mail, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#10120B] border-t border-[#DCE9B7]/10 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#F7C56B]" />
              <span className="font-black text-[#FFF8E9]">EventOS</span>
            </div>
            <p className="text-sm text-[#D9CFBC] leading-relaxed max-w-xs">
              Verified Event Operations Platform. Manage events, verify participation, build proof of work.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-black text-[#FFF8E9] mb-4">Product</h4>
            <div className="space-y-2.5">
              <Link to="/events" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Events</Link>
              <Link to="/passport/sourab" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Proof Passport</Link>
              <Link to="/verify/certificate/CERT-AB12CD-EFGH" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Verify Certificate</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black text-[#FFF8E9] mb-4">Dashboards</h4>
            <div className="space-y-2.5">
              <Link to="/dashboard/organizer" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Organizer</Link>
              <Link to="/dashboard/participant" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Participant</Link>
              <Link to="/dashboard/volunteer" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Volunteer</Link>
              <Link to="/dashboard/sponsor" className="block text-sm text-[#D9CFBC] hover:text-[#F7C56B] transition-colors">Sponsor</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black text-[#FFF8E9] mb-4">Contact</h4>
            <div className="space-y-2.5">
              <span className="flex items-center gap-2 text-sm text-[#D9CFBC]"><Mail className="w-4 h-4 text-[#F7C56B]" /> hello@eventos.com</span>
              <div className="flex gap-3 mt-3">
                <Github className="w-4 h-4 text-[#D9CFBC] hover:text-[#F7C56B] cursor-pointer transition-colors" />
                <Twitter className="w-4 h-4 text-[#D9CFBC] hover:text-[#F7C56B] cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#F7C56B]/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#B9AE9B]">EventOS 2026. All rights reserved.</p>
          <p className="text-xs text-[#B9AE9B]">Trusted by colleges & communities</p>
        </div>
      </div>
    </footer>
  );
}
