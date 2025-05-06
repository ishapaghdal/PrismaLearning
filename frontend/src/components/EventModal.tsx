"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimeEntryData } from "@/types/event";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: TimeEntryData) => void;
  onUpdate: (event: TimeEntryData) => void;
  onDelete: (id: string) => void;
  event: TimeEntryData | null;
  isNewEvent?: boolean; // Add this prop to determine if it's a new or existing event
}

export default function EventModal({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  event,
  isNewEvent = false, // Default to false if not provided
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("#ffebee");

  useEffect(() => {
    if (event) {
      // Use the existing event data
      const start = new Date(event.startTime);
      const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + 60 * 60 * 1000);

      setTitle(event.title || event.description || "");
      setStartDate(formatDateForInput(start));
      setStartTime(formatTimeForInput(start));
      setEndDate(formatDateForInput(end));
      setEndTime(formatTimeForInput(end));
      setColor(event.backgroundColor || "#ffebee");
    } else {
      // Create a new event with default values
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setTitle("New Event");
      setStartDate(formatDateForInput(now));
      setStartTime(formatTimeForInput(now));
      setEndDate(formatDateForInput(now));
      setEndTime(formatTimeForInput(oneHourLater));
      setColor("#ffebee");
    }
  }, [event]);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSubmit = () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const newEvent: TimeEntryData = {
      id: event?.id || crypto.randomUUID(),
      startTime: startDateTime,
      endTime: endDateTime,
      backgroundColor: color,
      borderColor: color,
      textColor: getContrastColor(color),
      description: title, // Use title for description as well for backward compatibility
      projectId: event?.projectId || "default-project",
      projectName: event?.projectName || "Default Project",
      title: title,
      date: startDateTime,
      createdAt: new Date(),
      isShadow: false,
    };

    // Use isNewEvent to determine whether to call onAdd or onUpdate
    if (isNewEvent) {
      onAdd(newEvent);
    } else {
      onUpdate(newEvent);
    }
    
    onClose();
  };

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = Number.parseInt(hexColor.slice(1, 3), 16);
    const g = Number.parseInt(hexColor.slice(3, 5), 16);
    const b = Number.parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const colorOptions = [
    { bg: "#ffebee", label: "Red" },
    { bg: "#e3f2fd", label: "Blue" },
    { bg: "#f1f8e9", label: "Green" },
    { bg: "#fff8e1", label: "Yellow" },
    { bg: "#f3e5f5", label: "Purple" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewEvent ? "Add Event" : "Edit Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <div
                  key={option.bg}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    color === option.bg ? "border-black" : "border-transparent"
                  }`}
                  style={{ backgroundColor: option.bg }}
                  onClick={() => setColor(option.bg)}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          {/* Only show Delete button if it's NOT a new event */}
          {!isNewEvent && event && (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{isNewEvent ? "Add" : "Update"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}