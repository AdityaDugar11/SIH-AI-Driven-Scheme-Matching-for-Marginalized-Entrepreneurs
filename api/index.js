module.exports = (req, res) => {
  res.status(200).json({
    project: 'SIH — AI-Driven Scheme Matching for Marginalized Entrepreneurs',
    endpoints: {
      health: 'GET /api/health',
      recommend: 'POST /api/recommend',
      calculate_emi: 'POST /api/calculate-emi',
      nearest_partners: 'POST /api/nearest-partners'
    },
    docs: 'See TECH_STACK.md for API contract details'
  });
};
