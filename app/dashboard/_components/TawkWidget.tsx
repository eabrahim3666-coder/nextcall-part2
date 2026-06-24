"use client";

import { useEffect } from "react";

export default function TawkWidget({ propertyId, widgetId }: { propertyId: string; widgetId: string }) {
    useEffect(() => {
        // Prevent duplicates
        if (document.getElementById("tawk-script")) return;

        const script = document.createElement("script");
        script.id = "tawk-script";
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.async = true;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        document.head.appendChild(script);

        return () => {
            // Cleanup on unmount
            const existing = document.getElementById("tawk-script");
            if (existing) existing.remove();
            // Remove tawk widget if present
            const widget = document.getElementById("tawk-bubble");
            if (widget) widget.remove();
        };
    }, [propertyId, widgetId]);

    return null;
}