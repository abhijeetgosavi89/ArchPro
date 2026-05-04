import { redirect } from 'next/navigation';

// Old /downloads route — redirect users to their orders page
export default function DownloadsRedirectPage() {
    redirect('/orders');
}
