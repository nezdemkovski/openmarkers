import { Loader2 } from "lucide-react";

interface LoadingProps {
  visible: boolean;
  text?: string;
}

export default function Loading({ visible, text }: LoadingProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 mx-auto text-muted-foreground/30 animate-spin" />
        {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
