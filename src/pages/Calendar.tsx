
import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Visualize your tasks and schedule across time
        </p>
      </header>
      
      <section className="bg-card border rounded-lg p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-medium mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            The calendar view is under development. You'll soon be able to manage your tasks with a beautiful visual calendar interface.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Calendar;
