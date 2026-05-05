const ZUPER_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7104/api';

// NOTE: Headers are now handled by the Backend Proxy (for security & CORS)
const getHeaders = () => ({
  'Content-Type': 'application/json'
});

export const fetchJobDetails = async (jobIdentifier) => {
  try {
    let identifier = jobIdentifier.trim();

    // Check if it's a full URL and extract UUID
    // Example: https://web.zuperpro.com/jobs/092c2f81-b125-4fd3-8d74-fdaade1c7386/details
    if (identifier.includes('/jobs/')) {
      const urlMatch = identifier.match(/\/jobs\/([0-9a-fA-F-]{36})/);
      if (urlMatch && urlMatch[1]) {
        identifier = urlMatch[1];
        console.log(`[Frontend] Extracted UUID from URL: ${identifier}`);
      }
    }

    console.log(`[Frontend] Fetching job via Proxy: ${identifier}`);

    // The backend handles UUID vs Job Code logic now. Just pass it through.
    const response = await fetch(`${ZUPER_API_BASE}/jobs/${encodeURIComponent(identifier)}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Proxy Error: ${response.status}`);
    }

    const json = await response.json();
    console.log('[Frontend] Data received:', json);

    // Unwrap Zuper response structure { type: 'success', data: { ... } }
    const jobData = json.data || json;
    return jobData;

  } catch (error) {
    console.error('Error fetching job from Proxy:', error);
    throw error;
  }
};

export const fetchJobActivities = async (jobId) => {
  try {
    const response = await fetch(`${ZUPER_API_BASE}/jobs/${jobId}/activities`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};
