"use client"

import * as React from "react"
import { ChevronsUpDown } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Item {
  id: number
  label: string
  
}

export interface CheckboxDropdownProps {
  items: Item[];
  selectedItems: Item[];
  type?: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<Item[]>>;
  width?: string;
  singleSelect?: boolean;
}



export const CheckboxDropdown: React.FC<CheckboxDropdownProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  type = "Items",
  width
}) => {
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  };

  const handleSelect = (item: Item) => {
    setSelectedItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  const getSelectedLabels = () => selectedItems.map(item => item.label).join(", ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "justify-between group",
            typeof width === 'string' ? width : "w-[200px]"
          )}
        >
          <span className="flex-1 truncate">
            {selectedItems.length > 0 
              ? `${selectedItems.length} ${type} selected`
              : `Select ${type}`}
          </span>
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            handleSelectAll();
          }}
        >
          <Checkbox 
            checked={selectedItems.length === items.length}
            className="mr-2"
          />
          <span className="font-semibold">Select All</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {items.map((item) => (
          <DropdownMenuItem 
            key={item.id}
            onSelect={(e) => {
              e.preventDefault();
              handleSelect(item);
            }}
          >
            <Checkbox 
              checked={selectedItems.some(i => i.id === item.id)}
              className="mr-2"
            />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};