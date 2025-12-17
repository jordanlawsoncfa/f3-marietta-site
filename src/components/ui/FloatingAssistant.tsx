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
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-8 sm:right-8">
            {/* Chat Panel */}
            <div
                className={cn(
                    "mb-4 w-[90vw] sm:w-[400px] rounded-xl border border-border bg-muted shadow-2xl transition-all duration-300 origin-bottom-right overflow-hidden flex flex-col max-h-[80vh]",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0 mb-0"
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
                        className="h-8 w-8 rounded-full hover:bg-background/80"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <AssistantWidget key={sessionKey} compact />
                </div>
            </div>

            {/* Toggle Button */}
            <Button
                onClick={() => isOpen ? handleClose() : setIsOpen(true)}
                size="lg"
                className={cn(
                    "rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 px-6 py-3 h-auto",
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
    );
}
