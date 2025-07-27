import React, { useState } from 'react';
import { FaTachometerAlt, FaProductHunt, FaSalesforce, FaStackExchange } from 'react-icons/fa';
import { HelpingHand, LogOut, NotebookTabs, Settings } from 'lucide-react';

const Menu = () => {
  const [activeLabel, setActiveLabel] = useState(null);

  const handleItemClick = (text) => {
    setActiveLabel(activeLabel === text ? null : text);
  };

  return (
    <>
      <nav className="h-screen bg-gray-200 flex flex-row px-10 w-[10%] md:w-fit px-2 md:px-6 py-6 mt-10 ">
        <ul className="space-y-2 w-full">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="text-[#34495e] hover:cursor-pointer lg:hover:bg-white px-2 font-bold rounded py-3 left-0 w-full lg:w-fit relative"
              onClick={() => handleItemClick(item.text)}
            >
              <a className="flex items-center gap-2 justify-center md:justify-start" href={item.link || '#'} >
                {item.icon}
                {/* Show text on desktop, hide on mobile unless clicked */}
                <span className={`hidden md:inline text-sm ${activeLabel === item.text ? 'md:hidden' : ''}`}>
                  {item.text}
                </span>
                {/* Mobile tooltip (appears when clicked) */}
                {activeLabel === item.text && (
                  <span className="md:hidden absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {item.text}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

// Menu items data
const menuItems = [
  { icon: <FaTachometerAlt className="!text-xl text-black shrink-0" />, text: 'Dashboard' , link:'/Dashboard'},
  { icon: <FaProductHunt className="!text-xl text-black shrink-0" />, text: 'Product', link:'/Product' },
  { icon: <FaSalesforce className="!text-xl text-black shrink-0" />, text: 'Sales', link:'/Sale' },
  { icon: <FaStackExchange className="!text-xl text-black shrink-0" />, text: 'Expenses', link: '?Expenses' },
  { icon: <NotebookTabs className="!text-xl text-black shrink-0" />, text: 'Report',link:'?Report' },
  { icon: <Settings className="!text-xl text-black shrink-0" />, text: 'Settings',link:'' },
  { icon: <HelpingHand className="!text-xl text-black shrink-0" />, text: 'Help', link: '' },
  { icon: <LogOut className="!text-xl text-black shrink-0" />, text: 'logout',link:'/logout' },
  
];

export default Menu;