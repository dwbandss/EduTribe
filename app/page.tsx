import { redirect } from 'next/navigation';

// This page redirects root to login
export default function RootPage() {
  redirect('/login');
}
