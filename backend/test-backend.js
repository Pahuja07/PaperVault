import fetch from 'node-fetch';

try {
  const response = await fetch('http://localhost:8000/papers');
  const data = await response.json();
  console.log('✅ Backend is running!');
  console.log(`Papers count: ${data.papers?.length || 0}`);
} catch (err) {
  console.log('❌ Backend not responding:', err.message);
}
