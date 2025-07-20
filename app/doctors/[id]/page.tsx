import { getDoctorById } from '@/lib/auth';
import DoctorProfile from './DoctorProfile';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function DoctorPage({ params }: { params: { id: string } }) {
  return <DoctorProfile doctorId={params.id} />;
}