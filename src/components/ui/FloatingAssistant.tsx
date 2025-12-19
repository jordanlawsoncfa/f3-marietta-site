"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AssistantWidget } from "@/components/ui/AssistantWidget";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionKey, setSessionKey] = useState(0);

    const handleClose = () => {
        setIsOpen(false);
        // Increment session key to reset widget state on next open
        setSessionKey((prev) => prev + 1);
    };

    return (
        <>
            {/* Backdrop Overlay - only visible on mobile when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                    onClick={handleClose}
                    aria-hidden="true"
                />
            )}

            <div className="fixed bottom-0 left-0 right-0 sm:bottom-8 sm:right-8 sm:left-auto z-50 flex flex-col items-center sm:items-end">
                {/* Chat Panel */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "w-full sm:w-[400px] sm:mb-4 rounded-t-2xl sm:rounded-xl border border-border bg-muted shadow-2xl transition-all duration-300 origin-bottom overflow-hidden flex flex-col",
                        // Mobile: slide up from bottom, Desktop: scale from bottom-right
                        isOpen
                            ? "opacity-100 translate-y-0 max-h-[85vh] sm:max-h-[80vh] sm:scale-100"
                            : "opacity-0 translate-y-full sm:translate-y-4 sm:scale-95 pointer-events-none max-h-0 sm:h-0"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                        <div>
                            <h3 className="font-bold font-heading text-lg">Need help?</h3>
                            <p className="text-xs text-muted-foreground">AI Assistant</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-10 w-10 sm:h-8 sm:w-8 rounded-full hover:bg-background/80"
                        >
                            <X className="h-5 w-5 sm:h-4 sm:w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <AssistantWidget key={sessionKey} compact />
                    </div>
                </div>

                {/* Toggle Button */}
                <div className={cn(
                    "p-4 sm:p-0",
                    // On mobile when panel is open, hide the toggle button
                    isOpen && "hidden sm:block"
                )}>
                    <Button
                        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
                        size="lg"
                        className={cn(
                            "rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 px-6 py-3 h-auto min-h-[48px]",
                            isOpen ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-[#3A5E88]"
                        )}
                    >
                        {isOpen ? (
                            <>
                                <X className="h-5 w-5" />
                                <span className="font-medium">Close</span>
                            </>
                        ) : (
                            <>
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-medium">Need help?</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    );
}
