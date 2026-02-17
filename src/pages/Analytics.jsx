import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoDashboard from '../components/VideoDashboard';

function Analytics() {
  const { videoId } = useParams();

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Dashboard */}
      <VideoDashboard videoId={videoId} />
    </div>
  );
}

export default Analytics;
