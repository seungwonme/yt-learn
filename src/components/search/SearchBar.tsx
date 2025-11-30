"use client";

import { useState, FormEvent } from "react";
import { LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "YouTube 영상 검색...",
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="pr-10"
          />
          <LuSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? "검색 중..." : "검색"}
        </Button>
      </div>
    </form>
  );
}
