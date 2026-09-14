'use client';

import dynamic from 'next/dynamic';
import PortalLoading from '../components/PortalLoading';

const HospitalApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <PortalLoading />,
});

export default function Page() {
  return <HospitalApp />;
}
