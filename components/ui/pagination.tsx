"use client"

import * as React from "react"
import { Button } from "./button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalEntries: number
  startEntry: number
  endEntry: number
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalEntries,
  startEntry,
  endEntry
}: PaginationProps) {
  if (totalEntries === 0) return null

  return (
    <div className="flex items-center justify-between p-4 border-t border-[#d2d2c4] bg-[#f5f5e6]/10">
      <div className="text-xs text-neutral-500 font-medium">
        Showing <span className="font-semibold text-neutral-700">{startEntry}</span> to{" "}
        <span className="font-semibold text-neutral-700">{Math.min(endEntry, totalEntries)}</span> of{" "}
        <span className="font-semibold text-neutral-700">{totalEntries}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs font-semibold px-2">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
