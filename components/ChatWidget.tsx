'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useJobLogs, type JobLog } from '@/lib/useJobLogs';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  vehicleContext?: {
    make: string;
    model: string;
    year?: number;
    system?: string;
  } | null;
}

interface ChatResponse {
  response: string;
  vehicleContext?: {
    make: string;
    model: string;
    year?: number;
    system?: string;
  } | null;
  sourcesUsed?: {
    vehicleRecords: number;
    pearls: number;
  };
  error?: string;
}

type ParsedJobCommand =
  | { handled: false }
  | { handled: true; ok: false; message: string }
  | { handled: true; ok: true; payload: Omit<JobLog, 'id' | 'createdAt'> };

const JOB_LOG_PREFIX = /^\s*(?:\/)?(?:log|add|create)\s+job\b[:\-]?\s*/i;
const NATURAL_JOB_TYPE_PATTERNS: Array<{ value: JobLog['jobType']; regex: RegExp }> = [
  { value: 'akl', regex: /\b(?:all\s+keys?\s+lost|akl|lost\s+all\s+keys?)\b/i },
  { value: 'add_key', regex: /\b(?:add(?:ed|ing)?\s+key|spare\s+key|duplicate\s+key)\b/i },
  { value: 'lockout', regex: /\b(?:lockout|unlock)\b/i },
  { value: 'rekey', regex: /\b(?:rekey|re-key)\b/i },
  { value: 'remote', regex: /\b(?:remote(?:\s+only)?|fob|key\s+fob)\b/i },
  { value: 'blade', regex: /\b(?:blade(?:\s+cut)?|cut\s+key)\b/i },
  { value: 'safe', regex: /\b(?:safe(?:\s+opening)?)\b/i },
];

function normalizeFieldName(field: string): string {
  return field.toLowerCase().replace(/[\s_-]+/g, '');
}

function pickField(fields: Record<string, string>, aliases: string[]): string | undefined {
  for (const alias of aliases) {
    const value = fields[normalizeFieldName(alias)];
    if (value) return value;
  }
  return undefined;
}

function parseAmount(value?: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,]/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return 0;
  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeDate(value?: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (!value) return today;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return today;
  return parsed.toISOString().split('T')[0];
}

function normalizeJobType(value?: string): JobLog['jobType'] {
  if (!value) return 'other';
  const normalized = value.toLowerCase().trim().replace(/[\s_-]+/g, '');
  if (normalized === 'addkey' || normalized === 'spare' || normalized === 'sparekey' || normalized === 'duplicate') return 'add_key';
  if (normalized === 'akl' || normalized === 'allkeyslost' || normalized === 'allkeys' || normalized === 'lostkeys') return 'akl';
  if (normalized === 'remote' || normalized === 'remoteonly' || normalized === 'fob' || normalized === 'keyfob') return 'remote';
  if (normalized === 'blade' || normalized === 'bladecut') return 'blade';
  if (normalized === 'rekey' || normalized === 'rekeying') return 'rekey';
  if (normalized === 'lockout' || normalized === 'unlock') return 'lockout';
  if (normalized === 'safe' || normalized === 'safeopening') return 'safe';
  return 'other';
}

function formatJobTypeLabel(jobType: JobLog['jobType']): string {
  const labels: Record<JobLog['jobType'], string> = {
    add_key: 'Add Key',
    akl: 'All Keys Lost',
    remote: 'Remote Only',
    blade: 'Blade Cut',
    rekey: 'Rekey',
    lockout: 'Lockout',
    safe: 'Safe Work',
    other: 'Other',
  };
  return labels[jobType] || 'Other';
}

