'use client'

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useParams } from 'next/navigation';
import { calculateConversationMetrics, ConversationMetrics } from '@/services/conversation-metrics';
import ReactMarkdown from 'react-markdown';
import { Visit } from '@/types';

export default function VisitPage() {
  const params = useParams<{ slug: string }>()
  const sessionId = params.slug;
  const messages = useSelector((state: RootState) => state.thread.messages);
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalMessages: 0,
    chatDuration: '-',
    averageTimeBetweenMessages: '-'
  });
  const [visitData, setVisitData] = useState<Visit | null>(null);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visitSummary, setVisitSummary] = useState<string | null>(null);

  // Format date to US format (MM/DD/YYYY, hh:mm AM/PM)
  const formatDate = (date: Date | undefined | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Analyze the visit on page load
  useEffect(() => {
    const analyzeVisit = async () => {
      try {
        setIsAnalyzing(true);

        // Call the analyze endpoint directly
        // The endpoint is responsible for ensuring it doesn't analyze twice
        const response = await fetch(`/api/visits/${sessionId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to analyze the visit');
        }

        const analysisResult = await response.json();
        setVisitData(analysisResult);
        setVisitSummary(analysisResult.summary);

        // Extract action items from toolCalls
        if (analysisResult.toolCalls) {
          const toolCallsArray = analysisResult.toolCalls.split(',');
          setActionItems(toolCallsArray.map((call: string) => {
            return `${call.charAt(0).toUpperCase() + call.slice(1).replace(/([A-Z])/g, ' $1')}`;
          }));
        }

        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing visit:', error);
        setIsAnalyzing(false);
      }
    };

    if (sessionId) {
      analyzeVisit();
    }
  }, [sessionId]);

  // FIXME: we should calculate metrics on the server side (no endpoint exists atm)
  useEffect(() => {
    if (messages.length === 0) {
      return
    }

    const calculatedMetrics = calculateConversationMetrics(messages);
    setMetrics(calculatedMetrics);
    console.log(calculatedMetrics);
    setIsLoading(false);
  }, [messages]);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-indigo-50">
      {isAnalyzing && (
        <div
          className="fixed inset-0 h-screen w-screen bg-indigo-600 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.preventDefault();
          }}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold mb-3">Analyzing visit...</h2>
            <p className="text-gray-600 mt-2">This process may take a few moments. Please wait.</p>
          </div>
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500">
        <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
          <span className="mr-2">Overview</span>
          <div className="h-1 flex-grow bg-indigo-100 rounded-full"></div>
        </h2>

        {/* First row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-indigo-600 font-medium">Visit ID</p>
            <p className="text-2xl font-bold text-gray-800">{sessionId}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-blue-600 font-medium">Created At</p>
            <p className="text-lg font-bold text-gray-800">{formatDate(visitData?.createdAt)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-purple-600 font-medium">Analyzed At</p>
            <p className="text-lg font-bold text-gray-800">{formatDate(visitData?.analyzedAt)}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-green-600 font-medium">Visit Duration</p>
            {!isLoading ? (
              <p className="text-2xl font-bold text-gray-800">{metrics.chatDuration}</p>
            ) : (
              <p className="text-2xl font-bold text-gray-400">-</p>
            )}
          </div>
          <div className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-amber-600 font-medium">Total Messages</p>
            {!isLoading ? (
              <p className="text-2xl font-bold text-gray-800">{metrics.totalMessages}</p>
            ) : (
              <p className="text-2xl font-bold text-gray-400">-</p>
            )}
          </div>
          <div className="bg-teal-50 p-4 rounded-lg shadow-sm border border-teal-100 flex-1 hover:shadow-md transition-shadow duration-300">
            <p className="text-sm text-teal-600 font-medium">Avg. Time Between Messages</p>
            {!isLoading ? (
              <p className="text-2xl font-bold text-gray-800">{metrics.averageTimeBetweenMessages}</p>
            ) : (
              <p className="text-2xl font-bold text-gray-400">-</p>
            )}
          </div>
        </div>
      </div>

      {visitSummary && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h2 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
            <span className="mr-2">Summary</span>
            <div className="h-1 flex-grow bg-purple-100 rounded-full"></div>
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 prose prose-slate prose-headings:font-bold prose-h2:text-purple-700 prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-li:my-0 prose-p:my-1 max-w-none">
            <ReactMarkdown>{visitSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg shadow-md p-6 border-t-4 border-emerald-500">
        <h2 className="text-xl font-bold mb-4 text-emerald-700 flex items-center">
          <span className="mr-2">Action Items</span>
          <div className="h-1 flex-grow bg-emerald-100 rounded-full"></div>
        </h2>
        <div className="bg-emerald-50 p-5 rounded-lg shadow-sm border border-emerald-100">
          {actionItems.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-800">
              {actionItems.map((item, index) => (
                <li key={index} className="hover:text-emerald-700 transition-colors duration-200">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No action items</p>
          )}
        </div>
      </div>
    </div>
  );
}
