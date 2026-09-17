import { Bell } from 'lucide-react';

export const Notifications = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-3">
          <Bell className="w-8 h-8 text-gray-400" />
          <span>Notifications</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          View your latest alerts, post updates, and system messages.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-12 border border-orange-100 shadow-xl shadow-orange-950/5 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <Bell className="w-8 h-8 text-gray-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">You're all caught up!</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Check back later for updates on your posts, accounts, and system notifications.
          </p>
        </div>
      </div>
    </main>
  );
};
