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

            <div className="min-h-screen bg-gradient-to-br from-[#221426]/95 via-[#1D1340]/90 to-[#445EF2]/90 text-[#F2F2F2] font-['Orbitron',_sans-serif] backdrop-blur-xl">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </>
    );
} 