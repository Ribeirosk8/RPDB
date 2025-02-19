import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SearchDropdownProps {
  items: { value: string | number; label: string }[];
  selectedItem: { value: string | number; label: string } | null;
  setSelectedItem: (item: { value: string | number; label: string } | null) => void;
  type: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  items,
  selectedItem,
  setSelectedItem,
  type,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          {selectedItem ? selectedItem.label : `Select ${type}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${type.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => {
                    setSelectedItem(item);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  {selectedItem?.value === item.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchDropdown;