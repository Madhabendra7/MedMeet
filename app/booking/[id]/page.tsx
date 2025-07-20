import BookingForm from './BookingForm';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function BookingPage({ params }: { params: { id: string } }) {
  return <BookingForm bookingId={params.id} />;
}