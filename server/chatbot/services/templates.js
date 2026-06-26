// Garment Material Template Library for Passion ERP
const GARMENT_TEMPLATES = {
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
  'jacket': {
    productName: 'Puffer Jacket',
    description: 'Insulated outdoor puffer jacket with zip closure and standing collar.',
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
