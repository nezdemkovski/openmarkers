import { FlaskConical } from "lucide-react";

interface LoadingProps {
  visible: boolean;
  text?: string;
}

export default function Loading({ visible, text }: LoadingProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <FlaskConical className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 animate-pulse" />
        {text && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>}
      </div>
    </div>
  );
}
