import { Ticket } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-primary flex items-center justify-center animate-pulse">
                    <Ticket className="w-6 h-6 text-black" />
                </div>
                <div className="text-sm text-muted font-mono">LOADING...</div>
            </div>
        </div>
    );
}
