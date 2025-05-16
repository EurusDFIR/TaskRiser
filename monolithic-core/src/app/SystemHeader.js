// SystemHeader.js
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { GiSpikedDragonHead } from 'react-icons/gi';

export default function SystemHeader({ userData, onLogout }) {
  return (
    <header className="bg-[#f8fdff]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-[#90e0ef]/60 shadow-xl sticky top-0 z-50">
      <div className="flex items-center">
        <GiSpikedDragonHead size={40} className="text-[#0077b6] mr-3 drop-shadow-[0_0_8px_rgba(0,119,182,0.5)]" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
          <span className="text-[#0077b6]">SYSTEM</span> <span className="text-[#00b4d8]">INTERFACE</span>
        </h1>
      </div>
      <nav className="flex items-center space-x-3 md:space-x-4">
        {userData && (
            <div className="hidden md:flex items-center space-x-2 bg-[#caf0f8] px-3 py-1.5 rounded-lg border border-[#90e0ef]">
                <FaUserCircle className="text-[#00b4d8]" size={18}/>
                <span className="text-sm font-semibold text-[#0077b6]">{userData.username}</span>
            </div>
        )}
        <button
          onClick={onLogout}
          className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#48cae4] text-white font-semibold py-2 px-3 md:px-4 rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150 flex items-center text-sm"
        >
          <FaSignOutAlt className="mr-2 opacity-90" /> LOGOUT
        </button>
      </nav>
    </header>
  );
}