function normalizeStatus(value?: string): JobLog['status'] {
  if (!value) return 'completed';
  const normalized = value.toLowerCase().trim().replace(/[\s_-]+/g, '');
  if (normalized === 'inprogress' || normalized === 'started') return 'in_progress';
  if (normalized === 'hold' || normalized === 'onhold') return 'on_hold';
  if (normalized === 'pendingclose') return 'pending_close';
  if (normalized === 'pendingcancel') return 'pending_cancel';
  if (normalized === 'unassign') return 'unassigned';
  if (normalized === 'claim') return 'claimed';

  const validStatuses: JobLog['status'][] = [
    'unassigned',
    'claimed',
    'in_progress',
    'completed',
    'cancelled',
    'pending',
    'appointment',
    'accepted',
    'on_hold',
    'closed',
    'pending_close',
    'pending_cancel',
    'estimate',
    'follow_up',
  ];

  return validStatuses.includes(normalized as JobLog['status'])
    ? (normalized as JobLog['status'])
    : 'completed';
}

function extractNaturalLanguageFields(input: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const text = input.replace(/\s+/g, ' ').trim();
  if (!text) return fields;

  let jobTypeIndex = -1;
  for (const candidate of NATURAL_JOB_TYPE_PATTERNS) {
    const match = text.match(candidate.regex);
    if (match) {
      fields.job = candidate.value;
      if (typeof match.index === 'number') {
        jobTypeIndex = match.index;
      }
      break;
    }
  }

  const priceMatch =
    text.match(/\b(?:price|priced|charge(?:d)?|charged|total|for|at)\s*\$?\s*(-?\d+(?:\.\d{1,2})?)/i) ||
    text.match(/\$\s*(-?\d+(?:\.\d{1,2})?)/i);
  if (priceMatch?.[1]) {
    fields.price = priceMatch[1];
  } else if (fields.job) {
    const trailingAmount = text.match(/(?:^|\s)(-?\d+(?:\.\d{1,2})?)\s*$/);
    if (trailingAmount?.[1]) {
      fields.price = trailingAmount[1];
    }
  }

  if (!fields.status && /\b(?:done|completed|complete|closed)\b/i.test(text)) {
    fields.status = 'completed';
  }
  if (!fields.status && /\b(?:pending|appointment|estimate)\b/i.test(text)) {
    fields.status = 'pending';
  }

  const cutPositions: number[] = [];
  if (jobTypeIndex >= 0) cutPositions.push(jobTypeIndex);
  if (priceMatch && typeof priceMatch.index === 'number') cutPositions.push(priceMatch.index);

  let vehicleCandidate = text;
  if (cutPositions.length > 0) {
    vehicleCandidate = text.slice(0, Math.min(...cutPositions));
  }

  vehicleCandidate = vehicleCandidate
    .replace(/^\s*(?:for|vehicle|car)\s+/i, '')
    .replace(/\b(?:for|at|with|and|job|type|price|charged?)\s*$/i, '')
    .replace(/[;:,\-.\s]+$/g, '')
    .trim();

  if (vehicleCandidate) {
    fields.vehicle = vehicleCandidate;
  }

  return fields;
}

