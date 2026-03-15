import { Detail } from '@mighty/api';
import { useAI } from '@mighty/utils/useAI';

export default function Command() {
  const { data, isLoading } = useAI('Suggest 5  jazz songs');

  return <Detail isLoading={isLoading} markdown={data} />;
}
