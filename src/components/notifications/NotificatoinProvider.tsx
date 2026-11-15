'use client'
import { useEffect } from "react";
import { toast } from "sonner";
import { useSessionStore } from "@/stores/sessionStore";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api`;

const waitBeforeReconnect = (signal: AbortSignal) => new Promise<void>((resolve) => {
    if (signal.aborted) {
        resolve();
        return;
    }

    const finish = () => {
        window.clearTimeout(timeout);
        signal.removeEventListener("abort", finish);
        resolve();
    };
    const timeout = window.setTimeout(finish, 3000);
    signal.addEventListener("abort", finish, { once: true });
});

const NotificatoinProvider = ({ children }: { children: React.ReactNode }) => {
    const token = useSessionStore((state) => state.token);

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        const streamUrl = `${apiBaseUrl}/notifications/stream`;

        const showEvent = (frame: string) => {
            let eventType = "message";
            const dataLines: string[] = [];

            for (const line of frame.split(/\r?\n/)) {
                if (!line || line.startsWith(":")) continue;
                const separator = line.indexOf(":");
                const field = separator < 0 ? line : line.slice(0, separator);
                const value = separator < 0 ? "" : line.slice(separator + 1).replace(/^ /, "");

                if (field === "event") eventType = value;
                if (field === "data") dataLines.push(value);
            }

            if (!dataLines.length || eventType === "ping") return;

            try {
                const notification = JSON.parse(dataLines.join("\n"));
                toast(`🔔 ${notification.title || "Notification"}\n${notification.message || ""}`);
            } catch {
                // Ignore malformed keepalive or notification frames.
            }
        };

        const readStream = async (body: ReadableStream<Uint8Array>) => {
            const reader = body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            try {
                while (!controller.signal.aborted) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const frames = buffer.split(/\r?\n\r?\n/);
                    buffer = frames.pop() || "";
                    frames.forEach(showEvent);
                }
            } finally {
                reader.releaseLock();
            }
        };

        const connect = async () => {
            while (!controller.signal.aborted) {
                try {
                    const response = await fetch(streamUrl, {
                        headers: {
                            Accept: "text/event-stream",
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: "include",
                        signal: controller.signal,
                    });

                    if (!response.ok) {
                        if (response.status < 500) return;
                    } else {
                        if (!response.body) return;
                        await readStream(response.body);
                    }
                } catch {
                    if (controller.signal.aborted) return;
                }

                await waitBeforeReconnect(controller.signal);
            }
        };

        void connect();

        return () => {
            controller.abort();
        };
    }, [token]);
    return (
        <div>
            {children}
        </div>
    )
}

export default NotificatoinProvider
