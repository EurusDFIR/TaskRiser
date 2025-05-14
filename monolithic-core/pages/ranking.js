// monolithic-core/pages/ranking.js (ví dụ Pages Router)
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Để tạo link quay lại dashboard

// Hàm tính Level (có thể import từ utils nếu dùng chung)
function calculateLevel(exp) {
    if (exp < 100) return 1;
    if (exp < 300) return 2;
    if (exp < 600) return 3;
    if (exp < 1000) return 4;
    return 5;
}


export default function RankingPage() {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError('');
      try {
        // Không cần token nếu API ranking là public
        const res = await fetch('/api/ranking');
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch ranking');
        }
        const data = await res.json();
        setRankingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) return <p>Loading ranking...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h1>Top Players Ranking</h1>
      <Link href="/dashboard">Back to Dashboard</Link>
      {rankingData.length === 0 ? (
        <p>No ranking data available yet.</p>
      ) : (
        <ol>
          {rankingData.map((user, index) => (
            <li key={user.id}>
              <p>
                <strong>{index + 1}. {user.username}</strong>
              </p>
              <p>EXP: {user.totalExp}</p>
              <p>Level: {calculateLevel(user.totalExp)}</p> {/* Hiển thị level cho từng user trong ranking */}
            </li>
          ))}
        </ol>
      )}
      <style jsx>{` /* Optional: Basic styling */
         ol {
             list-style-type: none;
             padding: 0;
         }
         li {
             border: 1px solid #eee;
             margin-bottom: 10px;
             padding: 10px;
             border-radius: 5px;
         }
         li p {
             margin: 5px 0;
         }
      `}</style>
    </div>
  );
}