/**
 * Safe blob file download helper
 * Handles blob responses properly without triggering XMLHttpRequest errors
 */

export const downloadBlobFile = async (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Safe API call with blob response type
 * Prevents interceptor errors with blob responses
 */
export const downloadFileFromApi = async (api, endpoint, filename) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob',
      // Don't intercept errors for blob responses
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });

    if (!response.data) {
      throw new Error('Empty response received');
    }

    // Check if response is actually an error (JSON error response misidentified as blob)
    if (response.data.type === 'application/json' || response.data instanceof ArrayBuffer) {
      try {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || 'API Error');
      } catch (parseError) {
        // Not JSON, continue with blob download
      }
    }

    await downloadBlobFile(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
    throw error;
  }
};