function parseJobCommand(input: string): ParsedJobCommand {
  const commandMatch = input.match(JOB_LOG_PREFIX);
  if (!commandMatch) return { handled: false };

  const body = input.slice(commandMatch[0].length).trim();
  if (!body) {
    return {
      handled: true,
      ok: false,
      message: 'Use: log job: vehicle=2019 Honda Civic; job=akl; price=280; customer=John Doe; phone=555-111-2222',
    };
  }

  const fields: Record<string, string> = {};

  if (body.startsWith('{')) {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {
          handled: true,
          ok: false,
          message: 'JSON must be an object. Example: log job: {"vehicle":"2019 Honda Civic","job":"akl","price":280}',
        };
      }
      Object.entries(parsed).forEach(([key, rawValue]) => {
        if (rawValue === null || rawValue === undefined) return;
        fields[normalizeFieldName(key)] = String(rawValue).trim();
      });
    } catch {
      return {
        handled: true,
        ok: false,
        message: 'Invalid JSON format. Example: log job: {"vehicle":"2019 Honda Civic","job":"akl","price":280}',
      };
    }
  } else {
    const segments = body.split(';').map(part => part.trim()).filter(Boolean);
    segments.forEach(segment => {
      const eqIndex = segment.indexOf('=');
      const colonIndex = segment.indexOf(':');
      let splitIndex = -1;

      if (eqIndex >= 0 && colonIndex >= 0) splitIndex = Math.min(eqIndex, colonIndex);
      else splitIndex = Math.max(eqIndex, colonIndex);

      if (splitIndex <= 0) return;

      const key = segment.slice(0, splitIndex).trim();
      const value = segment.slice(splitIndex + 1).trim();
      if (!key || !value) return;
      fields[normalizeFieldName(key)] = value;
    });

    const naturalFields = extractNaturalLanguageFields(body);
    Object.entries(naturalFields).forEach(([key, value]) => {
      const normalizedKey = normalizeFieldName(key);
      if (!fields[normalizedKey] && value) {
        fields[normalizedKey] = value.trim();
      }
    });

    // Allow "log job: 2019 Honda Civic" as shorthand vehicle-only input.
    if (segments.length === 1 && Object.keys(fields).length === 0) {
      fields.vehicle = body;
    }
  }

  const vehicle = pickField(fields, ['vehicle', 'car', 'auto']);
  if (!vehicle) {
    return {
      handled: true,
      ok: false,
      message: 'Vehicle is required. Example: log job: vehicle=2019 Honda Civic; job=akl; price=280',
    };
  }

  const payload: Omit<JobLog, 'id' | 'createdAt'> = {
    vehicle: vehicle.trim(),
    jobType: normalizeJobType(pickField(fields, ['job', 'jobType', 'type', 'service'])),
    price: parseAmount(pickField(fields, ['price', 'amount', 'total'])),
    date: normalizeDate(pickField(fields, ['date'])),
    status: normalizeStatus(pickField(fields, ['status'])),
    source: 'manual',
  };

  const notes = pickField(fields, ['notes', 'note', 'details']);
  const customerName = pickField(fields, ['customer', 'customerName', 'name']);
  const customerPhone = pickField(fields, ['phone', 'customerPhone']);
  const customerAddress = pickField(fields, ['address', 'customerAddress']);
  const companyName = pickField(fields, ['company', 'companyName', 'business', 'shop']);
  const technicianName = pickField(fields, ['technician', 'tech', 'technicianName']);
  const fccId = pickField(fields, ['fcc', 'fccId']);
  const keyType = pickField(fields, ['keyType', 'key']);

  if (notes) payload.notes = notes;
  if (customerName) payload.customerName = customerName;
  if (customerPhone) payload.customerPhone = customerPhone;
  if (customerAddress) payload.customerAddress = customerAddress;
  if (companyName) payload.companyName = companyName;
  if (technicianName) payload.technicianName = technicianName;
  if (fccId) payload.fccId = fccId;
  if (keyType) payload.keyType = keyType;

  return { handled: true, ok: true, payload };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { addJobLog } = useJobLogs();

  // Auto-detect vehicle context from URL (e.g., /vehicle/bmw/5-series)
  const getVehicleContextFromUrl = (): { make?: string; model?: string } | null => {
    if (!pathname) return null;
    const match = pathname.match(/\/vehicle\/([^/]+)\/([^/]+)/);
    if (match) {
      return {
        make: match[1].replace(/-/g, ' '),
        model: match[2].replace(/-/g, ' '),
      };
    }
    return null;
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);

    const parsedJobCommand = parseJobCommand(userMessage.content);
    if (parsedJobCommand.handled) {
      if (!parsedJobCommand.ok) {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: parsedJobCommand.message,
          timestamp: new Date(),
        }]);
        return;
      }

      try {
        const newJob = addJobLog(parsedJobCommand.payload);
        const displayPrice = Number.isFinite(newJob.price) ? newJob.price.toFixed(2) : '0.00';
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Job logged successfully.\nVehicle: ${newJob.vehicle}\nType: ${formatJobTypeLabel(newJob.jobType)}\nPrice: $${displayPrice}\nStatus: ${newJob.status.replace(/_/g, ' ')}\n\nOpen /business/jobs to review or edit this entry.`,
          timestamp: new Date(),
        }]);
      } catch {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'I could not log that job. Please try again or open /business/jobs to log it manually.',
          timestamp: new Date(),
        }]);
      }
      return;
    }

    setIsLoading(true);

    try {
      const vehicleContext = getVehicleContextFromUrl();

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          vehicleContext,
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        vehicleContext: data.vehicleContext,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-btn"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="chat-avatar">🔑</span>
              <div>
                <h3>EuroKeys AI</h3>
                <span className="chat-status">Locksmith Assistant</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>👋 Hi! I'm your EuroKeys AI assistant.</p>
                <p>Ask me anything about:</p>
                <ul>
                  <li>Vehicle immobilizer systems</li>
                  <li>Key programming procedures</li>
                  <li>Chip types and FCC IDs</li>
                  <li>Tool recommendations</li>
                  <li>Quick job logging commands</li>
                </ul>
                <p className="chat-example">Try: "What system is the 2014 BMW 5 series?"</p>
                <p className="chat-example">Log job: "log job: vehicle=2019 Honda Civic; job=akl; price=280; customer=John Doe"</p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`chat-message chat-message-${msg.role}`}>
                <div className="chat-message-content">
                  {msg.content}
                  {msg.vehicleContext && (
                    <div className="chat-vehicle-badge">
                      📋 {msg.vehicleContext.make} {msg.vehicleContext.model}
                      {msg.vehicleContext.year && ` (${msg.vehicleContext.year})`}
                      {msg.vehicleContext.system && ` • ${msg.vehicleContext.system}`}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-content chat-loading">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            {error && (
              <div className="chat-error">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or type: log job: vehicle=..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="chat-send-btn"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-toggle-btn {
          position: fixed;
          bottom: 88px; /* Above mobile bottom nav (64px + 24px margin) */
          right: 16px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 45; /* Below nav z-50 */
        }

        @media (min-width: 1024px) {
          .chat-toggle-btn {
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            z-index: 1000;
          }
        }

        .chat-toggle-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.5);
        }

        .chat-panel {
          position: fixed;
          bottom: 144px; /* Above toggle button on mobile */
          right: 16px;
          width: 340px;
          max-width: calc(100vw - 32px);
          height: 400px;
          max-height: calc(100vh - 200px);
          background: #1a1a2e;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 44;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (min-width: 1024px) {
          .chat-panel {
            bottom: 96px;
            right: 24px;
            width: 380px;
            max-width: calc(100vw - 48px);
            height: 500px;
            max-height: calc(100vh - 140px);
            z-index: 999;
          }
        }

        .chat-header {
          padding: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
        }

        .chat-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          font-size: 28px;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chat-status {
          font-size: 12px;
          opacity: 0.8;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-welcome {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
        }

        .chat-welcome ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .chat-welcome li {
          margin: 4px 0;
        }

        .chat-example {
          margin-top: 12px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 8px;
          color: #60a5fa;
          font-style: italic;
        }

        .chat-message {
          max-width: 85%;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-message-user {
          align-self: flex-end;
        }

        .chat-message-assistant {
          align-self: flex-start;
        }

        .chat-message-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .chat-message-user .chat-message-content {
          background: #3b82f6;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-message-assistant .chat-message-content {
          background: #2d2d44;
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .chat-vehicle-badge {
          margin-top: 8px;
          padding: 6px 10px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          font-size: 12px;
          color: #93c5fd;
        }

        .chat-loading {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-error {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #f87171;
          font-size: 13px;
        }

        .chat-input-container {
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 10px 14px;
          background: #2d2d44;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #3b82f6;
        }

        .chat-input::placeholder {
          color: #64748b;
        }

        .chat-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .chat-send-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chat-panel {
            bottom: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }

          .chat-toggle-btn {
            bottom: 80px; /* Above mobile nav bar */
            right: 16px;
            width: 48px;
            height: 48px;
          }
        }

        /* Also handle medium screens with nav bars */
        @media (max-width: 768px) {
          .chat-toggle-btn {
            bottom: 80px; /* Clear the bottom tab bar */
          }
          
          .chat-panel {
            bottom: 140px;
          }
        }
      `}</style>
    </>
  );
}
