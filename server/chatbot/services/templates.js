// Garment Material Template Library for Passion ERP
const GARMENT_TEMPLATES = {
  'tshirt': {
    productName: 'T-Shirt',
    description: 'Classic crew neck short-sleeve jersey t-shirt with ribbed neck and reinforced shoulder seams.',
    materials: [
      { material: 'Single Jersey Fabric', specification: '180 GSM, 100% Cotton', qty: '1.10', unit: 'Meter' },
      { material: 'Neck Rib', specification: '1x1 Cotton-Spandex flat rib', qty: '0.10', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester spool', qty: '90.00', unit: 'Meter' },
      { material: 'Neck Herringbone Tape', specification: 'Cotton tape for neck reinforcement', qty: '0.40', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator (S/M/L/XL)', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag with barcode', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packaging box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'polo tshirt': {
    productName: 'Polo T-Shirt',
    description: 'Classic fit polo t-shirt with short sleeves, collar, rib cuffs, and 3-button placket.',
    materials: [
      { material: 'Piqué Cotton Fabric', specification: '220 GSM, 100% Cotton', qty: '1.40', unit: 'Meter' },
      { material: 'Rib Collar', specification: 'Matching color, pre-knitted flat', qty: '1.00', unit: 'Piece' },
      { material: 'Sleeve Rib / Cuff', specification: 'Matching color, pre-knitted ribbing', qty: '2.00', unit: 'Piece' },
      { material: 'Buttons', specification: '18L Polyester, 4-hole round', qty: '3.00', unit: 'Pieces' },
      { material: 'Button Thread', specification: 'Matching color, heavy-duty', qty: '0.50', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Polyester, spun spool', qty: '120.00', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator (S/M/L/XL)', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag with barcode', qty: '1.00', unit: 'Piece' },
      { material: 'Tag String', specification: 'Nylon snap-lock string', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packaging packing box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'polo tshirt with zipper': {
    productName: 'Polo T-Shirt with Zipper',
    description: 'Modern zip-neck polo t-shirt with short sleeves and rib collar.',
    materials: [
      { material: 'Piqué Cotton Fabric', specification: '220 GSM, 100% Cotton', qty: '1.40', unit: 'Meter' },
      { material: 'Rib Collar', specification: 'Matching color, pre-knitted flat', qty: '1.00', unit: 'Piece' },
      { material: 'Zipper', specification: '8–10 inch metallic or coil zipper, matching color', qty: '1.00', unit: 'Piece' },
      { material: 'Sewing Thread', specification: '40/2 Polyester, spun spool', qty: '130.00', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator (S/M/L/XL)', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag with barcode', qty: '1.00', unit: 'Piece' },
      { material: 'Tag String', specification: 'Nylon snap-lock string', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packaging packing box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'formal shirt': {
    productName: 'Formal Shirt',
    description: 'Long-sleeve formal dress shirt with button-down collar and rounded cuffs.',
    materials: [
      { material: 'Cotton Oxford Fabric', specification: '120 GSM, 100% Cotton woven', qty: '1.60', unit: 'Meter' },
      { material: 'Interlining', specification: 'Fusible canvas interlining for collar/cuffs', qty: '0.50', unit: 'Meter' },
      { material: 'Buttons', specification: '16L Polyester, 4-hole round', qty: '8.00', unit: 'Pieces' },
      { material: 'Sewing Thread', specification: '50/2 Spun polyester, fine stitch', qty: '150.00', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed label', qty: '1.00', unit: 'Piece' },
      { material: 'Collar Stay', specification: 'Plastic rigid insert inserts', qty: '2.00', unit: 'Pieces' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packing box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'joggers': {
    productName: 'Joggers',
    description: 'Comfort-fit athletic joggers with elastic waistband, drawstring, side front pockets, and rib cuffs.',
    materials: [
      { material: 'French Terry Fabric', specification: '280 GSM, 80% Cotton / 20% Polyester', qty: '1.60', unit: 'Meter' },
      { material: '2x1 Lycra Ribbing', specification: 'For waistband and ankle cuffs', qty: '0.40', unit: 'Meter' },
      { material: 'Waistband Elastic', specification: '1.5-inch woven latex-free elastic', qty: '0.90', unit: 'Meter' },
      { material: 'Drawstring Cord', specification: 'Flat cotton braided cord with plastic tips', qty: '1.00', unit: 'Piece' },
      { material: 'Pocket Lining Fabric', specification: 'Single cotton jersey lining', qty: '0.25', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester spool', qty: '150.00', unit: 'Meter' },
      { material: 'Neck/Waist Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator (S/M/L/XL)', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag with barcode', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packaging box', qty: '0.03', unit: 'Piece' }
    ]
  },
  'hoodie': {
    productName: 'Hoodie',
    description: 'Classic pullover long-sleeve hoodie with kangaroo pocket and drawstrings.',
    materials: [
      { material: 'Fleece Fabric', specification: '320 GSM, Cotton-Polyester Blend brushed', qty: '1.80', unit: 'Meter' },
      { material: 'Hood Lining Fabric', specification: 'Single Jersey, 100% Cotton', qty: '0.40', unit: 'Meter' },
      { material: 'Rib Cuffs & Waistband', specification: '2x2 Lycra ribbing, matching color', qty: '0.60', unit: 'Meter' },
      { material: 'Drawstring', specification: 'Braided cotton cord with metal tips', qty: '1.00', unit: 'Piece' },
      { material: 'Eyelets', specification: 'Brass/Metal grommets, anti-rust', qty: '2.00', unit: 'Pieces' },
      { material: 'Sewing Thread', specification: '40/2 Polyester, spun spool', qty: '180.00', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packing box', qty: '0.03', unit: 'Piece' }
    ]
  },
  'jeans': {
    productName: 'Denim Jeans',
    description: 'Classic 5-pocket denim jeans with rivet reinforcement and metal button fly.',
    materials: [
      { material: 'Denim Fabric', specification: '12 oz, 100% Cotton twill Indigo', qty: '1.50', unit: 'Meter' },
      { material: 'Pocket Lining Fabric', specification: 'TC Sheeting pocketing fabric', qty: '0.30', unit: 'Meter' },
      { material: 'Waist Shank Button', specification: 'Metal hammer-on shank button', qty: '1.00', unit: 'Piece' },
      { material: 'Rivets', specification: 'Copper/Brass rivets for pocket reinforcement', qty: '6.00', unit: 'Pieces' },
      { material: 'Zipper', specification: '4-inch heavy metal brass zipper fly', qty: '1.00', unit: 'Piece' },
      { material: 'Sewing Thread', specification: '20/3 Core-spun polyester heavy thread', qty: '200.00', unit: 'Meter' },
      { material: 'Leather Patch', specification: 'Embossed PU/Leather back waist patch', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' }
    ]
  },
  'trousers': {
    productName: 'Trousers',
    description: 'Semi-formal or casual chino trousers with buttoned waistband, zip fly, side pockets, and back welt pockets.',
    materials: [
      { material: 'Cotton Twill Fabric', specification: '240 GSM, 98% Cotton / 2% Elastane', qty: '1.60', unit: 'Meter' },
      { material: 'Pocketing Fabric', specification: 'TC blend pocket lining', qty: '0.35', unit: 'Meter' },
      { material: 'Waistband Button', specification: '24L horn or metal button', qty: '1.00', unit: 'Piece' },
      { material: 'Zipper Fly', specification: '5-inch brass metal coil zipper fly', qty: '1.00', unit: 'Piece' },
      { material: 'Fusible Interlining', specification: 'For waistband structure reinforcement', qty: '0.20', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester spool', qty: '160.00', unit: 'Meter' },
      { material: 'Waist Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master packing box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'shorts': {
    productName: 'Shorts',
    description: 'Casual or athletic shorts with elastic waistband, side pockets, and drawstrings.',
    materials: [
      { material: 'Polyester Microfiber Fabric', specification: '160 GSM, dry-fit quick dry', qty: '0.90', unit: 'Meter' },
      { material: 'Waistband Elastic', specification: '1.25-inch woven elastic band', qty: '0.85', unit: 'Meter' },
      { material: 'Drawstring Cord', specification: 'Round polyester cord with knotted ends', qty: '1.00', unit: 'Piece' },
      { material: 'Pocket Lining Mesh', specification: 'Breathable polyester mesh pocket lining', qty: '0.20', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester spool', qty: '90.00', unit: 'Meter' },
      { material: 'Brand Label', specification: 'Soft heat-transfer label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven label inside pocket seam', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' }
    ]
  },
  'jacket': {
    productName: 'Jacket',
    description: 'Insulated outdoor puffer jacket with zip closure, standing collar, and zippered side pockets.',
    materials: [
      { material: 'Outer Polyester Shell', specification: '70D Nylon/Polyester water-resistant', qty: '2.00', unit: 'Meter' },
      { material: 'Inner Lining Fabric', specification: '210T Polyester Taffeta lining', qty: '1.80', unit: 'Meter' },
      { material: 'Polyester Padding/Filling', specification: '200 GSM synthetic down padding', qty: '2.00', unit: 'Meter' },
      { material: 'Main Zipper', specification: '5# Open-end vislon/metallic front zipper', qty: '1.00', unit: 'Piece' },
      { material: 'Pocket Zippers', specification: '3# Closed-end matching nylon zippers', qty: '2.00', unit: 'Pieces' },
      { material: 'Metal Press Snaps', specification: '15mm spring snaps, heavy duty', qty: '8.00', unit: 'Pieces' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester thread', qty: '220.00', unit: 'Meter' },
      { material: 'Neck Label', specification: 'Brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE', qty: '1.00', unit: 'Piece' }
    ]
  },
  'dresses': {
    productName: 'Dress',
    description: 'Casual summer A-line dress with round neck, short sleeves, and back invisible zipper closure.',
    materials: [
      { material: 'Rayon Viscose Fabric', specification: '140 GSM, soft woven drapey', qty: '2.20', unit: 'Meter' },
      { material: 'Invisible Zipper', specification: '18-inch matching color nylon zipper', qty: '1.00', unit: 'Piece' },
      { material: 'Neck Facing Interlining', specification: 'Soft fusible non-woven interlining', qty: '0.15', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '50/2 Spun polyester fine thread', qty: '120.00', unit: 'Meter' },
      { material: 'Brand Label', specification: 'Woven brand label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size label', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'Satin printed instruction label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent LDPE polybag', qty: '1.00', unit: 'Piece' }
    ]
  },
  'uniforms': {
    productName: 'Uniform Shirt',
    description: 'Unisex short-sleeve collared uniform shirt with front button placket and left chest pocket.',
    materials: [
      { material: 'TC Poplin Fabric', specification: '65% Polyester / 35% Cotton, 115 GSM', qty: '1.40', unit: 'Meter' },
      { material: 'Fusible Interlining', specification: 'For collar and front button placket', qty: '0.25', unit: 'Meter' },
      { material: 'Buttons', specification: '14L Polyester, 4-hole flat uniform buttons', qty: '7.00', unit: 'Pieces' },
      { material: 'Sewing Thread', specification: '50/2 Spun polyester sewing thread', qty: '110.00', unit: 'Meter' },
      { material: 'Brand Label', specification: 'Custom uniform brand woven label', qty: '1.00', unit: 'Piece' },
      { material: 'Size Label', specification: 'Woven size indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Wash Care Label', specification: 'High-durability printed satin label', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Uniform barcode hang tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive polybag', qty: '1.00', unit: 'Piece' },
      { material: 'Carton Box', specification: 'Corrugated master box', qty: '0.02', unit: 'Piece' }
    ]
  },
  'kids wear': {
    productName: 'Kids Romper',
    description: 'Soft infant onesie/romper with short sleeves and metal snap buttons along the crotch inseam.',
    materials: [
      { material: 'Organic Cotton Interlock Fabric', specification: '180 GSM, 100% Organic Cotton', qty: '0.60', unit: 'Meter' },
      { material: 'Snap Buttons', specification: '9.5mm ring spring snaps, nickel-free, baby-safe', qty: '5.00', unit: 'Pieces' },
      { material: 'Sewing Thread', specification: '50/2 Extra-soft spun polyester', qty: '60.00', unit: 'Meter' },
      { material: 'Brand Label', specification: 'Tagless soft heat-transfer print label', qty: '1.00', unit: 'Piece' },
      { material: 'Size & Care Label', specification: 'Tagless soft heat-transfer print indicator', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Recycled cardstock hang tag', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Biodegradable soft transparent bag', qty: '1.00', unit: 'Piece' }
    ]
  },
  'sports wear': {
    productName: 'Sports Jersey',
    description: 'Athletic crew-neck short-sleeve dry-fit sports jersey with raglan sleeves and flatlock stitching.',
    materials: [
      { material: 'Polyester Dry-Fit Mesh', specification: '140 GSM, moisture-wicking interlock', qty: '1.20', unit: 'Meter' },
      { material: 'Sewing Thread', specification: '40/2 Spun polyester + textured thread for overlock', qty: '140.00', unit: 'Meter' },
      { material: 'Neck binding tape', specification: 'Self-fabric collar binding rib ribbon', qty: '0.50', unit: 'Meter' },
      { material: 'Brand Label', specification: 'Tagless soft heat-transfer print', qty: '1.00', unit: 'Piece' },
      { material: 'Hang Tag', specification: 'Brand cardstock tag with barcode', qty: '1.00', unit: 'Piece' },
      { material: 'Polybag', specification: 'Transparent self-adhesive LDPE bag', qty: '1.00', unit: 'Piece' }
    ]
  }
};

/**
 * Find a template for a matching product name query
 * @param {string} rawName - User's product search query
 * @returns {Object|null} Matching template data or null
 */
function findTemplate(rawName) {
  if (!rawName) return null;
  const name = rawName.toLowerCase().trim();

  // Try direct match
  if (name in GARMENT_TEMPLATES) {
    return GARMENT_TEMPLATES[name];
  }

  // Try substring checks
  const keys = Object.keys(GARMENT_TEMPLATES);
  for (const key of keys) {
    if (name.includes(key) || key.includes(name)) {
      return GARMENT_TEMPLATES[key];
    }
  }

  return null;
}

module.exports = {
  findTemplate,
  GARMENT_TEMPLATES
};
