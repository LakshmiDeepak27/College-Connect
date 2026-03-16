export function Community(){
    return(
        <div>
            {/* Community Section */}
      <section id="community" className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 mb-4">
              <span className="text-sm text-blue-400 font-semibold uppercase tracking-wide">Community</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Connect With Your Peers
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Engage in discussions, attend events, and build your professional network.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Upcoming Events</h3>
          </div>

          {/* Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 hover:border-blue-600/50 transition-all duration-300 hover-lift">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-calendar-day text-xl text-blue-500"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Tech Innovation Summit</h3>
                  <p className="text-sm text-blue-400 font-medium">March 10, 2025 • 10:00 AM - 4:00 PM</p>
                </div>
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Join industry leaders and innovators for a day of inspiring talks and networking opportunities.
              </p>
              <div className="flex items-center space-x-2 text-slate-500 mb-4">
                <i className="fas fa-map-marker-alt"></i>
                <span className="text-sm">University Convention Center</span>
              </div>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Register
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 hover:border-blue-600/50 transition-all duration-300 hover-lift">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-users text-xl text-blue-500"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Career Fair 2025</h3>
                  <p className="text-sm text-blue-400 font-medium">March 25, 2025 • 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Connect with top companies and explore internship and job opportunities.
              </p>
              <div className="flex items-center space-x-2 text-slate-500 mb-4">
                <i className="fas fa-map-marker-alt"></i>
                <span className="text-sm">University Convention Center</span>
              </div>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Register
              </button>
            </div>
          </div>

          <div className="text-center">
            <button className="group text-blue-500 font-semibold flex items-center space-x-2 mx-auto hover:text-blue-400 transition-colors">
              <span>View All Events</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </section>
        </div>
    );
}