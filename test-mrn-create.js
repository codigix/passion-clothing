const axios = require('axios');

async function testMRNCreate() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');

    // Test MRN creation
    console.log('📝 Creating MRN...');
    const mrnData = {
      project_name: 'Test Project - MRN API Test',
      priority: 'high',
      required_by_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Test MRN creation from API',
      materials_requested: [
        {
          material_name: 'Cotton Fabric',
          material_code: 'MAT-001',
          quantity_required: 100,
          uom: 'meters',
          purpose: 'Testing MRN API',
          rate: 50
        },
        {
          material_name: 'Thread',
          material_code: 'MAT-002',
          quantity_required: 10,
          uom: 'spools',
          purpose: 'Testing MRN API',
          rate: 25
        }
      ]
    };

    const mrnResponse = await axios.post(
      'http://localhost:5000/api/project-material-requests/create',
      mrnData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ MRN Created Successfully!\n');
    console.log('Response:', JSON.stringify(mrnResponse.data, null, 2));
    console.log('\n🎉 Test Passed!');
    
  } catch (error) {
    console.error('❌ Test Failed!');
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMRNCreate();