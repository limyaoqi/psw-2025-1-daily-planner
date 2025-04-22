"use client";

import { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import { CalendarIcon, Moon, Sun, Trash2 } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeBlock } from "@/components/time-block";
import { QuoteOfTheDay } from "@/components/quote-of-day";
import { useTheme } from "next-themes";

// Define the time blocks from 9AM to 5PM
const DEFAULT_TIME_BLOCKS = Array.from({ length: 9 }, (_, i) => {
  const hour = i + 9;
  return {
    id: `time-${hour}`,
    time: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`,
    hour,
    task: "",
  };
});

// Type for a task
interface Task {
  id: string;
  time: string;
  hour: number;
  task: string;
}

export function DailyPlanner() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeBlocks, setTimeBlocks] = useState<Task[]>([...DEFAULT_TIME_BLOCKS]);
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format the selected date as a string for storage key
  const dateKey = format(selectedDate, "yyyy-MM-dd");

  // Load tasks from local storage when date changes
  useEffect(() => {
    const savedTasks = localStorage.getItem(`daily-planner-${dateKey}`);
    
    if (savedTasks) {
      setTimeBlocks(JSON.parse(savedTasks));
    } else {
      // Reset to default time blocks if no saved data for this date
      setTimeBlocks([...DEFAULT_TIME_BLOCKS]); // Create a new array reference
    }
  }, [dateKey]);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    if (timeBlocks) { // Only save if timeBlocks exists
      localStorage.setItem(
        `daily-planner-${dateKey}`,
        JSON.stringify(timeBlocks)
      );
    }
  }, [timeBlocks, dateKey]);

  // Update a task
  const updateTask = (id: string, newTask: string) => {
    setTimeBlocks(
      timeBlocks.map((block) =>
        block.id === id ? { ...block, task: newTask } : block
      )
    );
  };

  // Clear all tasks
  const clearAllTasks = () => {
    const cleared = timeBlocks.map((block) => ({
      ...block,
      task: "",
    }));
    setTimeBlocks([...cleared]); // Use a new array reference
    toast.success(
      `Tasks for ${format(selectedDate, "MMMM d, yyyy")} have been cleared.`
    );
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(timeBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the time properties to maintain the correct time sequence
    const updatedItems = items.map((item, index) => {
      const hour = index + 9;
      return {
        ...item,
        time: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`,
        hour,
      };
    });

    setTimeBlocks(updatedItems);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Daily Planner
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Plan your day efficiently and stay organized.
          </p>
        </div>

        <div className="flex flex-wrap justify-between md:justify-end gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-full md:w-[240px] py-2 px-4"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            {mounted &&
              (theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              ))}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={clearAllTasks}
            className="flex items-center gap-2 py-2 px-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>

      <QuoteOfTheDay />

      <div className="bg-card rounded-lg border shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isToday(selectedDate)
            ? "Today's Schedule"
            : format(selectedDate, "MMMM d, yyyy")}
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeBlocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {timeBlocks.map((block, index) => (
                  <TimeBlock
                    key={block.id}
                    id={block.id}
                    index={index}
                    time={block.time}
                    hour={block.hour}
                    task={block.task}
                    updateTask={updateTask}
                    isToday={isToday(selectedDate)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}