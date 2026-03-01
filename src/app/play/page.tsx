import GameWrapper from '@/components/ui/GameWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Void Hulk - Play',
  description: 'Explore the derelict ship. Purge the alien infestation.',
};

export default function PlayPage() {
  return <GameWrapper />;
}
