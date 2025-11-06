const axios = require("axios");

async function testDepartmentOverview() {
  try {
    console.log("Testing department-overview endpoint...");

    // Create a test token (you may need to use a valid token from your system)
    const token = "test-token";

    const response = await axios.get(
      "http://localhost:5000/api/admin/department-overview",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Success! Response:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error calling endpoint:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

testDepartmentOverview();
