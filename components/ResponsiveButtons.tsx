import { useState, useEffect, useRef } from 'react';
import { Menu } from '@headlessui/react';
import { Earth, Box, Paintbrush, Languages, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button'; // Assuming you have a Button component

const ResponsiveButtons = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleButtons, setVisibleButtons] = useState(['attachment', 'webSearch', 'document', 'createImage', 'language']);
  const [overflowButtons, setOverflowButtons] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Estimate each button's width (adjust as needed)
        const buttonWidth = 100;
        const maxVisible = Math.floor(containerWidth / buttonWidth);
        const allButtons = ['attachment', 'webSearch', 'document', 'createImage', 'language'];
        setVisibleButtons(allButtons.slice(0, maxVisible));
        setOverflowButtons(allButtons.slice(maxVisible));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  interface ButtonProps {
      type: string;
  }

  const renderButton = (type: string): JSX.Element | null => {
      switch (type) {
          case 'webSearch':
              return (
                  <Button key="webSearch">
                      <Earth />
                      <span className="text-xs">Web Search</span>
                  </Button>
              );
          case 'document':
              return (
                  <Button key="document">
                      <Box />
                      <span className="text-xs">Document</span>
                  </Button>
              );
          case 'createImage':
              return (
                  <Button key="createImage">
                      <Paintbrush />
                      <span className="text-xs">Create Image</span>
                  </Button>
              );
          case 'language':
              return (
                  <Button key="language">
                      <Languages />
                      <span className="text-xs">Language</span>
                  </Button>
              );
          default:
              return null;
      }
  };

  return (
    <div ref={containerRef} className="flex items-center space-x-2">
      {visibleButtons.map((btn) => renderButton(btn))}
      {overflowButtons.length > 0 && (
        <Menu as="div" className="relative">
          <Menu.Button className="p-2 rounded-full hover:bg-gray-200">
            <MoreHorizontal />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
            {overflowButtons.map((btn) => (
              <Menu.Item key={btn}>
                {({ active }) => (
                  <div className={`px-4 py-2 ${active ? 'bg-gray-100' : ''}`}>
                    {renderButton(btn)}
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      )}
    </div>
  );
};

export default ResponsiveButtons;