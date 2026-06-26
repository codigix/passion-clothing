import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaSave, FaCheck, FaCloudUploadAlt, FaFileAlt, FaCheckCircle,
  FaTimesCircle, FaTrash, FaSpinner, FaPlus, FaUserAlt,
  FaBoxOpen, FaCogs, FaLayerGroup, FaPaperclip, FaTruck,
  FaCoins, FaStickyNote, FaClipboardCheck, FaInfoCircle,
  FaChevronLeft, FaChevronRight, FaBuilding, FaTag, FaClipboardList
} from 'react-icons/fa';
import { Loader, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CONFIGURATION
───────────────────────────────────────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  Clothing: {
    icon: '👔',
    color: 'indigo',
    sectionTitle: 'Clothing Details',
    productFields: [
      { field: 'garment_type', label: 'Garment Type', placeholder: 'e.g. T-Shirt, Polo, Hoodie, Jacket, Trouser' },
      { field: 'fabric_type', label: 'Fabric Type', placeholder: 'e.g. Cotton, Polyester, Fleece, Denim, Nylon' },
      { field: 'fabric_gsm', label: 'Fabric GSM', placeholder: 'e.g. 180 GSM, 240 GSM, 320 GSM' },
      { field: 'fabric_composition', label: 'Fabric Composition', placeholder: 'e.g. 100% Cotton, 60% Cotton 40% Polyester' },
      { field: 'color', label: 'Color', placeholder: 'e.g. Navy Blue, Black, White, Pantone 286C' },
      { field: 'pattern', label: 'Pattern', type: 'select', options: ['Solid / Plain', 'Stripe', 'Check', 'Print', 'Melange', 'Camo', 'Other'] },
      { field: 'fit_type', label: 'Fit', type: 'select', options: ['Regular Fit', 'Slim Fit', 'Oversized', 'Relaxed Fit', 'Athletic Fit'] },
      { field: 'sleeve_type', label: 'Sleeve Type', type: 'select', options: ['Full Sleeve', 'Half Sleeve', 'Sleeveless', '3/4 Sleeve', 'Raglan', 'Other'] },
      { field: 'neck_type', label: 'Neck Type', type: 'select', options: ['Round Neck', 'V-Neck', 'Polo Collar', 'Mandarin', 'Hoodie', 'No Collar', 'Other'] },
      { field: 'printing', label: 'Printing', type: 'select', options: ['No Printing', 'Screen Print', 'Sublimation', 'DTG Print', 'Heat Transfer', 'Digital Print'] },
      { field: 'embroidery', label: 'Embroidery', type: 'select', options: ['No Embroidery', 'Logo Embroidery', 'Text Embroidery', 'Full Patch', 'Woven Patch'] },
      { field: 'label_type', label: 'Label Type', type: 'select', options: ['Woven Label', 'Printed Label', 'Heat Transfer Label', 'Hang Tag Only', 'No Label'] },
    ],
    technicalFields: [
      { field: 'wash_care', label: 'Wash Care Instruction', placeholder: 'e.g. Machine wash cold, Do not bleach' },
      { field: 'stitching_type', label: 'Stitching Type', type: 'select', options: ['Single Stitch', 'Double Stitch', 'Overlock', 'Flatlock', 'Chain Stitch'] },
      { field: 'thread_count', label: 'Thread Count / TPM', placeholder: 'e.g. 40/2 thread, 12 TPI' },
      { field: 'shrinkage_tolerance', label: 'Shrinkage Tolerance', placeholder: 'e.g. ±3%' },
    ],
    mfgRequirements: ['Screen Printing', 'Embroidery', 'Sublimation Printing', 'Heat Transfer', 'Woven Label', 'Hang Tags', 'Poly Bag Packing', 'Barcode / UPC'],
    variantColumns: ['Size (S / M / L / XL)', 'Colour', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Small, Medium, XL', 'e.g. Navy Blue', '0', 'Pcs'],
  },
  Bottles: {
    icon: '🍶',
    color: 'cyan',
    sectionTitle: 'Bottle Details',
    productFields: [
      { field: 'bottle_type', label: 'Bottle Type', placeholder: 'e.g. Water Bottle, Sipper, Flask, Tumbler, Mug' },
      { field: 'capacity', label: 'Capacity', placeholder: 'e.g. 500 ml, 750 ml, 1 L, 2 L' },
      { field: 'material', label: 'Material', type: 'select', options: ['SS304', 'SS316', 'SS316L', 'Borosilicate Glass', 'BPA-Free Plastic', 'Tritan', 'Aluminium', 'Copper', 'Other'] },
      { field: 'bottle_color', label: 'Bottle Color', placeholder: 'e.g. Matte Black, Glossy White, Rose Gold' },
      { field: 'cap_type', label: 'Cap Type', type: 'select', options: ['Screw Cap', 'Flip Lid', 'Straw Lid', 'Press Button', 'Bamboo Cap', 'Infuser Lid', 'Sports Cap', 'Other'] },
      { field: 'cap_color', label: 'Cap Color', placeholder: 'e.g. Black, Silver, Matching body color' },
      { field: 'neck_size', label: 'Neck Size', placeholder: 'e.g. 38 mm wide mouth, 24 mm narrow mouth' },
      { field: 'printing_type', label: 'Printing Type', type: 'select', options: ['No Printing', 'Laser Engraving', 'Pad Printing', 'UV Printing', 'Silkscreen', 'Custom Label'] },
      { field: 'label_type', label: 'Label Type', type: 'select', options: ['No Label', 'Adhesive Label', 'Shrink Sleeve', 'Hang Tag', 'Engraved Only'] },
      { field: 'food_grade', label: 'Food Grade', type: 'select', options: ['FDA Approved', 'LFGB Certified', 'BPA Free', 'ISO 22000', 'Not Required'] },
    ],
    technicalFields: [
      { field: 'leak_test', label: 'Leak Test Standard', placeholder: 'e.g. 30 min water test, 0.3 bar pressure' },
      { field: 'temp_retention', label: 'Temperature Retention', placeholder: 'e.g. Hot 12 hr / Cold 24 hr' },
      { field: 'drop_test', label: 'Drop Test Requirement', placeholder: 'e.g. 1.2 m drop test, 10 times' },
      { field: 'wall_thickness', label: 'Wall Thickness', placeholder: 'e.g. 0.6 mm inner, 0.6 mm outer' },
    ],
    mfgRequirements: ['Blow Moulding', 'Powder Coating', 'Laser Engraving', 'Pad Printing', 'UV Printing', 'Silkscreen Print', 'Electrolytic Polishing', 'Pressure Testing'],
    variantColumns: ['Capacity (ml / L)', 'Colour / Finish', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. 500 ml', 'e.g. Matte Black', '0', 'Pcs'],
  },
  'Stationery / Books': {
    icon: '📚',
    color: 'amber',
    sectionTitle: 'Stationery / Books Details',
    productFields: [
      { field: 'stationery_product_type', label: 'Product Type', placeholder: 'e.g. Notebook, Diary, Notepad, Register, Planner' },
      { field: 'paper_type', label: 'Paper Type', type: 'select', options: ['Offset Paper', 'Bond Paper', 'Recycled Paper', 'Art Paper', 'Kraft Paper', 'Tracing Paper', 'Other'] },
      { field: 'paper_gsm', label: 'Paper GSM', placeholder: 'e.g. 70 GSM, 90 GSM, 100 GSM' },
      { field: 'page_count', label: 'Page Count', placeholder: 'e.g. 100 pages, 200 pages, 240 pages' },
      { field: 'binding_type', label: 'Binding', type: 'select', options: ['Spiral / Wire-O', 'Perfect Binding', 'Saddle Stitch', 'Case Bound', 'PUR Binding', 'Soft Cover', 'Hard Cover'] },
      { field: 'cover_lamination', label: 'Lamination', type: 'select', options: ['Matte Lamination', 'Gloss Lamination', 'Soft Touch', 'Aqueous Coating', 'UV Spot', 'None'] },
      { field: 'printing_colors', label: 'Printing Colors', type: 'select', options: ['Full Colour (CMYK)', '1 Colour', '2 Colour', 'Black & White', 'Pantone Spot'] },
    ],
    technicalFields: [
      { field: 'ink_type', label: 'Ink Type', placeholder: 'e.g. Vegetable based, UV ink, Soy ink' },
      { field: 'finishing', label: 'Special Finishing', placeholder: 'e.g. Foil stamping, Embossing, Debossing' },
      { field: 'environmental_cert', label: 'Environmental Certification', placeholder: 'e.g. FSC Certified, PEFC, Recycled paper' },
    ],
    mfgRequirements: ['Offset Printing', 'Digital Printing', 'UV Coating', 'Foil Stamping', 'Embossing / Debossing', 'Die Cutting', 'Spiral Binding', 'Shrink Wrapping'],
    variantColumns: ['Type / Style', 'Size', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Ruled Notebook', 'e.g. A5', '0', 'Pcs'],
  },
  Bags: {
    icon: '👜',
    color: 'rose',
    sectionTitle: 'Bag Details',
    productFields: [
      { field: 'bag_type', label: 'Bag Type', placeholder: 'e.g. Backpack, Tote Bag, Laptop Bag, Sling Bag, Drawstring' },
      { field: 'bag_material', label: 'Material', placeholder: 'e.g. 600D Polyester, Nylon, Canvas, Leather, PU' },
      { field: 'bag_size', label: 'Size (L × W × H)', placeholder: 'e.g. 40 × 30 × 15 cm, 16 inch' },
      { field: 'compartments', label: 'Compartments', placeholder: 'e.g. 1 main + 2 front pockets + side mesh' },
      { field: 'handle_type', label: 'Handle Type', type: 'select', options: ['Top Handle', 'Single Shoulder Strap', 'Double Shoulder / Backpack', 'Cross Body', 'Detachable', 'No Handle'] },
      { field: 'zip_type', label: 'Zip Type', type: 'select', options: ['YKK Zipper', 'Metal Zipper', 'Plastic Zipper', 'Magnetic Snap', 'No Zip', 'Drawstring'] },
      { field: 'printing', label: 'Printing', type: 'select', options: ['No Printing', 'Screen Print', 'Embroidery', 'Heat Transfer', 'Laser Engraving', 'Woven Patch'] },
      { field: 'branding', label: 'Branding', placeholder: 'e.g. Logo on front pocket, brand name on strap' },
    ],
    technicalFields: [
      { field: 'load_capacity', label: 'Load Bearing Capacity', placeholder: 'e.g. Max 10 kg, 15 kg' },
      { field: 'water_resistance', label: 'Water Resistance', type: 'select', options: ['Not Required', 'Water Resistant (DWR)', 'Waterproof (TPU Laminated)', 'Fully Waterproof'] },
      { field: 'logo_technique', label: 'Logo Technique', type: 'select', options: ['Embroidery', 'Screen Print', 'Heat Transfer', 'Woven Patch', 'Laser Engraving', 'Metal Badge'] },
    ],
    mfgRequirements: ['Cut & Sew', 'Embroidery', 'Screen Printing', 'Heat Transfer', 'Metal Hardware Fitting', 'Piping / Edging', 'Custom Labels', 'Poly Bag Packing'],
    variantColumns: ['Style / Model', 'Colour', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Backpack 15"', 'e.g. Black', '0', 'Pcs'],
  },
  'Promotional / Gifting': {
    icon: '🎁',
    color: 'pink',
    sectionTitle: 'Promotional / Gifting Details',
    productFields: [
      { field: 'promo_product_type', label: 'Product Type', placeholder: 'e.g. Pen, Mug, Keychain, Diary, Cap, Bottle' },
      { field: 'promo_material', label: 'Material', placeholder: 'e.g. Stainless Steel, Plastic, Leather, Wood, Fabric' },
      { field: 'branding', label: 'Branding', placeholder: 'e.g. Company logo + tagline on front face' },
      { field: 'logo_position', label: 'Logo Position', placeholder: 'e.g. Front centre, Bottom, Sleeve, Lid top' },
      { field: 'printing_method', label: 'Printing Method', type: 'select', options: ['Laser Engraving', 'Pad Printing', 'UV Printing', 'Embroidery', 'Debossing', 'Foil Stamping', 'Screen Print', 'No Branding'] },
      { field: 'gift_box', label: 'Gift Box', type: 'select', options: ['No Box', 'Standard Gift Box', 'Magnetic Closure Box', 'Kraft Box', 'Wooden Box', 'Custom Designed Box'] },
      { field: 'packaging', label: 'Packaging', type: 'select', options: ['Poly Bag', 'Individual Box', 'Kraft Box Set', 'Tissue + Ribbon', 'Shrink Wrap', 'Custom Packaging'] },
    ],
    technicalFields: [
      { field: 'compliance_cert', label: 'Compliance / Safety Standard', placeholder: 'e.g. CE, RoHS, REACH, BIS, BPA Free' },
      { field: 'age_group', label: 'Target Age Group', type: 'select', options: ['All Ages', 'Children (3+)', 'Teens', 'Adults', 'Corporate'] },
      { field: 'lead_time_note', label: 'Lead Time Sensitivity', type: 'select', options: ['Standard', 'Urgent (Rush Order)', 'Pre-planned (>30 days)'] },
    ],
    mfgRequirements: ['Laser Engraving', 'UV Printing', 'Pad Printing', 'Individual Packaging', 'Kitting & Assembly', 'Gift Wrapping', 'Insertion Card Printing', 'Quality Check Per Piece'],
    variantColumns: ['Item / SKU', 'Personalisation', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Vacuum Bottle', 'e.g. Name Print', '0', 'Pcs'],
  },
  'Industrial Parts': {
    icon: '⚙️',
    color: 'slate',
    sectionTitle: 'Industrial Part Details',
    productFields: [
      { field: 'part_number', label: 'Part Number', placeholder: 'e.g. P-2024-001, PN-ABC-123' },
      { field: 'assembly_number', label: 'Assembly Number', placeholder: 'e.g. ASM-001, Sub-assembly A3' },
      { field: 'drawing_number', label: 'Drawing Number', placeholder: 'e.g. DWG-2024-001' },
      { field: 'revision', label: 'Revision', placeholder: 'e.g. Rev A, Rev B, Rev C' },
      { field: 'material', label: 'Material', placeholder: 'e.g. SS304, MS IS 2062, EN31, Aluminium 6061' },
      { field: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 150 × 50 × 30 mm, Dia 25 × 120 mm' },
      { field: 'weight', label: 'Weight', placeholder: 'e.g. 250 g per piece, 1.2 kg' },
      { field: 'surface_finish', label: 'Surface Finish', type: 'select', options: ['None / Raw', 'Zinc Plating', 'Electroless Nickel', 'Hard Chrome', 'Black Oxide', 'Anodising', 'Powder Coating', 'Painting', 'Other'] },
      { field: 'tolerance', label: 'Tolerance', placeholder: 'e.g. ±0.1 mm, IT7, H7/g6' },
      { field: 'manufacturing_process', label: 'Manufacturing Process', placeholder: 'e.g. CNC Turning, CNC Milling, Casting, Forging, Fabrication' },
      { field: 'heat_treatment', label: 'Heat Treatment', type: 'select', options: ['None', 'Annealing', 'Quench & Temper', 'Case Hardening', 'Normalising', 'Stress Relieving', 'Induction Hardening'] },
    ],
    technicalFields: [
      { field: 'raw_material_spec', label: 'Raw Material Specification', placeholder: 'e.g. IS 2062 E250, AISI 4140, EN31' },
      { field: 'welding_standard', label: 'Welding Standard (if applicable)', placeholder: 'e.g. AWS D1.1, IS 816, ISO 5817' },
      { field: 'ndt_requirement', label: 'NDT / Testing Requirement', placeholder: 'e.g. UT, MPT, LPT, RT, Hydrostatic test' },
      { field: 'fatigue_requirement', label: 'Fatigue / Load Requirement', placeholder: 'e.g. 10,000 cycles at 500 N' },
    ],
    mfgRequirements: ['CNC Turning', 'CNC Milling', 'Wire EDM', 'Grinding', 'Welding / Fabrication', 'Heat Treatment', 'Electroplating', 'NDT Testing'],
    variantColumns: ['Part No. / Rev', 'Material Grade', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. P-001-Rev B', 'e.g. SS304', '0', 'Nos'],
  },
  'Custom Product': {
    icon: '🔧',
    color: 'teal',
    sectionTitle: 'Custom Product Details',
    productFields: [
      { field: 'product_description_detailed', label: 'Product Description', placeholder: 'Describe the product in as much detail as possible — shape, function, use case...', type: 'textarea' },
      { field: 'custom_material', label: 'Material', placeholder: 'e.g. Plastic, Metal, Fabric, Wood, Mixed material' },
      { field: 'custom_size', label: 'Size', placeholder: 'e.g. 200 × 150 × 50 mm, A4 size, 10 inch' },
      { field: 'custom_weight', label: 'Weight', placeholder: 'e.g. Approx. 500 g, less than 1 kg' },
      { field: 'custom_color', label: 'Color', placeholder: 'e.g. Black, White, Custom pantone, As per sample' },
      { field: 'technical_notes', label: 'Technical Notes', placeholder: 'Any tolerance, strength, compliance, IP, or process requirements...', type: 'textarea' },
    ],
    technicalFields: [
      { field: 'key_challenge', label: 'Key Technical Challenge', placeholder: 'Describe any technical constraint or challenge' },
      { field: 'existing_supplier', label: 'Existing Supplier (if switching)', placeholder: 'Name of current supplier if applicable' },
      { field: 'annual_requirement', label: 'Annual Requirement (Forecast)', placeholder: 'e.g. 5,000 units/year, seasonal' },
    ],
    mfgRequirements: ['Design Assistance', 'Prototype Development', 'Tooling / Mould Making', 'Pilot Production', 'Quality Validation', 'Packaging Design', 'Compliance Testing', 'IP Documentation'],
    variantColumns: ['Variant / SKU', 'Specification', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Variant A', 'e.g. Custom spec', '0', 'Pcs'],
  },
  Others: {
    icon: '📦',
    color: 'indigo',
    sectionTitle: 'Product Details',
    productFields: [
      { field: 'other_description', label: 'Product Description', placeholder: 'Describe the product...', type: 'textarea' },
      { field: 'other_material', label: 'Material', placeholder: 'e.g. Plastic, Metal, Fabric' },
      { field: 'other_size', label: 'Size / Dimensions', placeholder: 'e.g. 200 × 100 mm' },
      { field: 'other_color', label: 'Color', placeholder: 'e.g. Black, White' },
      { field: 'other_weight', label: 'Weight', placeholder: 'e.g. 300 g per unit' },
    ],
    technicalFields: [],
    mfgRequirements: [],
    variantColumns: ['Variant / SKU', 'Specification', 'Qty', 'Unit'],
    variantPlaceholders: ['e.g. Variant A', 'e.g. Custom spec', '0', 'Pcs'],
  },
};

const ALL_CATEGORIES = ['Clothing', 'Custom Product', 'Others'];

const OTHER_CATEGORY_FIELDS = [
  { field: 'other_description', label: 'Product Description', placeholder: 'Describe the product...', type: 'textarea' },
  { field: 'other_material', label: 'Material', placeholder: 'e.g. Plastic, Metal, Fabric' },
  { field: 'other_size', label: 'Size / Dimensions', placeholder: 'e.g. 200 × 100 mm' },
  { field: 'other_color', label: 'Color', placeholder: 'e.g. Black, White' },
  { field: 'other_weight', label: 'Weight', placeholder: 'e.g. 300 g per unit' },
];

const PAYMENT_TERMS = ['Advance 100%', '50% Advance, 50% on Delivery', '30 days credit', '45 days credit', '60 days credit', 'LC at sight', 'As per agreement'];
const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP', 'FCA', 'CPT', 'CFR'];
const CURRENCIES = ['INR ₹', 'USD $', 'EUR €', 'GBP £', 'AED د.إ'];

/* ─────────────────────────────────────────────────────────────────────────────
   COLOUR MAP
───────────────────────────────────────────────────────────────────────────── */
const COLOR_CLASSES = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'focus:ring-indigo-100 focus:border-indigo-500', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', gradient: 'from-indigo-50 to-purple-50', icon: 'text-indigo-600' },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   ring: 'focus:ring-cyan-100 focus:border-cyan-500',   badge: 'bg-cyan-100 text-cyan-700',   btn: 'bg-cyan-600 hover:bg-cyan-700',   gradient: 'from-cyan-50 to-sky-50',   icon: 'text-cyan-600' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: 'focus:ring-amber-100 focus:border-amber-500',  badge: 'bg-amber-100 text-amber-700',  btn: 'bg-amber-600 hover:bg-amber-700',  gradient: 'from-amber-50 to-yellow-50',  icon: 'text-amber-600' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: 'focus:ring-rose-100 focus:border-rose-500',   badge: 'bg-rose-100 text-rose-700',   btn: 'bg-rose-600 hover:bg-rose-700',   gradient: 'from-rose-50 to-pink-50',   icon: 'text-rose-600' },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   ring: 'focus:ring-pink-100 focus:border-pink-500',   badge: 'bg-pink-100 text-pink-700',   btn: 'bg-pink-600 hover:bg-pink-700',   gradient: 'from-pink-50 to-rose-50',   icon: 'text-pink-600' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  ring: 'focus:ring-slate-100 focus:border-slate-500',  badge: 'bg-slate-100 text-slate-700',  btn: 'bg-slate-700 hover:bg-slate-800',  gradient: 'from-slate-50 to-gray-100',  icon: 'text-slate-600' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   ring: 'focus:ring-teal-100 focus:border-teal-500',   badge: 'bg-teal-100 text-teal-700',   btn: 'bg-teal-600 hover:bg-teal-700',   gradient: 'from-teal-50 to-emerald-50',   icon: 'text-teal-600' },
};

/* ─────────────────────────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'customer',   label: 'Customer & Enquiry', icon: <FaUserAlt /> },
  { id: 'product',    label: 'Product',     icon: <FaBoxOpen /> },
  { id: 'delivery',   label: 'Delivery',    icon: <FaTruck /> },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER: DynamicField
───────────────────────────────────────────────────────────────────────────── */
const DynamicField = ({ fieldDef, value, onChange, ring }) => {
  const baseClass = `w-full px-3 py-2 rounded-lg border border-gray-300 outline-none transition text-sm ${ring}`;

  if (fieldDef.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(e.target.value)} className={`${baseClass} bg-white`}>
        <option value="">Select {fieldDef.label}...</option>
        {fieldDef.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (fieldDef.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={fieldDef.placeholder}
        className={`${baseClass} resize-none`}
        rows={3}
      />
    );
  }
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={fieldDef.placeholder}
      className={baseClass}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   CLOTHING DETAILS SECTION
───────────────────────────────────────────────────────────────────────────── */
const CLOTHING_COLORS = [
  'White', 'Black', 'Navy Blue', 'Royal Blue', 'Sky Blue', 'Red', 'Maroon', 'Burgundy',
  'Green', 'Bottle Green', 'Olive', 'Yellow', 'Orange', 'Pink', 'Lavender', 'Purple',
  'Grey', 'Charcoal', 'Brown', 'Beige', 'Cream', 'Khaki', 'Teal', 'Mint',
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const PRODUCT_TYPE_FIELDS = {
  'T-Shirt': ['fit', 'sleeve_type', 'neck_type', 'fabric_type', 'fabric_gsm', 'fabric_composition', 'colors', 'sizes', 'printing'],
  'Polo T-Shirt': ['fit', 'sleeve_type', 'collar_type', 'fabric_type', 'fabric_gsm', 'fabric_composition', 'colors', 'sizes', 'printing'],
  'Shirt': ['fit', 'sleeve_type', 'collar_type', 'cuff_type', 'fabric_type', 'fabric_gsm', 'fabric_composition', 'colors', 'sizes'],
  'Formal Shirt': ['fit', 'sleeve_type', 'collar_type', 'cuff_type', 'fabric_type', 'fabric_gsm', 'fabric_composition', 'colors', 'sizes'],
  'Hoodie': ['fit', 'hood_type', 'sleeve_type', 'pocket_type', 'fabric_type', 'fabric_gsm', 'colors', 'sizes'],
  'Sweatshirt': ['fit', 'sleeve_type', 'neck_type', 'fabric_type', 'fabric_gsm', 'colors', 'sizes'],
  'Jacket': ['fit', 'sleeve_type', 'closure_type', 'lining', 'fabric_type', 'fabric_gsm', 'colors', 'sizes'],
  'Trouser': ['fit', 'waist', 'length', 'fabric_type', 'fabric_gsm', 'colors', 'sizes'],
  'Jeans': ['fit', 'waist_size', 'length', 'rise', 'stretch_type', 'fabric_gsm', 'fabric_composition', 'colors'],
  'Shorts': ['fit', 'waist_size', 'length', 'fabric_type', 'fabric_gsm', 'colors'],
  'Track Pant': ['fit', 'waist_size', 'length', 'fabric_type', 'fabric_gsm', 'colors'],
  'Jogger': ['fit', 'waist_size', 'ankle_style', 'fabric_type', 'fabric_gsm', 'colors'],
  'Uniform': ['fit', 'department', 'fabric_type', 'fabric_gsm', 'logo', 'colors'],
  'Safety Wear': ['reflective_type', 'fabric_type', 'fabric_gsm', 'safety_standard', 'colors'],
  'Kurti': ['neck_type', 'sleeve_type', 'length', 'fabric_type', 'fabric_gsm', 'colors'],
  'Saree': ['fabric_type', 'length', 'border_type', 'blouse_piece', 'colors'],
  'Blazer': ['fit', 'lapel_type', 'sleeve_type', 'fabric_type', 'fabric_gsm', 'lining'],
  'Other': ['custom_fields']
};

const ClothingDetailsSection = ({ data, onChange }) => {
  const set = (field, val) => onChange({ ...data, [field]: val });

  /* toggle a color in the multi-select array */
  const toggleColor = (color) => {
    const colors = data.colors || [];
    set('colors', colors.includes(color) ? colors.filter(c => c !== color) : [...colors, color]);
  };

  /* handle custom color input */
  const [colorInput, setColorInput] = useState('');
  const addCustomColor = () => {
    const trimmed = colorInput.trim();
    if (!trimmed) return;
    const colors = data.colors || [];
    if (!colors.includes(trimmed)) set('colors', [...colors, trimmed]);
    setColorInput('');
  };

  /* toggle a size checkbox and keep size_breakdown in sync */
  const toggleSize = (size) => {
    const checked = data.sizes_required || {};
    const newChecked = { ...checked, [size]: !checked[size] };
    // rebuild size_breakdown to only contain checked sizes
    const breakdown = data.size_breakdown || {};
    const newBreakdown = {};
    ALL_SIZES.forEach(s => { if (newChecked[s]) newBreakdown[s] = breakdown[s] || ''; });
    onChange({ ...data, sizes_required: newChecked, size_breakdown: newBreakdown });
  };

  /* update qty in size breakdown */
  const setBreakdownQty = (size, qty) => {
    const breakdown = { ...(data.size_breakdown || {}), [size]: qty };
    set('size_breakdown', breakdown);
  };

  /* toggle a printing method */
  const togglePrint = (method) => {
    const printing = data.printing_required || {};
    set('printing_required', { ...printing, [method]: !printing[method] });
  };

  /* Custom fields list management */
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');
  const addCustomField = () => {
    if (!customKey.trim()) return;
    const fields = data.custom_fields || [];
    set('custom_fields', [...fields, { label: customKey.trim(), value: customVal.trim() }]);
    setCustomKey('');
    setCustomVal('');
  };
  const removeCustomField = (index) => {
    const fields = data.custom_fields || [];
    set('custom_fields', fields.filter((_, idx) => idx !== index));
  };

  const checkedSizes = ALL_SIZES.filter(s => (data.sizes_required || {})[s]);
  const checkedPrints = Object.entries(data.printing_required || {}).filter(([, v]) => v).map(([k]) => k);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm bg-white font-medium';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-2';

  const productType = data.product_type || '';
  const visibleFields = PRODUCT_TYPE_FIELDS[productType] || [];
  const showField = (field) => visibleFields.includes(field);

  return (
    <div className="space-y-6">

      {/* ── Product Type (Always Visible) ── */}
      <div>
        <label className={labelCls}>Product Type <span className="text-red-500">*</span></label>
        <select value={data.product_type || ''} onChange={e => set('product_type', e.target.value)} className={inputCls}>
          <option value="">Select product type...</option>
          {['T-Shirt','Polo T-Shirt','Shirt','Formal Shirt','Hoodie','Sweatshirt','Jacket',
            'Trouser','Jeans','Shorts','Track Pant','Jogger','Uniform','Safety Wear',
            'Kurti','Saree','Blazer','Other'].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {!productType && (
        <div className="text-xs text-indigo-500 bg-indigo-50 p-3 rounded-lg border border-indigo-100 font-medium">
          Please select a product type above to see specifications.
        </div>
      )}

      {productType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fit */}
          {showField('fit') && (
            <div>
              <label className={labelCls}>Fit</label>
              <select value={data.fit || ''} onChange={e => set('fit', e.target.value)} className={inputCls}>
                <option value="">Select fit...</option>
                {['Regular','Slim','Oversized','Relaxed','Comfort'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Sleeve Type */}
          {showField('sleeve_type') && (
            <div>
              <label className={labelCls}>Sleeve Type</label>
              <select value={data.sleeve_type || ''} onChange={e => set('sleeve_type', e.target.value)} className={inputCls}>
                <option value="">Select sleeve...</option>
                {['Half Sleeve','Full Sleeve','Sleeveless','3/4 Sleeve','Raglan','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Neck Type */}
          {showField('neck_type') && (
            <div>
              <label className={labelCls}>Neck Type</label>
              <select value={data.neck_type || ''} onChange={e => set('neck_type', e.target.value)} className={inputCls}>
                <option value="">Select neck...</option>
                {['Round Neck','Polo','V Neck','Collar','Mandarin','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Collar Type */}
          {showField('collar_type') && (
            <div>
              <label className={labelCls}>Collar Type</label>
              <select value={data.collar_type || ''} onChange={e => set('collar_type', e.target.value)} className={inputCls}>
                <option value="">Select collar type...</option>
                {['Classic', 'Spread', 'Button-Down', 'Band', 'Mandarin', 'Roll', 'Shawl', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Cuff Type */}
          {showField('cuff_type') && (
            <div>
              <label className={labelCls}>Cuff Type</label>
              <select value={data.cuff_type || ''} onChange={e => set('cuff_type', e.target.value)} className={inputCls}>
                <option value="">Select cuff type...</option>
                {['Single Button', 'Double Button', 'French Cuff', 'Convertible', 'Barrel', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Hood Type */}
          {showField('hood_type') && (
            <div>
              <label className={labelCls}>Hood Type</label>
              <select value={data.hood_type || ''} onChange={e => set('hood_type', e.target.value)} className={inputCls}>
                <option value="">Select hood type...</option>
                {['Standard', 'Drawstring', 'Detachable', 'Double Lined', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Pocket Type */}
          {showField('pocket_type') && (
            <div>
              <label className={labelCls}>Pocket Type</label>
              <select value={data.pocket_type || ''} onChange={e => set('pocket_type', e.target.value)} className={inputCls}>
                <option value="">Select pocket type...</option>
                {['Kangaroo Pocket', 'Side Pockets', 'Chest Pocket', 'Welt Pocket', 'Patch Pocket', 'No Pocket', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Closure Type */}
          {showField('closure_type') && (
            <div>
              <label className={labelCls}>Closure Type</label>
              <select value={data.closure_type || ''} onChange={e => set('closure_type', e.target.value)} className={inputCls}>
                <option value="">Select closure type...</option>
                {['Zip', 'Button', 'Zip & Button', 'Snaps', 'Velcro', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Lining */}
          {showField('lining') && (
            <div>
              <label className={labelCls}>Lining</label>
              <input type="text" value={data.lining || ''} onChange={e => set('lining', e.target.value)}
                placeholder="e.g. Polyester mesh, Satin, Fleece, None" className={inputCls} />
            </div>
          )}

          {/* Waist */}
          {showField('waist') && (
            <div>
              <label className={labelCls}>Waist</label>
              <input type="text" value={data.waist || ''} onChange={e => set('waist', e.target.value)}
                placeholder="e.g. 32 inches, 34 inches" className={inputCls} />
            </div>
          )}

          {/* Waist Size */}
          {showField('waist_size') && (
            <div>
              <label className={labelCls}>Waist Size</label>
              <input type="text" value={data.waist_size || ''} onChange={e => set('waist_size', e.target.value)}
                placeholder="e.g. 30, 32, 34" className={inputCls} />
            </div>
          )}

          {/* Length */}
          {showField('length') && (
            <div>
              <label className={labelCls}>Length</label>
              <input type="text" value={data.length || ''} onChange={e => set('length', e.target.value)}
                placeholder="e.g. 30 inches, 32 inches, Full Length" className={inputCls} />
            </div>
          )}

          {/* Rise */}
          {showField('rise') && (
            <div>
              <label className={labelCls}>Rise</label>
              <select value={data.rise || ''} onChange={e => set('rise', e.target.value)} className={inputCls}>
                <option value="">Select rise...</option>
                {['High Rise', 'Mid Rise', 'Low Rise'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Stretch Type */}
          {showField('stretch_type') && (
            <div>
              <label className={labelCls}>Stretch Type</label>
              <select value={data.stretch_type || ''} onChange={e => set('stretch_type', e.target.value)} className={inputCls}>
                <option value="">Select stretch type...</option>
                {['Rigid (Non-Stretch)', 'Low Stretch', 'Medium Stretch', 'High Stretch'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Ankle Style */}
          {showField('ankle_style') && (
            <div>
              <label className={labelCls}>Ankle Style</label>
              <select value={data.ankle_style || ''} onChange={e => set('ankle_style', e.target.value)} className={inputCls}>
                <option value="">Select ankle style...</option>
                {['Cuffed', 'Ribbed', 'Elastic', 'Open Hem', 'Zipped', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Department */}
          {showField('department') && (
            <div>
              <label className={labelCls}>Department</label>
              <input type="text" value={data.department || ''} onChange={e => set('department', e.target.value)}
                placeholder="e.g. Security, Kitchen, Corporate" className={inputCls} />
            </div>
          )}

          {/* Logo */}
          {showField('logo') && (
            <div>
              <label className={labelCls}>Logo Description</label>
              <input type="text" value={data.logo || ''} onChange={e => set('logo', e.target.value)}
                placeholder="e.g. Left chest print, back embroidery" className={inputCls} />
            </div>
          )}

          {/* Reflective Type */}
          {showField('reflective_type') && (
            <div>
              <label className={labelCls}>Reflective Type</label>
              <input type="text" value={data.reflective_type || ''} onChange={e => set('reflective_type', e.target.value)}
                placeholder="e.g. 2 inch Silver Tape, Glass Bead" className={inputCls} />
            </div>
          )}

          {/* Safety Standard */}
          {showField('safety_standard') && (
            <div>
              <label className={labelCls}>Safety Standard</label>
              <input type="text" value={data.safety_standard || ''} onChange={e => set('safety_standard', e.target.value)}
                placeholder="e.g. ANSI/ISEA 107, EN ISO 20471" className={inputCls} />
            </div>
          )}

          {/* Border Type */}
          {showField('border_type') && (
            <div>
              <label className={labelCls}>Border Type</label>
              <input type="text" value={data.border_type || ''} onChange={e => set('border_type', e.target.value)}
                placeholder="e.g. Golden Zari, Embroidered, Temple" className={inputCls} />
            </div>
          )}

          {/* Blouse Piece */}
          {showField('blouse_piece') && (
            <div>
              <label className={labelCls}>Blouse Piece</label>
              <select value={data.blouse_piece || ''} onChange={e => set('blouse_piece', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {['Yes - Attached', 'Yes - Unstitched', 'No'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Lapel Type */}
          {showField('lapel_type') && (
            <div>
              <label className={labelCls}>Lapel Type</label>
              <select value={data.lapel_type || ''} onChange={e => set('lapel_type', e.target.value)} className={inputCls}>
                <option value="">Select lapel type...</option>
                {['Notch Lapel', 'Peak Lapel', 'Shawl Lapel', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Fabric Type */}
          {showField('fabric_type') && (
            <div>
              <label className={labelCls}>Fabric Type <span className="text-red-500">*</span></label>
              <select value={data.fabric_type || ''} onChange={e => set('fabric_type', e.target.value)} className={inputCls}>
                <option value="">Select fabric type...</option>
                {['100% Cotton','Polyester','Cotton Polyester','Linen','Rayon','Viscose',
                  'Denim','Terry Cotton','Fleece','Lycra','Nylon','Silk','Wool','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Fabric GSM */}
          {showField('fabric_gsm') && (
            <div>
              <label className={labelCls}>Fabric GSM <span className="text-red-500">*</span></label>
              <select value={data.fabric_gsm || ''} onChange={e => set('fabric_gsm', e.target.value)} className={inputCls}>
                <option value="">Select GSM...</option>
                {['120 GSM','140 GSM','160 GSM','180 GSM','200 GSM','220 GSM','240 GSM','280 GSM','Custom'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Fabric Composition */}
          {showField('fabric_composition') && (
            <div className="md:col-span-2">
              <label className={labelCls}>Fabric Composition</label>
              <input type="text" value={data.fabric_composition || ''} onChange={e => set('fabric_composition', e.target.value)}
                placeholder="e.g. 100% Cotton, 60% Cotton / 40% Polyester"
                className={inputCls.replace('bg-white', '')} />
            </div>
          )}
        </div>
      )}

      {/* Colors (Multi-Select) */}
      {showField('colors') && (
        <div className="relative" ref={dropdownRef}>
          <label className={labelCls}>Color (multi-select)</label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`${inputCls} flex items-center justify-between text-left cursor-pointer min-h-[46px]`}
          >
            <span className={`${(data.colors || []).length === 0 ? 'text-gray-400' : 'text-gray-800 font-semibold'}`}>
              {(data.colors || []).length === 0
                ? 'Select colors...'
                : `${(data.colors || []).length} color(s) selected: ${(data.colors || []).slice(0, 3).join(', ')}${(data.colors || []).length > 3 ? '...' : ''}`}
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {isOpen && (
            <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-fade">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {CLOTHING_COLORS.map(color => {
                  const isSelected = (data.colors || []).includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`flex items-center gap-2 px-3 py-2 text-left rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom color input */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); }}}
              placeholder="Type a custom color and press Enter or Add"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-400 outline-none text-sm transition"
            />
            <button type="button" onClick={addCustomColor}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition">
              + Add
            </button>
          </div>

          {/* Selected colors badges list */}
          {(data.colors || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(data.colors || []).map(c => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold shadow-sm">
                  {c}
                  <button type="button" onClick={() => toggleColor(c)} className="text-indigo-400 hover:text-red-500 ml-1 text-sm font-bold leading-none">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sizes breakdown */}
      {showField('sizes') && (
        <>
          {/* Size Required Checkboxes */}
          <div>
            <label className={labelCls}>Size Required</label>
            <div className="flex flex-wrap gap-3">
              {ALL_SIZES.map(size => {
                const isChecked = !!(data.sizes_required || {})[size];
                return (
                  <label key={size}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all font-semibold text-sm select-none ${
                      isChecked
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      isChecked ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'
                    }`}>
                      {isChecked && <FaCheck className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleSize(size)} />
                    {size}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Size Breakdown Table */}
          {checkedSizes.length > 0 && (
            <div>
              <label className={labelCls}>Size Breakdown — Quantity per Size</label>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-50 border-b border-gray-200">
                      <th className="px-5 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wide w-32">Size</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wide">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {checkedSizes.map(size => (
                      <tr key={size} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-5 py-2.5">
                          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{size}</span>
                        </td>
                        <td className="px-5 py-2.5">
                          <input
                            type="number" min="0"
                            value={(data.size_breakdown || {})[size] || ''}
                            onChange={e => setBreakdownQty(size, e.target.value)}
                            placeholder="0"
                            className="w-36 px-3 py-1.5 rounded-lg border border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-indigo-200 bg-indigo-50">
                      <td className="px-5 py-2.5 text-xs font-bold text-indigo-700">Total</td>
                      <td className="px-5 py-2.5 text-sm font-bold text-indigo-800">
                        {checkedSizes.reduce((sum, s) => sum + (parseFloat((data.size_breakdown || {})[s]) || 0), 0).toLocaleString()} Pcs
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Printing */}
      {showField('printing') && (
        <div>
          <label className={labelCls}>Printing Required</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {['Screen Print','DTF','DTG','Heat Transfer','Puff Print','Sublimation'].map(method => {
              const isChecked = !!(data.printing_required || {})[method];
              return (
                <label key={method}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'border-violet-400 bg-violet-50 text-violet-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked ? 'bg-violet-500 border-violet-500' : 'bg-white border-gray-300'
                  }`}>
                    {isChecked && <FaCheck className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => togglePrint(method)} />
                  <span className="text-sm font-semibold">{method}</span>
                </label>
              );
            })}
          </div>
          {checkedPrints.length > 0 && (
            <p className="text-xs text-violet-600 mt-1.5 font-medium">Selected: {checkedPrints.join(', ')}</p>
          )}
        </div>
      )}

      {/* Custom Fields (for "Other" Product Type) */}
      {showField('custom_fields') && (
        <div className="space-y-4">
          <label className={labelCls}>Custom Specification Fields</label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customKey}
              onChange={e => setCustomKey(e.target.value)}
              placeholder="Field Label (e.g. Neck Drop)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              placeholder="Value (e.g. 8 inches)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={addCustomField}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
            >
              + Add Field
            </button>
          </div>

          {(data.custom_fields || []).length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                    <th className="px-4 py-2">Field Label</th>
                    <th className="px-4 py-2">Specification Value</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {(data.custom_fields || []).map((f, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-800 font-semibold">{f.label}</td>
                      <td className="px-4 py-2.5 text-gray-600">{f.value}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Packing Type & Sample Required ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Packing Type</label>
          <select value={data.packing_type || ''} onChange={e => set('packing_type', e.target.value)} className={inputCls}>
            <option value="">Select packing...</option>
            {['Single Piece Polybag', 'Pack of 3', 'Pack of 5', 'Custom Box Packing', 'Bulk Packing'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Required</label>
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => (
              <label key={opt}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 cursor-pointer transition-all font-semibold text-sm select-none ${
                  data.sample_required === opt
                    ? opt === 'Yes' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-400 bg-gray-100 text-gray-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <input type="radio" className="hidden" checked={data.sample_required === opt} onChange={() => set('sample_required', opt)} />
                {opt === 'Yes' ? '📦' : '✗'} {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Special Instructions ── */}
      <div>
        <label className={labelCls}>Special Instructions</label>
        <textarea
          value={data.special_instructions || ''}
          onChange={e => set('special_instructions', e.target.value)}
          placeholder="Any additional requirements — branding details, specific stitching, packaging notes, compliance, timeline constraints..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm resize-none"
        />
      </div>

    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const CreateClientRequirementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState('customer');

  /* ── Core form ── */
  const [formData, setFormData] = useState({
    // Customer
    customer_name: '', contact_person: '', mobile_number: '', email: '',
    customer_address: '', customer_gstin: '', customer_location: '',
    // Enquiry
    project_name: '', enquiry_source: '', priority: 'Normal',
    // Product – generic
    product_category: 'Clothing',
    product_name: '', product_type: '', product_model: '',
    customer_part_number: '', internal_reference: '',
    quantity: '', unit: 'Pcs', required_date: '',
    // Technical – generic
    tolerance: '',
    // Delivery
    reference_number: '', department_buyer: '',
    delivery_address: '', incoterm: 'EXW',
    expected_delivery_date: '', delivery_frequency: '',
    // Commercial
    currency: 'INR ₹', payment_terms: '', target_price: '',
    payment_mode: '', sampling_required: '', sample_qty: '',
    // Remarks
    description: '', internal_notes: '', customer_special_instructions: '',
    // Approval
    requested_by: '', approved_by: '', priority_flag: 'Normal',
  });

  /* ── Dynamic category fields ── */
  const [dynamicFields, setDynamicFields] = useState({});

  /* ── Manufacturing requirements (dynamic per category) ── */
  const [mfgRequirements, setMfgRequirements] = useState({});

  /* ── Variant rows (dynamic columns per category) ── */
  const [variantRows, setVariantRows] = useState([
    { col1: '', col2: '', quantity: '', unit: 'Pcs' }
  ]);



  /* ── UI ── */
  const [fetchingData, setFetchingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdRequirement, setCreatedRequirement] = useState(null);

  /* ── Category config shorthand ── */
  const catConfig = CATEGORY_CONFIG[formData.product_category] || CATEGORY_CONFIG['Clothing'];
  const colorC = COLOR_CLASSES[catConfig.color] || COLOR_CLASSES.indigo;

  /* ── Multi-product list state ── */
  const BLANK_PRODUCT_FORM = {
    product_category: 'Clothing',
    product_name: '',
    product_model: '',
    customer_part_number: '',
    quantity: '',
    unit: 'Pcs',
    required_date: '',
    category_details: {},      // for generic categories (DynamicField)
    clothing_data: {           // for Clothing (ClothingDetailsSection)
      product_type: '', fabric_type: '', fabric_gsm: '', fabric_composition: '',
      fit: '', sleeve_type: '', neck_type: '',
      colors: [], sizes_required: {}, size_breakdown: {}, printing_required: {},
      embroidery: '', logo_position: '', label_type: '',
      packing_type: '', sample_required: '', special_instructions: '',
      collar_type: '', cuff_type: '', hood_type: '', pocket_type: '',
      closure_type: '', lining: '', waist: '', length: '', waist_size: '',
      rise: '', stretch_type: '', ankle_style: '', department: '', logo: '',
      reflective_type: '', safety_standard: '', border_type: '', blouse_piece: '',
      lapel_type: '', custom_fields: []
    },
    files: { drawing: null, pdf: null, images: null, specifications: null, other: null },
    attachments: {}
  };

  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [productForm, setProductForm] = useState(BLANK_PRODUCT_FORM);

  const openAddProduct = () => {
    setProductForm(BLANK_PRODUCT_FORM);
    setEditingProductIndex(null);
    setShowProductForm(true);
  };

  const openEditProduct = (idx) => {
    const prod = products[idx];
    setProductForm({
      ...BLANK_PRODUCT_FORM,
      ...prod,
      files: prod.files || { drawing: null, pdf: null, images: null, specifications: null, other: null },
      attachments: prod.attachments || {}
    });
    setEditingProductIndex(idx);
    setShowProductForm(true);
  };

  const deleteProduct = (idx) => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
    setExpandedProducts(prev => { const s = new Set(prev); s.delete(idx); return s; });
  };

  const saveProduct = () => {
    if (!productForm.product_name.trim()) { toast.error('Product Name is required'); return; }
    if (!productForm.quantity || parseFloat(productForm.quantity) <= 0) { toast.error('Quantity must be > 0'); return; }
    if (editingProductIndex !== null) {
      setProducts(prev => prev.map((p, i) => i === editingProductIndex ? { ...productForm } : p));
    } else {
      setProducts(prev => [...prev, { ...productForm }]);
    }
    setProductForm(BLANK_PRODUCT_FORM);
    setEditingProductIndex(null);
    toast.success(editingProductIndex !== null ? 'Product updated' : 'Product added');
  };

  const cancelProductForm = () => {
    setProductForm(BLANK_PRODUCT_FORM);
    setEditingProductIndex(null);
  };

  const toggleExpanded = (idx) => {
    setExpandedProducts(prev => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx); else s.add(idx);
      return s;
    });
  };

  const setPF = (field, val) => setProductForm(prev => ({ ...prev, [field]: val }));
  const setPFDetail = (field, val) => setProductForm(prev => ({
    ...prev, category_details: { ...prev.category_details, [field]: val }
  }));

  /* ── Reinitialise mfg requirements when category changes ── */
  useEffect(() => {
    const config = CATEGORY_CONFIG[formData.product_category];
    if (!config) return;
    const newMfg = {};
    config.mfgRequirements.forEach(k => { newMfg[k] = mfgRequirements[k] || false; });
    setMfgRequirements(newMfg);
  }, [formData.product_category]);

  /* ── Fetch (edit mode) ── */
  useEffect(() => { if (isEditMode) fetchRequirementDetails(); }, [id]);

  const fetchRequirementDetails = async () => {
    try {
      setFetchingData(true);
      const res = await api.get(`/client-requirements/${id}`);
      const d = res.data;
      setFormData(prev => ({
        ...prev,
        customer_name: d.customer_name || '',
        contact_person: d.contact_person || '',
        mobile_number: d.mobile_number || '',
        email: d.email || '',
        customer_address: d.customer_address || '',
        customer_gstin: d.customer_gstin || '',
        customer_location: d.customer_location || '',
        project_name: d.project_name || '',
        enquiry_source: d.enquiry_source || '',
        priority: d.priority || 'Normal',
        required_date: d.required_date ? d.required_date.split('T')[0] : '',
        expected_delivery_date: d.expected_delivery_date ? d.expected_delivery_date.split('T')[0] : '',
        product_category: d.product_category || 'Clothing',
        product_name: d.product_name || '',
        quantity: d.quantity || '',
        unit: d.unit || 'Pcs',
        description: d.description || '',
        reference_number: d.reference_number || '',
        delivery_address: d.delivery_address || '',
        tolerance: d.tolerance || '',
        product_model: d.product_model || '',
        customer_part_number: d.customer_part_number || '',
        internal_reference: d.internal_reference || '',
        department_buyer: d.department_buyer || '',
        incoterm: d.incoterm || 'EXW',
        delivery_frequency: d.delivery_frequency || '',
        currency: d.currency || 'INR ₹',
        payment_terms: d.payment_terms || '',
        target_price: d.target_price || '',
        payment_mode: d.payment_mode || '',
        sampling_required: d.sampling_required || '',
        sample_qty: d.sample_qty || '',
        internal_notes: d.internal_notes || '',
        customer_special_instructions: d.customer_special_instructions || '',
        requested_by: d.requested_by || '',
        approved_by: d.approved_by || '',
        priority_flag: d.priority_flag || 'Normal',
      }));
      if (d.dynamic_fields) setDynamicFields(d.dynamic_fields);
      if (d.mfg_requirements) setMfgRequirements(d.mfg_requirements);
      if (d.variant_rows) setVariantRows(d.variant_rows);
      
      // Load products and their attachments
      if (d.products && d.products.length > 0) {
        setProducts(d.products.map(p => ({
          ...BLANK_PRODUCT_FORM,
          ...p,
          files: p.files || { drawing: null, pdf: null, images: null, specifications: null, other: null },
          attachments: p.attachments || {}
        })));
      } else {
        // Fallback for legacy requirement records
        setProducts([{
          ...BLANK_PRODUCT_FORM,
          product_category: d.product_category || 'Clothing',
          product_name: d.product_name || '',
          quantity: d.quantity || '',
          unit: d.unit || 'Pcs',
          attachments: d.attachments || {}
        }]);
      }
    } catch {
      toast.error('Failed to load requirement details');
    } finally {
      setFetchingData(false);
    }
  };

  /* ── Handlers ── */
  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const setDynamic = (field, value) => setDynamicFields(prev => ({ ...prev, [field]: value }));
  const toggleMfg = key => setMfgRequirements(prev => ({ ...prev, [key]: !prev[key] }));

  const handleVariantChange = (idx, field, value) =>
    setVariantRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  const addVariantRow = () => setVariantRows(prev => [...prev, { col1: '', col2: '', quantity: '', unit: 'Pcs' }]);
  const removeVariantRow = idx => setVariantRows(prev => prev.filter((_, i) => i !== idx));

  const handleFileChange = (name, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error(`Max 15 MB per file`); return; }
    setProductForm(prev => ({
      ...prev,
      files: {
        ...(prev.files || {}),
        [name]: file
      }
    }));
    toast.success(`"${file.name}" selected`);
  };

  /* ── Submit ── */
  const handleSubmit = async (status) => {
    setSubmitError('');
    if (!formData.customer_name.trim()) { setSubmitError('Customer Name is required'); setActiveTab('customer'); return; }
    if (products.length === 0) { setSubmitError('Add at least one product before submitting'); setActiveTab('product'); return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      fd.append('status', status);
      const cleanedProducts = products.map(p => {
        const { files, ...rest } = p;
        return rest;
      });
      fd.append('products', JSON.stringify(cleanedProducts));
      fd.append('dynamic_fields', JSON.stringify(dynamicFields));
      fd.append('mfg_requirements', JSON.stringify(mfgRequirements));
      fd.append('variant_rows', JSON.stringify(variantRows));

      // Append files for each product dynamically
      products.forEach((p, index) => {
        if (p.files) {
          Object.keys(p.files).forEach(k => {
            if (p.files[k]) {
              fd.append(`product_${index}_${k}`, p.files[k]);
            }
          });
        }
      });

      let response;
      if (isEditMode) {
        response = await api.put(`/client-requirements/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(`Requirement updated as ${status}!`);
      } else {
        response = await api.post('/client-requirements', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(`Requirement created as ${status}!`);
      }
      setCreatedRequirement(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save client requirement';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Tab navigation helpers ── */
  const tabIds = TABS.map(t => t.id);
  const currentTabIdx = tabIds.indexOf(activeTab);
  const goNext = () => { if (currentTabIdx < tabIds.length - 1) setActiveTab(tabIds[currentTabIdx + 1]); };
  const goPrev = () => { if (currentTabIdx > 0) setActiveTab(tabIds[currentTabIdx - 1]); };

  /* ══════════════════════════════════════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════════════════════════════════════ */
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading requirement...</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SUCCESS
  ══════════════════════════════════════════════════════════════════════════ */
  if (createdRequirement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-green-200 shadow-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Requirement {isEditMode ? 'Updated' : 'Created'}!</h2>
            <p className="text-gray-500 mb-1 text-sm">Reference:</p>
            <p className="text-xl font-bold text-green-600 mb-6">{createdRequirement.requirement_number}</p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-left">
              {[
                ['Customer', createdRequirement.customer_name],
                ['Product', createdRequirement.product_name],
                ['Category', createdRequirement.product_category],
                ['Quantity', `${createdRequirement.quantity} ${createdRequirement.unit}`],
                ['Status', createdRequirement.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                  <p className="font-semibold text-gray-900 truncate">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/sales/client-requirements/${createdRequirement.id}`)}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Details
              </button>
              <button
                onClick={() => navigate('/sales/client-requirements')}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm border border-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN FORM
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/client-requirements')}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {isEditMode ? 'Edit Client Requirement' : 'New Client Requirement'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorC.badge}`}>
                  {catConfig.icon} {formData.product_category}
                </span>
                {formData.project_name && (
                  <span className="text-xs text-gray-500 truncate max-w-48">{formData.project_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick submit buttons in header */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <FaSave className="w-3.5 h-3.5" />}
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit('Review')}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <FaFileAlt className="w-3.5 h-3.5" />}
              Submit Review
            </button>
            <button
              onClick={() => handleSubmit('Approved')}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <FaCheck className="w-3.5 h-3.5" />}
              Approve
            </button>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0.5 overflow-x-auto pb-0">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? `border-blue-600 text-blue-600 bg-blue-50`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={`text-xs ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error banner ── */}
      {submitError && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <FaTimesCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{submitError}</p>
          </div>
        </div>
      )}

      {/* ── Form body ── */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <form onSubmit={e => e.preventDefault()}>

          {/* ════════════════════════════════════════════════════════════════
              TAB 1 – CUSTOMER & ENQUIRY
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'customer' && (
            <div className="space-y-4">

              {/* ── Customer Information ── */}
              <SectionCard
                gradient="from-blue-50 to-indigo-50"
                icon={<FaUserAlt className="text-blue-600" />}
                title="Customer Information"
                subtitle="Contact details of the client placing this requirement"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Customer / Company Name <Req /></Label>
                    <input type="text" value={formData.customer_name} onChange={e => set('customer_name', e.target.value)}
                      placeholder="e.g. ABC Textiles Pvt Ltd" className={inputClass} />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <input type="text" value={formData.contact_person} onChange={e => set('contact_person', e.target.value)}
                      placeholder="Name of primary contact" className={inputClass} />
                  </div>
                  <div>
                    <Label>Mobile / Phone</Label>
                    <input type="text" value={formData.mobile_number} onChange={e => set('mobile_number', e.target.value)}
                      placeholder="+91 98765 43210" className={inputClass} />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                      placeholder="contact@company.com" className={inputClass} />
                  </div>
                  <div>
                    <Label>Customer Location / City</Label>
                    <input type="text" value={formData.customer_location} onChange={e => set('customer_location', e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra" className={inputClass} />
                  </div>
                  <div>
                    <Label>GSTIN / Tax ID</Label>
                    <input type="text" value={formData.customer_gstin} onChange={e => set('customer_gstin', e.target.value)}
                      placeholder="27AABCU9603R1ZX" className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Customer Address</Label>
                    <textarea value={formData.customer_address} onChange={e => set('customer_address', e.target.value)}
                      placeholder="Full billing / registered address" rows={2}
                      className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </SectionCard>

              {/* ── Enquiry / Project Details ── */}
              <SectionCard
                gradient="from-amber-50 to-yellow-50"
                icon={<FaClipboardList className="text-amber-600" />}
                title="Enquiry / Project Details"
                subtitle="Project title, source and priority"
              >
                {/* Highlight field */}
                <div className="mb-5 pb-5 border-b-2 border-amber-200">
                  <label className="block text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wider">
                    🎯 Project / Inquiry Title <Req />
                  </label>
                  <input type="text" value={formData.project_name} onChange={e => set('project_name', e.target.value)}
                    placeholder="e.g. Diwali Gifting 2025 – XYZ Corp"
                    className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-bold bg-amber-50 placeholder-amber-300 transition" />
                  <p className="text-xs text-amber-600 mt-1">This becomes the unique identifier for this enquiry</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Enquiry Source</Label>
                    <select value={formData.enquiry_source} onChange={e => set('enquiry_source', e.target.value)} className={`${inputClass} bg-white`}>
                      <option value="">Select source...</option>
                      {['Direct / Walk-in', 'Email', 'Phone Call', 'Website / Online', 'Exhibition / Trade Fair', 'Referral', 'Existing Customer', 'Sales Team', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select value={formData.priority} onChange={e => set('priority', e.target.value)} className={`${inputClass} bg-white`}>
                      {['Low', 'Normal', 'High', 'Urgent'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionCard>

              <TabNav onNext={goNext} nextLabel="Products" />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2 – PRODUCTS (MULTI-PRODUCT LIST)
          ════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════
              TAB 2 – PRODUCTS (MULTI-PRODUCT LIST & FORM)
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'product' && (
            <div className="space-y-6">

              {/* ── PRODUCTS TABLE (shown if there are products) ── */}
              {products.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Added Products</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {products.length} product{products.length > 1 ? 's' : ''} • {products.reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0).toLocaleString()} total units
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-10">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Product Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-28">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-16">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((p, idx) => {
                          const cfg = CATEGORY_CONFIG[p.product_category] || { icon: '📦', color: 'indigo' };
                          const cc = COLOR_CLASSES[cfg.color] || COLOR_CLASSES.indigo;
                          const isExpanded = expandedProducts.has(idx);
                          return (
                            <React.Fragment key={idx}>
                              <tr className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-4 py-3 text-xs font-bold text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cc.badge}`}>
                                    {cfg.icon} {p.product_category}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-gray-800 text-sm">{p.product_name}</span>
                                  {p.product_model && <span className="text-gray-400 text-xs ml-2">({p.product_model})</span>}
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-700">{parseFloat(p.quantity || 0).toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{p.unit}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button type="button" onClick={() => toggleExpanded(idx)}
                                      title={isExpanded ? 'Collapse' : 'View details'}
                                      className={`p-1.5 rounded-lg border text-xs transition ${
                                        isExpanded ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                                      }`}>
                                      {isExpanded ? <FaChevronLeft className="rotate-90" /> : <FaChevronRight className="rotate-90" />}
                                    </button>
                                    <button type="button" onClick={() => openEditProduct(idx)}
                                      className="p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition text-xs">
                                      <FaTag className="w-3 h-3" />
                                    </button>
                                    <button type="button" onClick={() => deleteProduct(idx)}
                                      className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition text-xs">
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded details row */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} className="px-4 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {p.product_category === 'Clothing' ? (
                                        (() => {
                                          const entries = {
                                            'Product Type': p.clothing_data?.product_type,
                                            'Fabric': p.clothing_data?.fabric_type,
                                            'GSM': p.clothing_data?.fabric_gsm,
                                            'Fit': p.clothing_data?.fit,
                                            'Sleeve': p.clothing_data?.sleeve_type,
                                            'Neck': p.clothing_data?.neck_type,
                                            'Collar Type': p.clothing_data?.collar_type,
                                            'Cuff Type': p.clothing_data?.cuff_type,
                                            'Hood Type': p.clothing_data?.hood_type,
                                            'Pocket Type': p.clothing_data?.pocket_type,
                                            'Closure Type': p.clothing_data?.closure_type,
                                            'Lining': p.clothing_data?.lining,
                                            'Waist': p.clothing_data?.waist,
                                            'Waist Size': p.clothing_data?.waist_size,
                                            'Length': p.clothing_data?.length,
                                            'Rise': p.clothing_data?.rise,
                                            'Stretch Type': p.clothing_data?.stretch_type,
                                            'Ankle Style': p.clothing_data?.ankle_style,
                                            'Department': p.clothing_data?.department,
                                            'Logo': p.clothing_data?.logo,
                                            'Reflective Type': p.clothing_data?.reflective_type,
                                            'Safety Standard': p.clothing_data?.safety_standard,
                                            'Border Type': p.clothing_data?.border_type,
                                            'Blouse Piece': p.clothing_data?.blouse_piece,
                                            'Lapel Type': p.clothing_data?.lapel_type,
                                            'Embroidery': p.clothing_data?.embroidery,
                                            'Logo Position': p.clothing_data?.logo_position,
                                            'Label': p.clothing_data?.label_type,
                                            'Packing': p.clothing_data?.packing_type,
                                            'Sample': p.clothing_data?.sample_required,
                                            'Colors': (p.clothing_data?.colors || []).join(', ') || null,
                                            'Sizes': Object.entries(p.clothing_data?.sizes_required || {}).filter(([,v])=>v).map(([k])=>k).join(', ') || null,
                                            'Printing': Object.entries(p.clothing_data?.printing_required || {}).filter(([,v])=>v).map(([k])=>k).join(', ') || null,
                                          };
                                          (p.clothing_data?.custom_fields || []).forEach(f => {
                                            if (f.label && f.value) {
                                              entries[f.label] = f.value;
                                            }
                                          });
                                          return Object.entries(entries).filter(([,v]) => v);
                                        })().map(([label, val]) => (
                                          <div key={label}>
                                            <div className="text-xs text-gray-400 font-medium">{label}</div>
                                            <div className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{val}</div>
                                          </div>
                                        ))
                                      ) : (
                                        Object.entries(p.category_details || {})
                                          .filter(([,v]) => v)
                                          .map(([field, val]) => {
                                            const fieldDef = (CATEGORY_CONFIG[p.product_category]?.productFields || []).find(f => f.field === field);
                                            return (
                                              <div key={field}>
                                                <div className="text-xs text-gray-400 font-medium">{fieldDef?.label || field}</div>
                                                <div className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{val}</div>
                                              </div>
                                            );
                                          })
                                      )}
                                      {p.customer_part_number && (
                                        <div>
                                          <div className="text-xs text-gray-400 font-medium">Customer Part No.</div>
                                          <div className="text-xs font-semibold text-gray-700 mt-0.5">{p.customer_part_number}</div>
                                        </div>
                                      )}
                                      {p.required_date && (
                                        <div>
                                          <div className="text-xs text-gray-400 font-medium">Required Date</div>
                                          <div className="text-xs font-semibold text-gray-700 mt-0.5">{new Date(p.required_date).toLocaleDateString('en-IN')}</div>
                                        </div>
                                      )}
                                      {p.clothing_data?.special_instructions && (
                                        <div className="col-span-2 md:col-span-4">
                                          <div className="text-xs text-gray-400 font-medium">Special Instructions</div>
                                          <div className="text-xs font-semibold text-gray-700 mt-0.5">{p.clothing_data.special_instructions}</div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                      {/* Footer total */}
                      <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <td colSpan={3} className="px-4 py-3 text-xs font-bold text-gray-600 text-right">TOTAL UNITS</td>
                          <td className="px-4 py-3 text-sm font-bold text-indigo-700">
                            {products.reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0).toLocaleString()}
                          </td>
                          <td colSpan={2} className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* ── PRODUCT FORM (always shown) ── */}
              {(() => {
                const pCat = productForm.product_category;
                const pCatCfg = CATEGORY_CONFIG[pCat] || { icon: '📦', color: 'indigo', sectionTitle: 'Product Details', productFields: OTHER_CATEGORY_FIELDS };
                const pColor = COLOR_CLASSES[pCatCfg.color] || COLOR_CLASSES.indigo;
                const isEditing = editingProductIndex !== null;
                return (
                  <div className="space-y-4 animate-fade">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <FaBoxOpen className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{isEditing ? `Edit Product #${editingProductIndex + 1}` : 'Product Details'}</h3>
                          <p className="text-blue-200 text-xs">Fill in the details below, then click Add Product</p>
                        </div>
                      </div>
                      {isEditing && (
                        <button type="button" onClick={cancelProductForm}
                          className="text-white/70 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Basic info card */}
                    <SectionCard gradient="from-blue-50 to-indigo-50" icon={<FaBoxOpen className="text-blue-600" />}
                      title="Basic Product Information" subtitle="Core identity and quantity for this product line">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Category – full width */}
                        <div className="md:col-span-2">
                          <Label>Product Category <Req /></Label>
                          <select value={pCat} onChange={e => setPF('product_category', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold bg-white transition">
                            {ALL_CATEGORIES.map(cat => {
                              const cfg = CATEGORY_CONFIG[cat];
                              return <option key={cat} value={cat}>{cfg ? cfg.icon : '📦'} {cat}</option>;
                            })}
                          </select>
                          {CATEGORY_CONFIG[pCat] && (
                            <p className="text-xs text-blue-600 mt-1 font-medium">{CATEGORY_CONFIG[pCat].icon} Category-specific fields will appear below</p>
                          )}
                        </div>

                        {/* Product name – full width */}
                        <div className="md:col-span-2">
                          <Label>Product Name <Req /></Label>
                          <input type="text" value={productForm.product_name}
                            onChange={e => setPF('product_name', e.target.value)}
                            placeholder="e.g. Polo T-Shirt, Water Bottle 500ml, Laptop Bag 15"
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold transition" />
                        </div>

                        {/* Model / SKU */}
                        <div>
                          <Label>Model / Style / SKU</Label>
                          <input type="text" value={productForm.product_model}
                            onChange={e => setPF('product_model', e.target.value)}
                            placeholder="e.g. WJ-2024, SKU-001" className={inputClass} />
                        </div>

                        {/* Customer Part No. */}
                        <div>
                          <Label>Customer Part / PO Ref</Label>
                          <input type="text" value={productForm.customer_part_number}
                            onChange={e => setPF('customer_part_number', e.target.value)}
                            placeholder="Customer's internal part / PO number" className={inputClass} />
                        </div>

                        {/* Quantity + Unit */}
                        <div>
                          <Label>Quantity <Req /></Label>
                          <div className="flex gap-2">
                            <input type="number" min="0" value={productForm.quantity}
                              onChange={e => setPF('quantity', e.target.value)}
                              placeholder="0"
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition" />
                            <select value={productForm.unit} onChange={e => setPF('unit', e.target.value)}
                              className="w-24 px-2 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm bg-white transition">
                              {['Pcs','Nos','Sets','Kg','Grams','Meters','Liters','Dozens','Rolls','Sheets','Pairs'].map(u =>
                                <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Required Date */}
                        <div>
                          <Label>Required Delivery Date</Label>
                          <input type="date" value={productForm.required_date}
                            onChange={e => setPF('required_date', e.target.value)} className={inputClass} />
                        </div>

                      </div>
                    </SectionCard>

                    {/* Category-specific details */}
                    {pCat === 'Clothing' ? (
                      <SectionCard gradient="from-indigo-50 to-purple-50"
                        icon={<span className="text-lg">👔</span>}
                        title="Clothing Details"
                        subtitle="Garment-specific specifications">
                        <ClothingDetailsSection
                          data={productForm.clothing_data}
                          onChange={val => setPF('clothing_data', val)}
                        />
                      </SectionCard>
                    ) : pCatCfg.productFields && pCatCfg.productFields.length > 0 ? (
                      <SectionCard
                        gradient={pColor.gradient}
                        icon={<span className="text-lg">{pCatCfg.icon}</span>}
                        title={pCatCfg.sectionTitle || `${pCat} Details`}
                        subtitle={`Specific fields for ${pCat}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pCatCfg.productFields.map(fieldDef => (
                            <div key={fieldDef.field} className={fieldDef.type === 'textarea' ? 'md:col-span-2' : ''}>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5">{fieldDef.label}</label>
                              <DynamicField
                                fieldDef={fieldDef}
                                value={(productForm.category_details || {})[fieldDef.field]}
                                onChange={v => setPFDetail(fieldDef.field, v)}
                                ring={pColor.ring}
                              />
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    ) : null}

                    {/* Drawings inside product form */}
                    <SectionCard
                      gradient="from-slate-50 to-gray-100"
                      icon={<FaPaperclip className="text-slate-600" />}
                      title="Drawings & Supporting Documents"
                      subtitle="Upload drawings, spec sheets, reference images for this product (max 15 MB each)"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: 'drawing', label: 'Technical Drawing', icon: '📐', accepts: '.dwg,.pdf,.jpg,.png,.dxf,.step', hint: 'DWG, DXF, PDF, STEP, Image' },
                          { name: 'pdf',     label: 'Product Spec PDF',  icon: '📄', accepts: '.pdf', hint: 'PDF only' },
                          { name: 'images',  label: 'Reference Images',  icon: '🖼️', accepts: 'image/*', hint: 'JPG, PNG, WEBP' },
                          { name: 'specifications', label: 'Spec Sheet / BOM', icon: '📋', accepts: '.pdf,.doc,.docx,.xls,.xlsx,.txt', hint: 'Word, Excel, PDF' },
                          { name: 'other',   label: 'Other Reference',   icon: '📁', accepts: '*', hint: 'Any file type' },
                        ].map(field => {
                          const selectedFile = productForm.files?.[field.name];
                          const existingFile = productForm.attachments?.[field.name];
                          const hasFile = selectedFile || existingFile;
                          return (
                            <div key={field.name}
                              className={`relative group border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center min-h-[130px] cursor-pointer ${
                                hasFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-slate-50 hover:border-slate-400'
                              }`}
                            >
                              <input type="file" accept={field.accepts}
                                onChange={e => handleFileChange(field.name, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                              <div className={`text-2xl mb-1.5 transition-transform ${!hasFile && 'group-hover:scale-110'}`}>{field.icon}</div>
                              <span className="text-xs font-bold text-gray-700 mb-0.5">{field.label}</span>
                              <span className="text-[10px] text-gray-400">{field.hint}</span>
                              {selectedFile && (
                                <div className="z-20 mt-2 flex flex-col items-center">
                                  <span className="text-[10px] text-blue-600 font-bold truncate max-w-[120px]" title={selectedFile.name}>{selectedFile.name}</span>
                                  <button type="button"
                                    onClick={e => { e.stopPropagation(); setProductForm(prev => ({ ...prev, files: { ...(prev.files || {}), [field.name]: null } })); }}
                                    className="mt-1 px-2 py-0.5 bg-red-100 text-red-600 hover:bg-red-200 rounded text-[9px] font-bold flex items-center gap-1">
                                    <FaTrash className="w-2 h-2" /> Remove
                                  </button>
                                </div>
                              )}
                              {!selectedFile && existingFile && (
                                <div className="z-20 mt-2 flex flex-col items-center">
                                  <span className="text-[10px] text-green-600 font-bold">✅ Uploaded</span>
                                  <button type="button"
                                    onClick={e => { e.stopPropagation(); setProductForm(prev => ({ ...prev, attachments: { ...(prev.attachments || {}), [field.name]: null } })); }}
                                    className="mt-1 px-2 py-0.5 bg-red-100 text-red-600 hover:bg-red-200 rounded text-[9px] font-bold flex items-center gap-1">
                                    <FaTrash className="w-2 h-2" /> Remove
                                  </button>
                                </div>
                              )}
                              {!hasFile && (
                                <span className="text-[10px] text-gray-400 mt-1.5 select-none">Click or drag & drop</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </SectionCard>

                    {/* Form action buttons */}
                    <div className="flex gap-3 justify-end">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={cancelProductForm}
                            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                            Cancel
                          </button>
                          <button type="button" onClick={saveProduct}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:shadow-md hover:opacity-90 transition">
                            <FaCheck className="text-xs" />
                            Update Product
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={saveProduct}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:shadow-md hover:opacity-90 transition">
                          <FaPlus className="text-xs" />
                          Add Product
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              <TabNav onPrev={goPrev} prevLabel="Customer & Enquiry" onNext={goNext} nextLabel="Delivery" />
            </div>
          )}



          {/* ════════════════════════════════════════════════════════════════
              TAB 4 – DELIVERY
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <SectionCard
                gradient="from-rose-50 to-pink-50"
                icon={<FaTruck className="text-rose-500" />}
                title="Delivery & Shipping Details"
                subtitle="Destination, schedule, and logistics terms"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Expected Delivery Date</Label>
                    <input type="date" value={formData.expected_delivery_date} onChange={e => set('expected_delivery_date', e.target.value)} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Delivery / Shipping Address</Label>
                    <textarea value={formData.delivery_address} onChange={e => set('delivery_address', e.target.value)}
                      placeholder="Full delivery address including PIN / postal code" rows={3}
                      className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </SectionCard>
              <TabNav onPrev={goPrev} prevLabel="Product" />
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm font-medium`;

const Label = ({ children }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-2">{children}</label>
);

const Req = () => <span className="text-red-500">*</span>;

const SectionCard = ({ gradient, icon, title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className={`px-6 py-4 bg-gradient-to-r ${gradient} border-b border-gray-200`}>
      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
        {icon} {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const TabNav = ({ onPrev, prevLabel, onNext, nextLabel }) => (
  <div className="flex justify-between items-center pt-1">
    {onPrev ? (
      <button type="button" onClick={onPrev}
        className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-all">
        <FaChevronLeft className="w-3 h-3" /> {prevLabel}
      </button>
    ) : <div />}
    {onNext && (
      <button type="button" onClick={onNext}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-md transition-all">
        {nextLabel} <FaChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

export default CreateClientRequirementPage;
