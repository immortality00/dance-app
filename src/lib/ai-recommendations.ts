import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import OpenAI from 'openai';
import type { FirestoreStudioRental } from '@/types/firebase';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface UserBookingPattern {
  mostFrequentDay: string;
  mostFrequentTimeSlot: string;
  totalBookings: number;
  dayDistribution: Record<string, number>;
  timeDistribution: Record<string, number>;
}

export async function analyzeUserBookingPatterns(userId: string): Promise<UserBookingPattern | null> {
  try {
    const bookingsRef = collection(db, 'studioRentals');
    const userBookingsQuery = query(
      bookingsRef,
      where('userId', '==', userId),
      where('status', '==', 'confirmed')
    );

    const bookingsSnapshot = await getDocs(userBookingsQuery);
    if (bookingsSnapshot.empty) {
      return null;
    }

    const dayDistribution: Record<string, number> = {};
    const timeDistribution: Record<string, number> = {};
    let totalBookings = 0;

    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data() as FirestoreStudioRental;
      const date = (booking.date as Timestamp).toDate();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const timeSlot = `${booking.startTime}-${booking.endTime}`;

      dayDistribution[day] = (dayDistribution[day] || 0) + 1;
      timeDistribution[timeSlot] = (timeDistribution[timeSlot] || 0) + 1;
      totalBookings++;
    });

    const mostFrequentDay = Object.entries(dayDistribution)
      .sort(([, a], [, b]) => b - a)[0][0];
    const mostFrequentTimeSlot = Object.entries(timeDistribution)
      .sort(([, a], [, b]) => b - a)[0][0];

    return {
      mostFrequentDay,
      mostFrequentTimeSlot,
      totalBookings,
      dayDistribution,
      timeDistribution,
    };
  } catch (error) {
    console.error('Error analyzing user booking patterns:', error);
    return null;
  }
}

export async function getAIRecommendations(
  userId: string,
  patterns: UserBookingPattern
): Promise<string[]> {
  try {
    const prompt = `Based on the following user booking patterns:
- Most frequent day: ${patterns.mostFrequentDay}
- Most frequent time slot: ${patterns.mostFrequentTimeSlot}
- Total bookings: ${patterns.totalBookings}
- Day distribution: ${JSON.stringify(patterns.dayDistribution)}
- Time distribution: ${JSON.stringify(patterns.timeDistribution)}

Please suggest 3 optimal time slots for future studio rentals. Format each suggestion as "Day, Time" (e.g., "Monday, 10:00-11:00"). Consider:
1. User's historical preferences
2. Popular time slots
3. Varied options across different days

Return only the 3 suggestions, one per line.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests optimal studio rental times based on user booking patterns.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const suggestions = response.choices[0].message.content
      ?.split('\n')
      .filter(Boolean)
      .slice(0, 3);

    return suggestions || [];
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return [];
  }
} 