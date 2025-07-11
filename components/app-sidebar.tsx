'use client';

import type { User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
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

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0 glass-effect">
      <SidebarHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <SidebarMenu>
          <div className="flex flex-col gap-3">
            {/* ChatThing Title */}
            <div className="flex flex-row justify-center items-center">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-3 items-center"
              >
                <span className="text-lg font-semibold px-2 hover:bg-primary/10 rounded-md cursor-pointer transition-colors duration-200 bg-gradient-to-r from-primary/80 to-accent/80 bg-clip-text">
                   ChatThing
                </span>
              </Link>
            </div>
            
            {/* Centered New Chat Button */}
            <div className="flex flex-row justify-center items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full max-w-40 hover:bg-primary/10 transition-colors duration-200"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push('/');
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                    <span className="ml-2">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="center">Start a new conversation</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-transparent to-muted/20">
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
