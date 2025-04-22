"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface TimeBlockProps {
  id: string
  index: number
  time: string
  hour: number
  task: string
  updateTask: (id: string, task: string) => void
  isToday: boolean
}

export function TimeBlock({ id, index, time, hour, task, updateTask, isToday }: TimeBlockProps) {
  const [currentTask, setCurrentTask] = useState(task)

  // Sync internal state with props when they change
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  // Get current hour for color coding
  const currentHour = new Date().getHours()

  // Determine the status of the time block (past, present, future)
  const getTimeStatus = () => {
    if (!isToday) return "future" // If not today, all blocks are future

    if (hour < currentHour) return "past"
    if (hour === currentHour) return "present"
    return "future"
  }

  const timeStatus = getTimeStatus()

  // Get the appropriate background color based on time status
  const getBackgroundColor = () => {
    switch (timeStatus) {
      case "past":
        return "bg-muted"
      case "present":
        return "bg-red-100 dark:bg-red-900/20"
      case "future":
        return "bg-green-100 dark:bg-green-900/20"
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentTask(e.target.value)
    updateTask(id, e.target.value)
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn("flex items-start gap-4 p-3 rounded-md border transition-colors", getBackgroundColor())}
        >
          <div {...provided.dragHandleProps} className="flex items-center h-full pt-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="w-16 pt-2 font-medium">{time}</div>
          <Textarea
            value={currentTask}
            onChange={handleChange}
            placeholder="Add your task here..."
            className="flex-1 min-h-[60px] bg-background/50"
          />
        </div>
      )}
    </Draggable>
  )
}