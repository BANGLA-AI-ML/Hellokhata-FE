// Hello Khata OS - Premium Header Component
// Sticky Header with backdrop blur and solid background

'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Bell, Search, Menu, Globe, LogOut, Sparkles, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/premium';
import { useSessionStore } from '@/stores/sessionStore';
import { useUiStore } from '@/stores/uiStore';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useMarkAsReadNotification, useNotifications, useReadAllNotifications } from '@/hooks/api/useNotifications';
import { cn } from '@/lib/utils';
import { BranchSwitcher, BackButton } from '@/components/common';
import { useGetMyFeatures } from '@/hooks/api/useFeaturesPlan';
import Link from 'next/link';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
  onOpenVoice?: () => void;
}

export function Header({ onOpenCommandPalette, onOpenVoice }: HeaderProps) {
  const { user, logout } = useSessionStore();
  const { setMobileMenuOpen, unreadNotifications } = useUiStore();
  const { t, isBangla, changeLanguage } = useAppTranslation();
  const { data: notificationsData } = useNotifications();
  
  const {data: featuresData,isLoading:isLoadingFeatures} = useGetMyFeatures();
  const plan = !isLoadingFeatures && featuresData[0]?.plan
  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : (Array.isArray((notificationsData as any)?.data) ? (notificationsData as any).data : []);

  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  const { mutate: readAllNotifications, isPending: isReadingAll } = useReadAllNotifications();
  const {mutate: markAsReadNotification} = useMarkAsReadNotification();
  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notificationsData]);

  const handleMarkAsRead = (id: string) => {
  markAsReadNotification(id,{
    onSuccess: data =>{
      if(data.success){
        setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
      }
    }

  })
  };

  const handleReadAll = () => {
    readAllNotifications(undefined, {
      onSuccess: () => {
        setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    });
  };

  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  const filteredNotifications = localNotifications.filter(n => {
    if (filter === 'read') return n.isRead === true;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const [scrolled, setScrolled] = useState(false);
  
  // Use useSyncExternalStore for safe client-side only rendering
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    changeLanguage(isBangla ? 'en' : 'bn');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const planBadgeColor = {
    free: 'bg-muted text-muted-foreground',
    business: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pro: 'bg-primary-subtle text-primary',
    ai: 'bg-gradient-to-r from-primary-subtle to-emerald-100 text-primary dark:from-primary/20 dark:to-emerald-900/30',
  };


  return (
    <header 
      className={cn(
        "sticky top-0 z-30",
        "flex h-16 items-center gap-3 px-4 md:px-6",
        "transition-all duration-200",
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" 
          : "bg-background border-b border-border-subtle"
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global Back Navigation Button */}
      {/* <BackButton
        variant="subtle"
        size="sm"
        className="shrink-0"
      /> */}

      {/* Branch Switcher - Show on desktop */}
      <div className="hidden md:block">
        <BranchSwitcher compact />
      </div>

      {/* Search Bar / Command Palette Trigger - Takes remaining space */}
      <div className="flex-1 flex justify-center md:justify-start">
        <button
          onClick={() => {
            if (onOpenCommandPalette) {
              onOpenCommandPalette();
            } else {
              const event = new CustomEvent('openCommandPalette');
              window.dispatchEvent(event);
            }
          }}
          className="w-full max-w-[500px] h-10 px-4 rounded-xl bg-muted/50 border border-border-subtle hover:bg-muted transition-colors text-muted-foreground hover:text-foreground group hidden md:flex items-center gap-2"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-sm flex-1 text-left">
            {isBangla ? 'খুঁজুন বা কমান্ড লিখুন...' : 'Search....'}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] border border-border-subtle group-hover:bg-card">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] border border-border-subtle group-hover:bg-card">K</kbd>
          </div>
        </button>
      </div>

      {/* Spacer to push right actions to the edge */}
      <div className="hidden lg:block flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Health Score Badge */}
        <button
          onClick={() => window.location.href = '/sales/new'}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-primary rounded-xl hover:bg-primary/70 transition-colors  text-white"
          title={isBangla ? 'পয়েন্ট অফ সেল (POS)' : 'Point of Sale (POS)'}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-bold">POS</span>
        </button>
        
        {/* Voice Mic (Primary CTA) */}
        <button
          onClick={() => {
            if (onOpenVoice) {
              onOpenVoice();
            } else {
              const event = new CustomEvent('openVoiceModal');
              window.dispatchEvent(event);
            }
          }}
          className={cn(
            'relative h-10 w-10 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
            'hover:opacity-90 transition-opacity shadow-md',
            'pulse-animation'
          )}
          title={isBangla ? 'ভয়েস AI' : 'Voice AI'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          title={isBangla ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          className="text-muted-foreground hover:text-foreground hidden sm:flex"
        >
          <Globe className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border flex flex-col max-h-[480px]">
            <DropdownMenuLabel className="flex items-center justify-between shrink-0">
              <span>{isBangla ? 'নোটিফিকেশন' : 'Notifications'}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm">{unreadCount}</Badge>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] text-primary hover:bg-primary/10 rounded-md font-medium flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReadAll();
                    }}
                    disabled={isReadingAll}
                  >
                    {isReadingAll ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      isBangla ? 'সব পঠিত করুন' : 'Mark all read'
                    )}
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-subtle shrink-0" />
            
            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-muted/40 border-b border-border-subtle shrink-0">
              <Button 
                variant={filter === 'all' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="flex-1 text-[11px] h-7 rounded-md font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter('all');
                }}
              >
                {isBangla ? 'সব' : 'All'}
              </Button>
              <Button 
                variant={filter === 'unread' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="flex-1 text-[11px] h-7 rounded-md font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter('unread');
                }}
              >
                {isBangla ? 'অপঠিত' : 'Unread'}
              </Button>
              <Button 
                variant={filter === 'read' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="flex-1 text-[11px] h-7 rounded-md font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter('read');
                }}
              >
                {isBangla ? 'পঠিত' : 'Read'}
              </Button>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredNotifications && filteredNotifications.length > 0 ? (
                <div className="py-1">
                  {filteredNotifications.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "px-4 py-3 border-b border-border-subtle last:border-0 transition-colors flex flex-col gap-2",
                        notification.read ? "bg-card hover:bg-muted/10" : "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn("text-sm font-semibold text-foreground", !notification.isRead && "text-primary")}>
                            {isBangla && notification.titleBn ? notification.titleBn : notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isBangla && notification.messageBn ? notification.messageBn : notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        {notification.createdAt ? (
                          <p className="text-[10px] text-muted-foreground/60">
                            {new Date(notification.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        ) : <div />}
                        
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] hover:bg-primary/20 text-primary hover:text-primary-foreground font-medium rounded-md"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            {isBangla ? 'পঠিত চিহ্নিত করুন' : 'Mark as Read'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isBangla ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-border-subtle hover:ring-primary/30 transition-all duration-200 p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.email ? undefined : undefined} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-emerald text-primary-foreground text-sm font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-card border-border">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald text-primary-foreground text-sm font-semibold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.phone}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isBangla ? 'প্ল্যান' : 'Plan'}</span>
                  <Badge className={cn('text-xs capitalize', planBadgeColor[plan])}>
                    {plan}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
              <a href="/settings#profile" className="flex items-center gap-2">
                <span>{t('settings.profile')}</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
              <a href="/settings#business" className="flex items-center gap-2">
                <span>{t('settings.businessProfile')}</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
              <Link href="/plans" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{isBangla ? 'প্ল্যান আপগ্রেড' : 'Upgrade Plan'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive-subtle focus:bg-destructive-subtle"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('settings.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
