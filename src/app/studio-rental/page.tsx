'use client';

import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp,
  runTransaction,
  doc
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import type { FirestoreStudioRental } from '@/types/firebase';
import { analyzeUserBookingPatterns, getAIRecommendations } from '@/lib/ai-recommendations';

const STUDIO_HOURS = {
  start: 8, // 8 AM
  end: 22, // 10 PM
};

const TIME_SLOTS = Array.from(
  { length: (STUDIO_HOURS.end - STUDIO_HOURS.start) * 2 }, 
  (_, i) => {
    const hour = Math.floor(i / 2) + STUDIO_HOURS.start;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
);

export default function StudioRentalPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(TIME_SLOTS[0]);
  const [endTime, setEndTime] = useState<string>(TIME_SLOTS[1]);
  const [purpose, setPurpose] = useState('');
  const [bookings, setBookings] = useState<FirestoreStudioRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (user) {
      fetchRecommendations();
    }
  }, [selectedDate, user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecommendations(true);
    try {
      const patterns = await analyzeUserBookingPatterns(user.id);
      if (patterns) {
        const suggestions = await getAIRecommendations(user.id, patterns);
        setRecommendations(suggestions);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      const endOfDay = new Date(selectedDate);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const bookingsQuery = query(
        collection(db, 'studioRentals'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<', Timestamp.fromDate(endOfDay))
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreStudioRental[];

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      showToast('Please sign in to book the studio', 'error');
      return;
    }

    if (!selectedDate || !startTime || !endTime || !purpose) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (startTime >= endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }

    setProcessing(true);

    try {
      // Use a transaction to ensure booking slot is still available
      await runTransaction(db, async (transaction) => {
        // Check for conflicting bookings
        const conflictQuery = query(
          collection(db, 'studioRentals'),
          where('date', '==', Timestamp.fromDate(new Date(selectedDate))),
          where('status', '==', 'confirmed')
        );
        
        const conflictDocs = await getDocs(conflictQuery);
        const conflicts = conflictDocs.docs.map(doc => doc.data() as FirestoreStudioRental);
        
        const hasConflict = conflicts.some(booking => {
          return (
            (startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime) ||
            (startTime <= booking.startTime && endTime >= booking.endTime)
          );
        });

        if (hasConflict) {
          throw new Error('This time slot is already booked');
        }

        // Create new booking
        const bookingRef = doc(collection(db, 'studioRentals'));
        const now = Timestamp.now();
        
        transaction.set(bookingRef, {
          id: bookingRef.id,
          userId: user.id,
          userName: user.name,
          studioId: 'main-studio', // You can modify this for multiple studios
          date: Timestamp.fromDate(new Date(selectedDate)),
          startTime,
          endTime,
          purpose,
          status: 'confirmed',
          createdAt: now,
          lastUpdated: now,
        });
      });

      showToast('Studio booked successfully!', 'success');
      setPurpose('');
      await fetchBookings();
    } catch (error: any) {
      showToast(error.message || 'Failed to book studio', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const isTimeSlotBooked = (time: string) => {
    return bookings.some(booking => 
      booking.status === 'confirmed' && 
      time >= booking.startTime && 
      time < booking.endTime
    );
  };

  const applyRecommendation = (recommendation: string) => {
    const [day, time] = recommendation.split(', ');
    const [start, end] = time.split('-');
    
    // Find the next occurrence of the recommended day
    const today = new Date();
    const daysUntilNext = getDaysUntilNext(day);
    const recommendedDate = new Date();
    recommendedDate.setDate(today.getDate() + daysUntilNext);
    
    setSelectedDate(recommendedDate.toISOString().split('T')[0]);
    setStartTime(start);
    setEndTime(end);
  };

  const getDaysUntilNext = (targetDay: string): number => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const targetDayIndex = days.findIndex(day => day === targetDay);
    let daysUntil = targetDayIndex - today;
    if (daysUntil <= 0) daysUntil += 7;
    return daysUntil;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Studio Rental</h1>
          <p className="mt-2 text-sm text-gray-600">
            Book the dance studio for your practice sessions or events
          </p>
        </div>

        {user && recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Recommended Time Slots
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendations.map((recommendation, index) => (
                <button
                  key={index}
                  onClick={() => applyRecommendation(recommendation)}
                  className="p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  {recommendation}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingRecommendations && (
          <div className="mb-6 flex items-center space-x-2 text-gray-500">
            <Loading size="sm" />
            <span>Loading personalized recommendations...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Make a Booking</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <select
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    {TIME_SLOTS.map((time) => (
                      <option 
                        key={time} 
                        value={time}
                        disabled={isTimeSlotBooked(time)}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <select
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    {TIME_SLOTS.map((time) => (
                      <option 
                        key={time} 
                        value={time}
                        disabled={isTimeSlotBooked(time)}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  placeholder="Enter the purpose of your booking"
                  required
                />
              </div>
              <button
                onClick={handleBooking}
                disabled={processing || !user}
                className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${processing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {processing ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Book Studio'
                )}
              </button>
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Availability Calendar</h2>
            <div className="space-y-2">
              {TIME_SLOTS.map((time) => {
                const isBooked = isTimeSlotBooked(time);
                const booking = bookings.find(b => 
                  b.status === 'confirmed' && 
                  time >= b.startTime && 
                  time < b.endTime
                );

                return (
                  <div
                    key={time}
                    className={`p-2 rounded ${
                      isBooked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{time}</span>
                      {isBooked && booking && (
                        <span className="text-sm">
                          Booked by {booking.userName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 