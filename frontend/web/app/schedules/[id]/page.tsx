import ScheduleDetailClient from './ScheduleDetailClient';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function ScheduleDetailPage() {
  return <ScheduleDetailClient />;
}
