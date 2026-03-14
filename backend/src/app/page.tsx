export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Credo API</h1>
      <p>Backend API is running. Available endpoints:</p>
      <ul>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/login</li>
        <li>GET /api/auth/me</li>
        <li>PUT /api/auth/me</li>
        <li>GET /api/workouts</li>
        <li>POST /api/workouts</li>
        <li>GET /api/scores</li>
        <li>POST /api/scores</li>
        <li>POST /api/sync</li>
      </ul>
    </div>
  );
}
