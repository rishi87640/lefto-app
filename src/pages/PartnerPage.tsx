import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submitPartnerApplication } from '../services/supabaseService';
import { PartnerLead } from '../types';

export const PartnerPage: React.FC = () => {
  // Step tracker (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields State
  // Step 1: Contact details
  const [ownerName, setOwnerName] = useState('');
  const [contactRole, setContactRole] = useState('Owner / General Manager');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  // Step 2: Restaurant profile
  const [businessName, setBusinessName] = useState('');
  const [outletType, setOutletType] = useState('bakery');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('Alpha 1');

  // Step 3: Operating hours & pickup arrangements
  const [operatingHours, setOperatingHours] = useState('10:00 AM – 10:30 PM');
  const [pickupWindowPreference, setPickupWindowPreference] = useState('9:00 PM – 10:00 PM');
  const [pickupInstructions, setPickupInstructions] = useState(
    'Collect directly from our main counter by showing your 4-digit LEFTO PIN.'
  );

  // Step 4: Food safety & business documentation
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [foodHandlingDeclaration, setFoodHandlingDeclaration] = useState(false);

  // Step 5: Commercial terms review
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Submission & Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<
    'none' | 'submitted' | 'in_review' | 'approved' | 'rejected'
  >('none');
  const [submittedDetails, setSubmittedDetails] = useState<any | null>(null);

  // Load draft progress from localStorage if present
  useEffect(() => {
    const savedDraft = localStorage.getItem('lefto_partner_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed) {
          if (parsed.ownerName) setOwnerName(parsed.ownerName);
          if (parsed.contactRole) setContactRole(parsed.contactRole);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.businessName) setBusinessName(parsed.businessName);
          if (parsed.outletType) setOutletType(parsed.outletType);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.locality) setLocality(parsed.locality);
          if (parsed.operatingHours) setOperatingHours(parsed.operatingHours);
          if (parsed.pickupWindowPreference) setPickupWindowPreference(parsed.pickupWindowPreference);
          if (parsed.pickupInstructions) setPickupInstructions(parsed.pickupInstructions);
          if (parsed.fssaiNumber) setFssaiNumber(parsed.fssaiNumber);
          if (parsed.gstNumber) setGstNumber(parsed.gstNumber);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Autosave draft on step change
  const saveProgress = () => {
    const draft = {
      ownerName,
      contactRole,
      phone,
      email,
      businessName,
      outletType,
      address,
      locality,
      operatingHours,
      pickupWindowPreference,
      pickupInstructions,
      fssaiNumber,
      gstNumber
    };
    localStorage.setItem('lefto_partner_draft', JSON.stringify(draft));
  };

  // Step Validations
  const validateStep1 = () => {
    if (!ownerName.trim() || ownerName.trim().length < 2) {
      setSubmissionError('Please enter the contact person’s full name.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setSubmissionError('Please enter a valid 10-digit Indian phone number.');
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSubmissionError('Please enter a valid business email address.');
      return false;
    }
    setSubmissionError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!businessName.trim() || businessName.trim().length < 2) {
      setSubmissionError('Please enter your restaurant/outlet name.');
      return false;
    }
    if (!address.trim() || address.trim().length < 5) {
      setSubmissionError('Please enter the full store address for customer pickup.');
      return false;
    }
    setSubmissionError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!operatingHours.trim()) {
      setSubmissionError('Please specify store operating hours.');
      return false;
    }
    if (!pickupWindowPreference.trim()) {
      setSubmissionError('Please specify your preferred surplus pickup window.');
      return false;
    }
    setSubmissionError(null);
    return true;
  };

  const validateStep4 = () => {
    const cleanFssai = fssaiNumber.replace(/\D/g, '');
    if (cleanFssai.length !== 14) {
      setSubmissionError('FSSAI License/Registration Number must be a valid 14-digit number.');
      return false;
    }
    if (!foodHandlingDeclaration) {
      setSubmissionError('You must confirm the food safety and hygienic packaging declaration.');
      return false;
    }
    setSubmissionError(null);
    return true;
  };

  const handleNext = () => {
    let valid = false;
    if (currentStep === 1) valid = validateStep1();
    if (currentStep === 2) valid = validateStep2();
    if (currentStep === 3) valid = validateStep3();
    if (currentStep === 4) valid = validateStep4();

    if (valid) {
      saveProgress();
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setSubmissionError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!termsAgreed) {
      setSubmissionError('Please review and agree to the LEFTO Partner Commercial Terms before submitting.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: PartnerLead = {
        businessName: businessName.trim(),
        outletType,
        address: address.trim(),
        zone: locality,
        ownerName: ownerName.trim(),
        contactRole,
        phone: phone.replace(/\D/g, '').slice(-10),
        email: email.trim().toLowerCase(),
        operatingHours: operatingHours.trim(),
        pickupWindowPreference: pickupWindowPreference.trim(),
        pickupInstructions: pickupInstructions.trim(),
        fssaiNumber: fssaiNumber.replace(/\D/g, ''),
        gstNumber: gstNumber.trim() || undefined,
        whatsappConsent,
        termsAgreed: true
      };

      const res = await submitPartnerApplication(payload);

      if (!res.success) {
        setSubmissionError(res.error || 'Failed to submit application. Please check your inputs.');
        setIsSubmitting(false);
        return;
      }

      // Successful registration
      localStorage.removeItem('lefto_partner_draft');
      setSubmittedDetails({
        businessName: payload.businessName,
        locality: payload.zone,
        ownerName: payload.ownerName,
        phone: payload.phone,
        email: payload.email,
        fssaiNumber: payload.fssaiNumber
      });
      setApplicationStatus('submitted');
    } catch (err: any) {
      setSubmissionError(err.message || 'Network error while submitting partner application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-surface pb-20">
      
      {/* 1. Header & Value Proposition Banner */}
      <section className="w-full bg-gradient-to-b from-primary/10 via-surface to-surface pt-12 pb-14 border-b border-outline-variant/30">
        <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span className="font-label-badge text-xs uppercase tracking-wider font-bold">
              Restaurant & Bakery Partner Network
            </span>
          </div>

          <h1 className="font-display-hero text-3xl md:text-5xl text-on-surface font-black tracking-tight max-w-3xl leading-tight">
            Recover Value from Surplus Food. <span className="text-primary">Zero Delivery Hassle.</span>
          </h1>

          <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-2xl mt-4 leading-relaxed">
            Partner with LEFTO to sell surplus, high-quality food to local customers looking for discounted meals. You control the bags, pricing, and pickup windows.
          </p>

          {/* Transparent Benefit Pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">currency_rupee</span>
              <strong className="text-xs font-bold text-on-surface">Extra Revenue</strong>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Turn unsold fresh items into incremental income instead of waste.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">group</span>
              <strong className="text-xs font-bold text-on-surface">Reach Conscious Diners</strong>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Introduce your kitchen to nearby customers seeking affordable food.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">tune</span>
              <strong className="text-xs font-bold text-on-surface">100% Owner Control</strong>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Set your daily quantities, prices, and end-of-day pickup windows.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">store</span>
              <strong className="text-xs font-bold text-on-surface">Direct Self-Pickup</strong>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Customers collect orders in person. No delivery drivers in your kitchen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
              <strong className="text-xs font-bold text-on-surface">Verified Quality</strong>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                FSSAI registration ensures compliance and high customer trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Guided Application Form or Status View */}
      <div className="max-w-3xl mx-auto px-layout-margin-mobile md:px-layout-margin-tablet py-12" id="partner-form">
        
        {applicationStatus === 'submitted' ? (
          /* POST-SUBMISSION STATUS SCREEN */
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-md border border-outline-variant/30 flex flex-col items-center text-center gap-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-3xl font-black">hourglass_top</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Application Status: Under Review
            </div>

            <h2 className="font-headline-lg text-2xl md:text-3xl font-black text-on-surface tracking-tight">
              Application Received for {submittedDetails?.businessName}
            </h2>

            <p className="text-xs md:text-sm text-on-surface-variant max-w-lg leading-relaxed">
              Thank you for applying to partner with LEFTO. As part of our food-safety commitment, our onboarding team verifies all FSSAI details and physical store addresses prior to granting live listing privileges.
            </p>

            {/* Verification Timeline / Steps */}
            <div className="w-full bg-surface-container-low p-5 rounded-2xl flex flex-col gap-3 text-left">
              <span className="text-[11px] uppercase tracking-wider font-bold text-outline">
                Onboarding Lifecycle
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <strong className="text-on-surface block font-bold">1. Form Submitted</strong>
                    <span className="text-outline text-[11px]">Contact & store parameters captured</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs animate-spin">
                    •
                  </span>
                  <div>
                    <strong className="text-on-surface block font-bold">2. FSSAI & Food-Safety Review</strong>
                    <span className="text-outline text-[11px]">Validating license #{submittedDetails?.fssaiNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-60">
                  <span className="w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-on-surface block font-bold">3. Merchant Authorization & Approval</strong>
                    <span className="text-outline text-[11px]">Access unlocked to publish live Rescue Bags</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low text-xs text-on-surface-variant text-left leading-relaxed w-full">
              <strong>Need immediate assistance?</strong> Contact our Greater Noida merchant desk at <strong>merchants@lefto.in</strong> or WhatsApp <strong>+91 98765 43210</strong>.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/partner-dashboard"
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs shadow hover:bg-primary/90 transition-all text-center"
              >
                Go to Partner Portal
              </Link>
              <button
                type="button"
                onClick={() => setApplicationStatus('none')}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors text-center"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          /* GUIDED 5-STEP APPLICATION FORM */
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
            
            {/* Step Progress Bar */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4 flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                    Step {currentStep} of 5
                  </span>
                  <h2 className="font-headline-md text-lg font-black text-on-surface">
                    {currentStep === 1 && 'Contact Person & Business Details'}
                    {currentStep === 2 && 'Restaurant Name, Type & Locality'}
                    {currentStep === 3 && 'Operating Hours & Pickup Setup'}
                    {currentStep === 4 && 'FSSAI License & Food Safety'}
                    {currentStep === 5 && 'Review & Commercial Agreement'}
                  </h2>
                </div>
                <span className="text-xs text-outline font-medium">Autosaved Draft</span>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s < currentStep
                        ? 'bg-primary'
                        : s === currentStep
                        ? 'bg-primary-container'
                        : 'bg-surface-container-high'
                    }`}
                  />
                ))}
              </div>
            </div>

            {submissionError && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error flex items-start gap-3 text-xs leading-relaxed">
                <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                <span>{submissionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              
              {/* STEP 1: Contact Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-on-surface-variant">
                    Please provide the direct contact details of the primary outlet owner or store manager.
                  </p>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      Full Name * <span className="text-primary">(Required)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Name of the designated store representative.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      Your Role at Restaurant *
                    </label>
                    <select
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none font-medium"
                    >
                      <option value="Owner / Founder">Owner / Founder</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Executive Chef / Kitchen Lead">Executive Chef / Kitchen Lead</option>
                      <option value="Store Supervisor">Store Supervisor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        Mobile Phone Number * <span className="text-primary">(Required)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-3 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile"
                          className="flex-1 bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-outline mt-1 block">
                        Used for urgent order notifications and verification.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        Business Email * <span className="text-primary">(Required)</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@bakery.com"
                        className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                      <span className="text-[10px] text-outline mt-1 block">
                        For monthly reconciliation invoices and partner terms.
                      </span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={whatsappConsent}
                      onChange={(e) => setWhatsappConsent(e.target.checked)}
                      className="mt-0.5 accent-primary w-4 h-4 rounded"
                    />
                    <span className="text-xs text-on-surface-variant">
                      Receive daily closing surplus alerts and pickup pass receipts via WhatsApp.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 2: Restaurant Identity & Address */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-on-surface-variant">
                    Enter the outlet location where customers will arrive to collect their reserved bags.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        Restaurant / Outlet Name * <span className="text-primary">(Required)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Crust & Co. Artisan Pizzeria"
                        className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        Outlet Type *
                      </label>
                      <select
                        value={outletType}
                        onChange={(e) => setOutletType(e.target.value)}
                        className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none font-medium"
                      >
                        <option value="bakery">Bakery & Patisserie</option>
                        <option value="restaurant">Casual / Fine Dine Restaurant</option>
                        <option value="cafe">Café & Coffee Shop</option>
                        <option value="cloud_kitchen">Cloud Kitchen / Takeaway Counter</option>
                        <option value="other">Sweet Shop / Confectionery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      Full Outlet Physical Address * <span className="text-primary">(Required)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Shop No., Floor, Commercial Complex, Sector"
                      className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Customers will use this exact address for in-person pickup directions.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      Greater Noida Locality / Sector *
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none font-medium"
                    >
                      <option value="Alpha 1">Alpha 1</option>
                      <option value="Alpha 2">Alpha 2</option>
                      <option value="Beta 1">Beta 1</option>
                      <option value="Beta 2">Beta 2</option>
                      <option value="Gamma 1">Gamma 1</option>
                      <option value="Pari Chowk">Pari Chowk</option>
                      <option value="Knowledge Park III">Knowledge Park III</option>
                      <option value="Delta 1">Delta 1</option>
                      <option value="Surajpur">Surajpur</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: Operating Hours & Pickup Setup */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-on-surface-variant">
                    Set up convenient windows so store staff can easily hand over bags without disrupting main dining hours.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        General Operating Hours *
                      </label>
                      <input
                        type="text"
                        required
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="e.g. 10:00 AM – 10:30 PM"
                        className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                        Preferred Surplus Pickup Window *
                      </label>
                      <input
                        type="text"
                        required
                        value={pickupWindowPreference}
                        onChange={(e) => setPickupWindowPreference(e.target.value)}
                        placeholder="e.g. 9:00 PM – 10:00 PM"
                        className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                      <span className="text-[10px] text-outline mt-1 block">
                        Usually 30-60 minutes before store closing.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      Counter Pickup Instructions for Staff & Customers *
                    </label>
                    <textarea
                      rows={3}
                      value={pickupInstructions}
                      onChange={(e) => setPickupInstructions(e.target.value)}
                      placeholder="e.g. Ask for LEFTO pickup at billing counter. Show 4-digit PIN."
                      className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none leading-relaxed"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Explains where customers should stand and how staff verifies their PIN.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Food Safety & Regulatory Documentation */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-primary/10 rounded-2xl flex items-start gap-2.5 text-xs text-on-surface leading-relaxed">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">verified</span>
                    <div>
                      <strong className="block font-bold text-primary">Mandatory Food-Safety Compliance:</strong>
                      Under Indian food safety standards (FSS Act, 2006), all food businesses selling prepared or packaged food on digital platforms must possess a valid FSSAI registration or license.
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      14-Digit FSSAI License / Registration Number * <span className="text-primary">(Required)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, '').slice(0, 14))}
                      placeholder="14-digit FSSAI number"
                      className="w-full bg-surface-container-low text-on-surface font-mono text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none tracking-wider"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Why needed: Required by law to prevent counterfeit kitchens and safeguard consumer health.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                      GST Identification Number (GSTIN) <span className="text-outline font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 09AAAAA0000A1Z5"
                      className="w-full bg-surface-container-low text-on-surface font-mono text-xs rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary focus:outline-none"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Required only if your food establishment is GST-registered for input credit reconciliation.
                    </span>
                  </div>

                  <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-surface-container-low cursor-pointer border border-outline-variant/20">
                    <input
                      type="checkbox"
                      checked={foodHandlingDeclaration}
                      onChange={(e) => setFoodHandlingDeclaration(e.target.checked)}
                      className="mt-0.5 accent-primary w-4 h-4 rounded"
                    />
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      <strong>Food Freshness Declaration:</strong> I certify that all surplus items listed on LEFTO are within their safe shelf life, stored at food-safe temperatures, hygienically packed, and fit for consumption. Expired or spoiled food will never be packaged into Rescue Bags.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 5: Review & Commercial Agreement */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-on-surface-variant">
                    Please review your application summary and transparent commercial terms before final submission.
                  </p>

                  {/* Application Summary Box */}
                  <div className="p-4 rounded-2xl bg-surface-container-low text-xs space-y-2 border border-outline-variant/20">
                    <div className="flex justify-between pb-1 border-b border-outline-variant/10">
                      <span className="text-outline">Outlet:</span>
                      <strong className="text-on-surface">{businessName} ({locality})</strong>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-outline-variant/10">
                      <span className="text-outline">Contact Person:</span>
                      <strong className="text-on-surface">{ownerName} ({phone})</strong>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-outline-variant/10">
                      <span className="text-outline">FSSAI License:</span>
                      <strong className="text-on-surface">{fssaiNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">Pickup Window:</span>
                      <strong className="text-on-surface">{pickupWindowPreference}</strong>
                    </div>
                  </div>

                  {/* Commercial Terms Disclosure */}
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-primary/20 space-y-2.5 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
                      <strong className="text-on-surface text-sm">Transparent Commercial Terms:</strong>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                      <li><strong>Zero Setup Fees:</strong> Free registration and zero monthly listing charges.</li>
                      <li><strong>Customer Platform Fee:</strong> A small transparent fee (₹5.00) is paid by the customer per order to support platform technology and quality audits.</li>
                      <li><strong>No Guaranteed Earnings Claim:</strong> LEFTO provides a marketplace platform. Demand varies by outlet location, bag pricing, and surplus quantity.</li>
                      <li><strong>Customer Handover Verification:</strong> You only hand over orders upon verifying the 4-digit customer pickup PIN.</li>
                      <li><strong>Approval Required:</strong> Submitting this form does not grant instant live listing privileges. You may publish public bags once our team reviews your documentation.</li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 accent-primary w-4 h-4 rounded"
                    />
                    <span className="text-xs text-on-surface font-semibold leading-relaxed">
                      I have read, understood, and agree to the LEFTO Merchant Partnership Terms & Quality Standards.
                    </span>
                  </label>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Save & Continue</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !termsAgreed}
                    className="px-7 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary text-xs md:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{isSubmitting ? 'Submitting Application...' : 'Submit Partnership Application'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};
