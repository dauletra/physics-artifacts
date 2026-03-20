import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ArtifactEditForm } from '../../components/admin/ArtifactEditForm';

export function ArtifactEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin"
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Тізімге</span>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {id ? 'Артефактіні өңдеу' : 'Артефакт жасау'}
        </h2>
      </div>
      <ArtifactEditForm initialGroupId={id} onSaveRedirect="/admin" />
    </div>
  );
}
