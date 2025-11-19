const db = require('../config/database');

const seedHSNCodes = async () => {
  try {
    const HSNCode = db.HSNCode;

    const hsnCodes = [
      {
        code: '5208',
        description: 'Woven fabrics of cotton, plain weave',
        category: 'Fabric',
        gst_rate: 5,
        unit_of_measure: 'Meters',
        remarks: 'Cotton plain weave fabrics'
      },
      {
        code: '5209',
        description: 'Woven fabrics of cotton, dyed',
        category: 'Fabric',
        gst_rate: 5,
        unit_of_measure: 'Meters',
        remarks: 'Colored cotton woven fabrics'
      },
      {
        code: '5210',
        description: 'Woven fabrics of cotton, printed',
        category: 'Fabric',
        gst_rate: 5,
        unit_of_measure: 'Meters',
        remarks: 'Printed cotton woven fabrics'
      },
      {
        code: '5407',
        description: 'Woven fabrics of synthetic filament yarn',
        category: 'Fabric',
        gst_rate: 5,
        unit_of_measure: 'Meters',
        remarks: 'Synthetic fiber woven fabrics'
      },
      {
        code: '6203',
        description: 'Men\'s or boys\' suits',
        category: 'Apparel',
        gst_rate: 5,
        unit_of_measure: 'Pieces',
        remarks: 'Complete men suits'
      },
      {
        code: '6204',
        description: 'Women\'s or girls\' suits',
        category: 'Apparel',
        gst_rate: 5,
        unit_of_measure: 'Pieces',
        remarks: 'Complete women suits'
      },
      {
        code: '6205',
        description: 'Men\'s or boys\' shirts',
        category: 'Apparel',
        gst_rate: 5,
        unit_of_measure: 'Pieces',
        remarks: 'Men and boys shirts'
      },
      {
        code: '6206',
        description: 'Women\'s or girls\' blouses and shirts',
        category: 'Apparel',
        gst_rate: 5,
        unit_of_measure: 'Pieces',
        remarks: 'Women blouses and shirts'
      },
      {
        code: '9404',
        description: 'Mattresses, quilts, bedspreads',
        category: 'Textiles',
        gst_rate: 5,
        unit_of_measure: 'Pieces',
        remarks: 'Bedding products'
      },
      {
        code: '8516',
        description: 'Electric heating apparatus',
        category: 'Accessories',
        gst_rate: 18,
        unit_of_measure: 'Pieces',
        remarks: 'Heat press and other equipment'
      },
      {
        code: '9606',
        description: 'Buttons, beads, hooks, eyes',
        category: 'Accessories',
        gst_rate: 12,
        unit_of_measure: 'Dozens',
        remarks: 'Garment buttons and fasteners'
      },
      {
        code: '5807',
        description: 'Labels, badges, edgings',
        category: 'Accessories',
        gst_rate: 12,
        unit_of_measure: 'Meters',
        remarks: 'Fabric labels and trims'
      },
      {
        code: '5903',
        description: 'Textile fabrics, coated with rubber',
        category: 'Fabric',
        gst_rate: 12,
        unit_of_measure: 'Meters',
        remarks: 'Rubber coated fabrics'
      },
      {
        code: '6217',
        description: 'Accessories, garment parts',
        category: 'Accessories',
        gst_rate: 12,
        unit_of_measure: 'Pieces',
        remarks: 'Miscellaneous garment parts'
      },
      {
        code: '4011',
        description: 'Pneumatic tyres',
        category: 'Accessories',
        gst_rate: 18,
        unit_of_measure: 'Pieces',
        remarks: 'Pneumatic tires'
      }
    ];

    for (const hsnCode of hsnCodes) {
      await HSNCode.findOrCreate({
        where: { code: hsnCode.code },
        defaults: hsnCode
      });
    }

    console.log('✓ HSN Codes seeded successfully');
  } catch (error) {
    console.error('Error seeding HSN codes:', error);
  }
};

module.exports = seedHSNCodes;
