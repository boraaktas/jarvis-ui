'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Menu, MessageSquare, History, Settings, Trash2, Download } from 'lucide-react';

interface SidebarProps {
  onClearChat?: () => void;
  onExportChat?: () => void;
  messageCount: number;
}

export function Sidebar({ onClearChat, onExportChat, messageCount }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Current Session */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Current Session
            </h3>
            <div className="space-y-2 ml-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Messages:</span>
                <Badge variant="secondary">{messageCount}</Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Session:</span>
                <span>jarvis-ui</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <History className="h-4 w-4" />
              Actions
            </h3>
            <div className="space-y-2 ml-6">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onExportChat?.();
                  setOpen(false);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Clear all messages? This cannot be undone.')) {
                    onClearChat?.();
                    setOpen(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </h3>
            <div className="space-y-2 ml-6">
              <div className="text-sm text-muted-foreground">
                Gateway: ws://127.0.0.1:18789
              </div>
              <div className="text-sm text-muted-foreground">
                Version: 0.1.1
              </div>
            </div>
          </div>

          <Separator />

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold mb-2">About</h3>
            <p className="text-xs text-muted-foreground ml-6">
              Jarvis UI is a custom chat interface for Clawdbot with advanced model selection and controls.
            </p>
            <div className="mt-2 ml-6">
              <a
                href="https://github.com/boraaktas/jarvis-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
