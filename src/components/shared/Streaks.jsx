export default function WeeklyStreak({ streak = 0 }) {
  return (
      <div className="rounded-xl w-40 h-20 flex flex-col items-center justify-center shadow-md">
          {streak >= 1  }
          <p className="text-3xl font-bold">{streak}</p>
        <p className="text-xs mt-1 text-center">Day Streak</p>
      </div>
  );
}