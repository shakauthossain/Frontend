
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface StatusBarProps {
  message: string;
}

export function StatusBar({ message }: StatusBarProps) {
  if (!message) return null;

  const isError = message.toLowerCase().includes('failed') || message.toLowerCase().includes('error');
  const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('completed');

  const icon = isError ? AlertCircle : isSuccess ? CheckCircle : Info;
  const iconColor = isError ? 'text-red-500' : isSuccess ? 'text-green-500' : 'text-blue-500';
  const bgColor = isError ? 'bg-red-50' : isSuccess ? 'bg-green-50' : 'bg-blue-50';
  const borderColor = isError ? 'border-red-200' : isSuccess ? 'border-green-200' : 'border-blue-200';

  const Icon = icon;

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg border ${bgColor} ${borderColor} animate-fade-in`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-medium text-slate-700">{message}</span>
    </div>
  );
}
