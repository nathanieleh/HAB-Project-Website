import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="text-lg font-bold">
                <Link href="/">MyApp</Link>
            </div>
            <ul className="flex space-x-4">
                <li>
                <Link href="/about">Forecasts</Link>
                </li>
                <li>
                <Link href="/contact">About</Link>
                </li>
            </ul>
        </nav>
    );
}
