export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url
  });
} 