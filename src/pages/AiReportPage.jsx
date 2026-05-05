import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useReportGeneration from '../hooks/useReportGeneration';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Sparkles,
  Loader2,
  Printer,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Minimize2,
  User,
  Car,
} from 'lucide-react';

const A4_WIDTH_PX = 794;
const PAGE_PADDING = 48;

// A4 page height in mm and pixels (at 96 DPI)
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 15;
const MM_TO_PX = 3.7795275591; // 1mm = 3.78px at 96 DPI
const PAGE_HEIGHT_PX = (A4_HEIGHT_MM - A4_MARGIN_MM * 2) * MM_TO_PX; // ~1009px

// Category keywords for filtering images
const CATEGORY_KEYWORDS = {
  battery: ['battery', 'terminal'],
  electrics: ['electric', 'light', 'headlight', 'indicator', 'horn'],
  steering: ['steering', 'suspension', 'shock'],
  brakes: ['brake', 'wheel', 'tyre', 'tire', 'tread'],
  bodywork: [
    'body',
    'bonnet',
    'screen',
    'windscreen',
    'seat',
    'front',
    'rear',
    'side',
    'driver',
    'passenger',
    'buggy',
    'cart',
  ],
};

// Helper to filter images by category keywords
const getImagesByCategory = (images, category) => {
  if (!images?.length) return [];
  const categoryKeywords = CATEGORY_KEYWORDS[category] || [];
  return images.filter((img) =>
    categoryKeywords.some((kw) => img.label?.toLowerCase().includes(kw)),
  );
};

