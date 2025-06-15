import AllCategories from "./task/AllCategories";
import { useNavigate } from "react-router-dom";

export default function Home () {
  const navigate =  useNavigate()
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20 shadow-sm">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold text-blue-600 mb-4 tracking-tight">
            Welcome to TaskBounty
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Launch microtasks through subscriptions and let skilled Hunters solve them for real rewards. Rank up, earn badges, and build your creative legacy.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Explore Task Categories</h2>
          <AllCategories />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">Why TaskBounty?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Post with Subscription', desc: 'Subscribed Posters can publish tasks  monthly or yearly plans available.' },
              { title: 'Hunters Earn Rewards', desc: 'Solve tasks, submit  work, and earn  payouts.' },
              { title: 'Permanent Leaderboard', desc: 'Hunters are ranked by total tasks completed ' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow hover:shadow-md transition duration-300"
              >
                <h3 className="text-xl font-bold text-blue-600">{feature.title}</h3>
                <p className="mt-3 text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {[
              ['Subscribe as Poster', 'Unlock your ability to post tasks by purchasing a subscription.'],
              ['Submit & Earn as Hunter', 'Browse available tasks, solve creatively, and earn if chosen.'],
              ['Get Noticed', 'Every task completion boosts your leaderboard position.'],
            ].map(([title, desc], idx) => (
              <div
                key={idx}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <h4 className="text-lg font-semibold text-blue-700">{title}</h4>
                <p className="mt-2 text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 The TaskBounty Leaderboard</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Hunters are ranked by the **total number of tasks completed** — no resets, no limits. The more you solve, the higher you rise. Earn badges, and stay ahead of the pack.
          </p>
          <button 
           onClick={() => navigate("/leaderboard")}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full  hover:bg-blue-700">
            View Top Hunters
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TaskBounty — Where Creativity Meets Reward.
      </footer>
    </div>
  );
};

