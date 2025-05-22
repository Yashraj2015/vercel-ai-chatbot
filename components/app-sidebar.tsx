'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Version } from '../components/Version';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import img from '../public/images/logo.png'

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0 ">
      <SidebarHeader>
        <SidebarMenu>
          <div className='flex '>
            <SidebarToggle/>
            <div className='ml-auto my-auto md:hidden'>
              <Version/>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center  w-full">

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                  className="flex flex-row gap-3 items-center w-full "
                >
                  <span className="text-base font-medium w-full  p-2 hover:bg-muted bg-[#292a2d] rounded-xl cursor-pointer">
                    <div className='flex flex-row gap-2'>
                      <Image src={img} alt='' width={27} />
                      <span className='h-fit mt-[2px]'>
                        Srushti
                      </span>
                    </div>

                        <Button
                          variant="ghost"
                          type="button"
                          className="p-2 top-14 md:top-[53px] h-fit absolute right-3 hover:bg-transparent"
                          onClick={() => {
                            setOpenMobile(false);
                            router.push('/');
                            router.refresh();
                          }}
                        >
                          <PlusIcon />
                        </Button>
                  </span>
                  
                </Link>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
