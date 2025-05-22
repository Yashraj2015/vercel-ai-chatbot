import { motion } from 'framer-motion';
import img from '../public/images/banner.png'
import Image from 'next/image';

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

export const Greeting = () => {
  const greeting = getTimeBasedGreeting();

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl flex gap-3 font-semibold"
      >
      <Image src={img} alt='' width={160}/>
        

      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-zinc-500 flex flex-row mt-6"
      >
          <div className=''>
            Good {greeting}
          </div>
        , How can I help?
      </motion.div>
    </div>
  );
};