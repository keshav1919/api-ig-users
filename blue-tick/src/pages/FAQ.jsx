import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../data/faq';
import { Disclaimer } from '../components/Disclaimer';
import { CONTACT_CONFIG } from '../config/contact';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'service', label: 'Service & Scope' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'billing', label: 'Pricing & Billing' },
    { id: 'legal', label: 'Affiliation & Trust' },
    { id: 'security', label: 'Account Security' },
  ];

  const filteredItems = activeCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-5 select-none">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 text-xs font-bold text-[#0095F6]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge & Clarity</span>
        </div>
        <h1 className="text-3xl font-black text-[#0F1419] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#737373]">
          Find direct answers regarding our independent verification assistance, eligibility, and billing.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#0095F6] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-[#DBDBDB] hover:text-[#0F1419]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const isLegalQuestion = item.question.includes('Meta or Instagram');

          return (
            <div
              key={idx}
              className={`bg-white rounded-lg border transition-all ${
                isLegalQuestion
                  ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                  : isOpen
                  ? 'border-[#0095F6]/60 shadow-xs'
                  : 'border-[#DBDBDB]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className={`font-bold text-sm sm:text-base ${isLegalQuestion ? 'text-amber-950' : 'text-[#0F1419]'}`}>
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#0095F6]' : 'text-neutral-400'
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#737373] leading-relaxed border-t border-neutral-100">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Notice */}
      <Disclaimer variant="default" />

      {/* Still Have Questions Box */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6 text-center space-y-3">
        <h3 className="font-bold text-base text-[#0F1419]">
          Still have questions?
        </h3>
        <p className="text-xs text-[#737373] max-w-sm mx-auto">
          Our customer support desk is available to answer any questions about our onboarding process.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/support"
            className="bg-[#0095F6] hover:bg-[#0081d6] text-white text-xs font-bold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
          >
            Contact Support
          </Link>
          <a
            href={CONTACT_CONFIG.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#0F1419] text-xs font-bold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
