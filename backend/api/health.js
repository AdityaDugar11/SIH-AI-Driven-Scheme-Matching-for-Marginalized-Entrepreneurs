module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/recommend', '/api/calculate-emi', '/api/nearest-partners']
  });
};
