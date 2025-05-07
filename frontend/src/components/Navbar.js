import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 bg-navbar/40 text-white">
            <div className="text-lg font-bold">
                <Link href="/">
                    <Image
                        src="/hknlogo3.svg"
                        className="ml-8"
                        alt="HKN Logo"
                        width={130}
                        height={40}
                    />
                </Link>
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