// Component to render section images (defined outside to prevent re-creation)
const SectionImages = ({ images }) => {
  if (!images?.length) return null;
  return (
    <div className="mt-2 p-2 bg-[#f8f9fa] rounded-b-lg border-t border-[#99a6a3]/10">
      <div className="grid grid-cols-4 gap-2">
        {images.slice(0, 4).map((img, i) => (
          <div key={i}>
            <div className="aspect-square bg-white rounded overflow-hidden border border-[#99a6a3]/20">
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-[8px] text-center mt-0.5 text-[#2a3a2f] line-clamp-1">
              {img.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AiReportPage = () => {
  const { jobId } = useParams();
  const {
    report,
    loading: isLoading,
    progress,
    streamedContent,
    generateReport,
    jobData,
  } = useReportGeneration();
  const hasStartedRef = useRef(false);
  const reportRef = useRef(null);
  const contentRef = useRef(null);
  const footerRef = useRef(null);
  const spacerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    if (jobId) generateReport(jobId);
  }, [jobId]);

  useEffect(() => {
    if (jobData)
      document.title = `${jobData.job_code || 'Report'} - ${jobData.job_title || 'Zuper'}`;
  }, [jobData]);

  // Calculate spacer height to push footer to bottom of last page
  const calculateSpacerHeight = () => {
    if (!contentRef.current || !footerRef.current || !spacerRef.current) return;

    // Reset spacer
    spacerRef.current.style.height = '0px';

    // Get heights
    const contentHeight = contentRef.current.offsetHeight;
    const footerHeight = footerRef.current.offsetHeight;
    const totalHeight = contentHeight + footerHeight;

    // Calculate pages and remaining space
    const numPages = Math.ceil(totalHeight / PAGE_HEIGHT_PX);
    const totalPagesHeight = numPages * PAGE_HEIGHT_PX;
    const remainingSpace = totalPagesHeight - totalHeight;

    // Calculate max safe spacer (ensures footer stays on same page as spacer)
    const maxSafeSpacer = PAGE_HEIGHT_PX - footerHeight - 80;

    // Set spacer height (capped to prevent extra page)
    if (remainingSpace > 30) {
      const spacerHeight = Math.min(remainingSpace - 30, maxSafeSpacer);
      if (spacerHeight > 0) {
        spacerRef.current.style.height = `${spacerHeight}px`;
      }
    }
  };

  // Listen for print events
  useEffect(() => {
    const mediaQueryList = window.matchMedia('print');

    const handlePrintChange = (e) => {
      if (e.matches) {
        calculateSpacerHeight();
      } else {
        if (spacerRef.current) {
          spacerRef.current.style.height = '0px';
        }
      }
    };

    mediaQueryList.addEventListener('change', handlePrintChange);

    const handleBeforePrint = () => {
      calculateSpacerHeight();
    };

    const handleAfterPrint = () => {
      if (spacerRef.current) {
        spacerRef.current.style.height = '0px';
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      mediaQueryList.removeEventListener('change', handlePrintChange);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    calculateSpacerHeight();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div
      className={`min-h-screen bg-[#e5e7eb] py-8 px-4 print:p-0 print:bg-white print:min-h-0 ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto bg-[#374151]' : ''}`}
    >
      {/* Controls */}
      <div className="max-w-3xl mx-auto mb-4 print:hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="text-[#99a6a3] hover:text-[#2a3a2f]"
          >
            ← Back to Jobs
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white border border-[#99a6a3]/20 rounded-lg hover:bg-slate-50 shadow-sm"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c6635] text-white rounded-lg hover:bg-[#154d28] shadow-sm font-medium"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* A4 Report Container */}
      <div
        ref={reportRef}
        className="a4-paper mx-auto bg-white shadow-2xl print:shadow-none"
        style={{
          width: A4_WIDTH_PX,
          padding: PAGE_PADDING,
        }}
      >
        {isLoading && !streamedContent ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#309346] blur-2xl opacity-20 animate-pulse rounded-full scale-150"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border border-[#1c6635]/10">
                  <Sparkles className="w-8 h-8 text-[#1c6635] animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2a3a2f]">
                  Generating Report
                </h3>
                <p className="text-[#99a6a3] text-sm mt-2">
                  {progress || 'Analyzing data...'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Content Area */}
            <div ref={contentRef} className="print-content">
              {/* ===== HEADER ===== */}
              <div className="pb-6 border-b border-[#99a6a3]/20 section-no-break">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[#1c6635] mb-3">
                      Service Inspection Report
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#99a6a3] text-xs uppercase">
                          Job #
                        </span>
                        <span className="font-bold text-lg text-[#2a3a2f]">
                          {jobData?.job_number}
                        </span>
                      </div>
                      <div className="w-px h-5 bg-[#99a6a3]/30"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#99a6a3] text-xs uppercase">
                          Date
                        </span>
                        <span className="font-semibold text-[#2a3a2f]">
                          {jobData?.scheduled_date ||
                            new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#1c6635]/10 px-3 py-1 rounded-full">
                        <div
                          className={`w-2 h-2 rounded-full ${jobData?.status === 'Completed' || jobData?.status === 'Job Completed' ? 'bg-[#309346]' : 'bg-yellow-500'}`}
                        ></div>
                        <span className="font-semibold text-[#1c6635] text-sm">
                          {jobData?.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-16 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* ===== CUSTOMER & VEHICLE ===== */}
              <div className="grid grid-cols-2 gap-5 mt-6 section-no-break">
                {/* Customer Details Card */}
                <div className="relative bg-linear-to-br from-[#1c6635] via-[#1e7a3d] to-[#2a5d3a] text-white p-5 rounded-xl shadow-lg overflow-hidden">
                  {/* Decorative background pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">
                        Customer Details
                      </h3>
                    </div>

                    <p className="font-bold text-sm mb-1">
                      {jobData?.customer?.organization ||
                        jobData?.customer?.name ||
                        'Customer'}
                    </p>
                    {jobData?.customer?.contact_person && (
                      <p className="text-white/80 text-xs mb-3">
                        Attn: {jobData.customer.contact_person}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                      {jobData?.customer?.address && (
                        <div className="flex gap-3 items-start">
                          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-white/70" />
                          </div>
                          <span className="text-xs text-white/90 leading-tight">
                            {jobData.customer.address}
                          </span>
                        </div>
                      )}
                      {jobData?.customer?.email && (
                        <div className="flex gap-3 items-center">
                          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5 text-white/70" />
                          </div>
                          <span className="text-xs text-white/90">
                            {jobData.customer.email}
                          </span>
                        </div>
                      )}
                      {jobData?.customer?.mobile && (
                        <div className="flex gap-3 items-center">
                          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5 text-white/70" />
                          </div>
                          <span className="text-xs text-white/90">
                            {jobData.customer.mobile}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Details Card */}
                <div className="relative bg-linear-to-br from-[#f8fbf9] to-[#e8f5eb] p-5 rounded-xl shadow-lg border border-[#1c6635]/10 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#1c6635]/5 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-[#1c6635]/5 rounded-full translate-y-6 -translate-x-6"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#1c6635]/10 rounded-lg flex items-center justify-center">
                        <Car className="w-4 h-4 text-[#1c6635]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#1c6635] uppercase tracking-wider">
                        Vehicle Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 rounded-lg p-2.5 border border-[#1c6635]/5">
                        <p className="text-[10px] text-[#1c6635]/60 uppercase font-medium mb-0.5">
                          Brand
                        </p>
                        <p className="font-bold text-xs text-[#2a3a2f]">
                          {jobData?.asset?.brand || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 border border-[#1c6635]/5">
                        <p className="text-[10px] text-[#1c6635]/60 uppercase font-medium mb-0.5">
                          Model
                        </p>
                        <p className="font-bold text-xs text-[#2a3a2f]">
                          {jobData?.asset?.model ||
                            jobData?.asset?.type ||
                            'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 border border-[#1c6635]/5">
                        <p className="text-[10px] text-[#1c6635]/60 uppercase font-medium mb-0.5">
                          Serial Number
                        </p>
                        <p className="font-bold text-xs text-[#2a3a2f] font-mono">
                          {jobData?.asset?.serial_number || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2.5 border border-[#1c6635]/5">
                        <p className="text-[10px] text-[#1c6635]/60 uppercase font-medium mb-0.5">
                          Inspected On
                        </p>
                        <p className="font-bold text-xs text-[#2a3a2f]">
                          {jobData?.scheduled_date || new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== AI CONTENT ===== */}
              <div className="mt-6 max-w-none text-xs text-[#2a3a2f]/80">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h2: (props) => (
                      <div className="flex items-center gap-2 mt-5 mb-3 pb-2 border-b border-[#99a6a3]/20">
                        <div className="w-1 h-5 bg-[#309346] rounded-full"></div>
                        <h2
                          className="text-sm font-bold text-[#1c6635] m-0"
                          {...props}
                        />
                      </div>
                    ),
                    p: (props) => (
                      <p
                        className="text-xs text-[#2a3a2f]/80 mb-2 leading-relaxed"
                        {...props}
                      />
                    ),
                    ul: (props) => (
                      <ul className="space-y-1 my-2 pl-2" {...props} />
                    ),
                    li: ({ children, ...props }) => (
                      <li className="flex gap-2 my-0.5 text-xs" {...props}>
                        <span className="mt-1.5 w-1 h-1 bg-[#99a6a3] rounded-full shrink-0"></span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: (props) => (
                      <strong
                        className="font-semibold text-[#2a3a2f]"
                        {...props}
                      />
                    ),
                  }}
                >
                  {report?.content || streamedContent}
                </ReactMarkdown>
              </div>

              {/* ===== INSPECTION SECTIONS ===== */}
              {jobData?.inspection && (
                <div className="mt-8 space-y-4">
                  {/* Battery Report */}
                  {jobData.inspection.batteries?.length > 0 && (
                    <div className="section-no-break border border-[#99a6a3]/20 rounded-lg overflow-hidden">
                      <div className="bg-[#1c6635] text-white px-3 py-2">
                        <h3 className="font-bold text-xs uppercase">
                          Battery Report
                        </h3>
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-[#f8f9fa]">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-bold text-[10px] uppercase">
                              Battery
                            </th>
                            <th className="px-3 py-1.5 text-center font-bold text-[10px] uppercase">
                              Voltage
                            </th>
                            <th className="px-3 py-1.5 text-center font-bold text-[10px] uppercase">
                              Charge
                            </th>
                            <th className="px-3 py-1.5 text-center font-bold text-[10px] uppercase">
                              Health
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobData.inspection.batteries.map((b, i) => (
                            <tr
                              key={i}
                              className="border-t border-[#99a6a3]/10"
                            >
                              <td className="px-3 py-1.5 font-medium">
                                Battery {b.number}
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                {b.voltage}
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                {b.stateOfCharge}
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                {b.stateOfHealth}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <SectionImages
                        images={getImagesByCategory(
                          jobData?.inspection?.images,
                          'battery',
                        )}
                      />
                    </div>
                  )}

                  {/* Electrics */}
                  {jobData.inspection.electrics &&
                    Object.values(jobData.inspection.electrics).some(
                      (v) => v,
                    ) && (
                      <div className="section-no-break border border-[#99a6a3]/20 rounded-lg overflow-hidden">
                        <div className="bg-[#1c6635] text-white px-3 py-2">
                          <h3 className="font-bold text-xs uppercase">
                            Electrics & Lights
                          </h3>
                        </div>
                        <div className="divide-y divide-[#99a6a3]/10">
                          {Object.entries(jobData.inspection.electrics)
                            .filter(([, v]) => v)
                            .map(([k, v], i) => (
                              <div
                                key={i}
                                className="bg-white px-3 py-1.5 flex text-xs"
                              >
                                <span className="font-medium text-[#2a3a2f] w-1/2">
                                  {k
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[#2a3a2f]/70 w-1/2">
                                  {v}
                                </span>
                              </div>
                            ))}
                        </div>
                        <SectionImages
                          images={getImagesByCategory(
                            jobData?.inspection?.images,
                            'electrics',
                          )}
                        />
                      </div>
                    )}

                  {/* Steering */}
                  {jobData.inspection.steering &&
                    Object.values(jobData.inspection.steering).some(
                      (v) => v,
                    ) && (
                      <div className="section-no-break border border-[#99a6a3]/20 rounded-lg overflow-hidden">
                        <div className="bg-[#1c6635] text-white px-3 py-2">
                          <h3 className="font-bold text-xs uppercase">
                            Steering & Suspension
                          </h3>
                        </div>
                        <div className="divide-y divide-[#99a6a3]/10">
                          {Object.entries(jobData.inspection.steering)
                            .filter(([, v]) => v)
                            .map(([k, v], i) => (
                              <div
                                key={i}
                                className="bg-white px-3 py-1.5 flex text-xs"
                              >
                                <span className="font-medium text-[#2a3a2f] w-1/2">
                                  {k
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[#2a3a2f]/70 w-1/2">
                                  {v}
                                </span>
                              </div>
                            ))}
                        </div>
                        <SectionImages
                          images={getImagesByCategory(
                            jobData?.inspection?.images,
                            'steering',
                          )}
                        />
                      </div>
                    )}

                  {/* Brakes */}
                  {jobData.inspection.brakesWheels &&
                    Object.values(jobData.inspection.brakesWheels).some(
                      (v) => v,
                    ) && (
                      <div className="section-no-break border border-[#99a6a3]/20 rounded-lg overflow-hidden">
                        <div className="bg-[#1c6635] text-white px-3 py-2">
                          <h3 className="font-bold text-xs uppercase">
                            Brakes & Wheels
                          </h3>
                        </div>
                        <div className="divide-y divide-[#99a6a3]/10">
                          {Object.entries(jobData.inspection.brakesWheels)
                            .filter(([, v]) => v)
                            .map(([k, v], i) => (
                              <div
                                key={i}
                                className="bg-white px-3 py-1.5 flex text-xs"
                              >
                                <span className="font-medium text-[#2a3a2f] w-1/2">
                                  {k
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[#2a3a2f]/70 w-1/2">
                                  {v}
                                </span>
                              </div>
                            ))}
                        </div>
                        <SectionImages
                          images={getImagesByCategory(
                            jobData?.inspection?.images,
                            'brakes',
                          )}
                        />
                      </div>
                    )}

                  {/* Bodywork */}
                  {jobData.inspection.bodywork &&
                    Object.values(jobData.inspection.bodywork).some(
                      (v) => v,
                    ) && (
                      <div className="section-no-break border border-[#99a6a3]/20 rounded-lg overflow-hidden">
                        <div className="bg-[#1c6635] text-white px-3 py-2">
                          <h3 className="font-bold text-xs uppercase">
                            Bodywork
                          </h3>
                        </div>
                        <div className="divide-y divide-[#99a6a3]/10">
                          {Object.entries(jobData.inspection.bodywork)
                            .filter(([, v]) => v)
                            .map(([k, v], i) => (
                              <div
                                key={i}
                                className="bg-white px-3 py-1.5 flex text-xs"
                              >
                                <span className="font-medium text-[#2a3a2f] w-1/2">
                                  {k
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[#2a3a2f]/70 w-1/2">
                                  {v}
                                </span>
                              </div>
                            ))}
                        </div>
                        <SectionImages
                          images={getImagesByCategory(
                            jobData?.inspection?.images,
                            'bodywork',
                          )}
                        />
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Dynamic Spacer - Height set by JavaScript */}
            <div
              ref={spacerRef}
              className="print-spacer"
              style={{ height: 0 }}
            ></div>

            {/* ===== FOOTER ===== */}
            <div
              ref={footerRef}
              className="mt-8 pt-8 print:mt-4 print:pt-4 print-footer section-no-break"
            >
              <div className="border-t-2 border-[#1c6635] pt-4 mb-4">
                <h3 className="font-bold text-[#1c6635] text-xs uppercase mb-3">
                  Technician Sign-Off
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-[#99a6a3] uppercase">
                      Technician
                    </p>
                    <p className="font-bold text-xs text-[#2a3a2f]">
                      {jobData?.technician?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#99a6a3] uppercase">
                      Date Completed
                    </p>
                    <p className="font-bold text-xs text-[#2a3a2f]">
                      {jobData?.scheduled_date ||
                        new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[#2a3a2f] text-white p-4 rounded-lg">
                <div className="flex justify-between items-center text-xs opacity-80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#309346]" />
                    <span className="font-medium">The Golf Buggy Guy</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Generated: {new Date().toLocaleDateString()}</span>
                    <span className="font-mono text-[10px] border border-white/20 px-2 py-0.5 rounded">
                      ID: {jobId?.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isLoading && streamedContent && (
          <div className="flex items-center gap-2 text-[#99a6a3] justify-center p-4 print:hidden">
            <Loader2 className="w-4 h-4 animate-spin text-[#309346]" />
            <span className="text-sm">Generating...</span>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .a4-paper {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 25mm 15mm 15mm 15mm; /* top right bottom left - more top margin */
          }
          
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .a4-paper {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          
          .print-footer {
            margin-top: 0 !important;
            padding-top: 15px !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .print-spacer {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Prevent sections from breaking across pages */
          .section-no-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            orphans: 3 !important;
            widows: 3 !important;
          }

          /* Customer & Vehicle cards should stay together */
          .grid.grid-cols-2 {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Major sections should avoid breaking */
          h2, h3 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          /* Tables should stay together */
          table {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Prevent extra blank page */
          html, body {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          .min-h-screen {
            min-height: 0 !important;
          }

          .a4-paper {
            min-height: 0 !important;
          }

          .a4-paper > *:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }

          /* Spacer - balanced to push footer down without extra page */
          .print-spacer {
            display: block !important;
            max-height: 230px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AiReportPage;
