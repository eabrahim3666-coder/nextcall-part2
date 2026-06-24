"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Define the shape of our parsed call data
type Call = {
    call_id: string;
    customer_name: string;
    purpose: string;
    raw_summary: string;
    agent_name: string;
    timestamp: string;
};

export default function CallLogsTable({ calls }: { calls: Call[] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Agent</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calls.map((call) => (
                        <TableRow key={call.call_id}>
                            {/* Date & Time */}
                            <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                {call.timestamp ? new Date(call.timestamp).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : "N/A"}
                            </TableCell>

                            {/* Customer Name */}
                            <TableCell>
                                <div className="font-medium text-gray-900">{call.customer_name}</div>
                            </TableCell>

                            {/* Purpose */}
                            <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                                    {call.purpose}
                                </Badge>
                            </TableCell>

                            {/* Raw Summary */}
                            <TableCell className="max-w-[250px] truncate text-gray-500 text-sm">
                                {call.raw_summary}
                            </TableCell>

                            {/* Agent Name */}
                            <TableCell className="text-sm text-gray-500">
                                {call.agent_name}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}