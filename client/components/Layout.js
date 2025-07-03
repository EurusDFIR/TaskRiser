import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <>
            <Head>
                <title>TaskRiser</title>
                <meta name="description" content="TaskRiser - Your Task Management System" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-[#0077b6] via-[#00b4d8] to-[#90e0ef] text-[#0077b6] font-['Orbitron',_sans-serif] backdrop-blur-xl">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </>
    );
} 
