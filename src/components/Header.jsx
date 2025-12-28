import Link from 'next/link';
import DarkModeSwitch from './DarkModeSwitch';

export default function Header() {
  return (
    <div className='flex justify-between items-center p-3 max-w-6xl mx-auto'>
      <ul className='flex gap-4'>
        <li className='hidden sm:block'>
          <Link href={'/'}>Home</Link>
        </li>
        <li className='hidden sm:block'>
          <Link href={'/about'}>About</Link>
        </li>
      </ul>
      <div className='flex items-center gap-4'>
        <DarkModeSwitch />
        <Link href={'/'} className='flex gap-1 items-center'>
          <span className='text-2xl font-bold py-1 px-2 rounded-lg'>
            <span className='text-red-600 dark:text-red-500'>PLOT</span>
            <span className='text-blue-600 dark:text-blue-500'>TWIST</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
