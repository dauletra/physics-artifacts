import { useParams } from 'react-router-dom';
import { ArtifactEditForm } from '../../components/admin/ArtifactEditForm';

export function ArtifactEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {id ? 'Артефактіні өңдеу' : 'Артефакт жасау'}
      </h2>
      <ArtifactEditForm initialGroupId={id} onSaveRedirect="/admin" />
    </div>
  );
}
