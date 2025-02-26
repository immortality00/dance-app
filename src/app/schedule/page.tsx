'use client';

import { useState } from 'react';
import { generateMetadata } from '@/components/SEO';
import { DanceStyle } from '@/types/firebase';
import Link from 'next/link';

export const metadata = generateMetadata({
  title: 'Class Schedule',
  description: 'View our weekly dance class schedule and book your next class.',
});

type DaySchedule = {
  time: string;
  class: string;
  instructor: string;
  level: string;
  style: DanceStyle;
  duration: string;
  room: string;
};

type WeeklySchedule = {
  [key: string]: DaySchedule[];
};

const schedule: WeeklySchedule = {
  Monday: [
    {
      time: '09:00',
      class: 'Morning Ballet',
      instructor: 'Sarah Johnson',
      level: 'Beginner',
      style: DanceStyle.BALLET,
      duration: '90 min',
      room: 'Studio A',
    },
    {
      time: '11:00',
      class: 'Contemporary Flow',
      instructor: 'Elena Rodriguez',
      level: 'Intermediate',
      style: DanceStyle.CONTEMPORARY,
      duration: '60 min',
      room: 'Studio B',
    },
    {
      time: '17:00',
      class: 'Hip Hop Basics',
      instructor: 'Michael Chen',
      level: 'Beginner',
      style: DanceStyle.HIP_HOP,
      duration: '60 min',
      room: 'Studio C',
    },
  ],
  Tuesday: [
    {
      time: '10:00',
      class: 'Jazz Fundamentals',
      instructor: 'Lisa Thompson',
      level: 'Beginner',
      style: DanceStyle.JAZZ,
      duration: '60 min',
      room: 'Studio B',
    },
    {
      time: '18:00',
      class: 'Advanced Ballet',
      instructor: 'Sarah Johnson',
      level: 'Advanced',
      style: DanceStyle.BALLET,
      duration: '90 min',
      room: 'Studio A',
    },
  ],
  Wednesday: [
    {
      time: '09:00',
      class: 'Morning Contemporary',
      instructor: 'Elena Rodriguez',
      level: 'Intermediate',
      style: DanceStyle.CONTEMPORARY,
      duration: '90 min',
      room: 'Studio A',
    },
    {
      time: '16:00',
      class: 'Kids Ballet',
      instructor: 'Sarah Johnson',
      level: 'Beginner',
      style: DanceStyle.BALLET,
      duration: '45 min',
      room: 'Studio B',
    },
    {
      time: '19:00',
      class: 'Street Dance',
      instructor: 'Michael Chen',
      level: 'Intermediate',
      style: DanceStyle.HIP_HOP,
      duration: '60 min',
      room: 'Studio C',
    },
  ],
  Thursday: [
    {
      time: '11:00',
      class: 'Salsa Basics',
      instructor: 'Carlos Rivera',
      level: 'Beginner',
      style: DanceStyle.SALSA,
      duration: '60 min',
      room: 'Studio B',
    },
    {
      time: '17:00',
      class: 'Advanced Jazz',
      instructor: 'Lisa Thompson',
      level: 'Advanced',
      style: DanceStyle.JAZZ,
      duration: '90 min',
      room: 'Studio A',
    },
  ],
  Friday: [
    {
      time: '10:00',
      class: 'Ballet Technique',
      instructor: 'Sarah Johnson',
      level: 'Intermediate',
      style: DanceStyle.BALLET,
      duration: '90 min',
      room: 'Studio A',
    },
    {
      time: '16:00',
      class: 'Hip Hop Choreography',
      instructor: 'Michael Chen',
      level: 'Advanced',
      style: DanceStyle.HIP_HOP,
      duration: '90 min',
      room: 'Studio C',
    },
    {
      time: '18:00',
      class: 'Social Ballroom',
      instructor: 'James Wilson',
      level: 'Beginner',
      style: DanceStyle.BALLROOM,
      duration: '60 min',
      room: 'Studio B',
    },
  ],
  Saturday: [
    {
      time: '09:00',
      class: 'Weekend Ballet',
      instructor: 'Sarah Johnson',
      level: 'All Levels',
      style: DanceStyle.BALLET,
      duration: '90 min',
      room: 'Studio A',
    },
    {
      time: '11:00',
      class: 'Contemporary Workshop',
      instructor: 'Elena Rodriguez',
      level: 'All Levels',
      style: DanceStyle.CONTEMPORARY,
      duration: '120 min',
      room: 'Studio B',
    },
    {
      time: '14:00',
      class: 'Tap Dance',
      instructor: 'James Wilson',
      level: 'Beginner',
      style: DanceStyle.TAP,
      duration: '60 min',
      room: 'Studio C',
    },
  ],
  Sunday: [],
};

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedStyle, setSelectedStyle] = useState<DanceStyle | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const days = Object.keys(schedule);
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const filteredSchedule = schedule[selectedDay].filter(
    (item) =>
      (selectedStyle === 'all' || item.style === selectedStyle) &&
      (selectedLevel === 'all' || item.level === selectedLevel)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Class Schedule
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Find the perfect class for your schedule and skill level.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Day Filter */}
            <div>
              <label htmlFor="day-select" className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select
                id="day-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label="Select day of the week"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Filter */}
            <div>
              <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 mb-2">
                Dance Style
              </label>
              <select
                id="style-select"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as DanceStyle | 'all')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label="Select dance style"
              >
                <option value="all">All Styles</option>
                {Object.values(DanceStyle).map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label htmlFor="level-select" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label="Select skill level"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Grid */}
          {filteredSchedule.length > 0 ? (
            <div className="grid gap-6">
              {filteredSchedule.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.class}
                        </h3>
                        <p className="text-indigo-600">{item.time} ({item.duration})</p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Instructor:</span> {item.instructor}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Room:</span> {item.room}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Style:</span> {item.style}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Level:</span> {item.level}
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/classes?style=${item.style.toLowerCase()}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Book Class
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No classes scheduled for this day.</p>
            </div>
          )}
        </div>
      </section>

      {/* Legend Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Studio Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio A</h3>
              <p className="text-gray-600">
                Our largest studio, perfect for ballet and contemporary classes.
                Equipped with mirrors, barres, and sprung floor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio B</h3>
              <p className="text-gray-600">
                Medium-sized studio ideal for jazz, tap, and smaller group classes.
                Features professional sound system.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio C</h3>
              <p className="text-gray-600">
                Specialized studio for hip hop and urban dance styles.
                Includes state-of-the-art lighting and sound.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 