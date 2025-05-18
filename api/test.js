export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    message: 'Test successful',
    timestamp: new Date().toISOString(),
    method: req.method,
    body: req.body
  });
} 