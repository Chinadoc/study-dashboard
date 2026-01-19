import { redirect } from 'next/navigation';

export default function Home() {
    // Redirect to browse page as the default landing
    redirect('/browse');
}
