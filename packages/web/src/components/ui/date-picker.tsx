import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = date && isValid(date) ? date : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" />}
        className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {validDate ? format(validDate, "PPP") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
          defaultMonth={validDate}
        />
      </PopoverContent>
    </Popover>
  );
}
