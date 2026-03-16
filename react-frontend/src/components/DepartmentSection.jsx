import {React , useState , useHook} from 'react';

export function DepartmentSection(){
    const [activeCategory, setActiveCategory] = useState('tech');
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };
    const departments = {
    tech: [
      {
        icon: 'fa-laptop-code',
        title: 'Computer Science',
        meta: 'Programming, AI, Machine Learning',
        description: 'Explore cutting-edge research in artificial intelligence, machine learning, and software engineering.',
      },
      {
        icon: 'fa-microchip',
        title: 'Information Technology',
        meta: 'Cybersecurity, Cloud Computing, Networking',
        description: 'Learn about infrastructure management, information security, and emerging digital technologies.',
      },
    ],
    engineering: [
      {
        icon: 'fa-cogs',
        title: 'Mechanical Engineering',
        meta: 'Robotics, Thermodynamics, Material Science',
        description: 'Design mechanical systems and develop solutions for complex engineering challenges.',
      },
      {
        icon: 'fa-bolt',
        title: 'Electrical Engineering',
        meta: 'Electronics, Power Systems, Control Systems',
        description: 'Study electrical systems, electronic devices, and sustainable energy solutions.',
      },
      {
        icon: 'fa-building',
        title: 'Civil Engineering',
        meta: 'Structures, Transportation, Environmental',
        description: 'Design infrastructure and develop sustainable solutions for urban development.',
      },
    ],
    business: [
      {
        icon: 'fa-chart-line',
        title: 'Business Administration',
        meta: 'Management, Finance, Marketing',
        description: 'Develop leadership skills and business acumen through real-world case studies and internships.',
      },
      {
        icon: 'fa-hand-holding-usd',
        title: 'Finance & Economics',
        meta: 'Banking, Investment, Economic Theory',
        description: 'Analyze financial markets and develop strategies for economic growth and stability.',
      },
    ],
    'liberal-arts': [
      {
        icon: 'fa-feather-alt',
        title: 'English & Literature',
        meta: 'Creative Writing, Literary Analysis, Linguistics',
        description: 'Explore literary traditions and develop advanced communication skills.',
      },
      {
        icon: 'fa-landmark',
        title: 'History & Philosophy',
        meta: 'World History, Ethics, Critical Thinking',
        description: 'Study human civilizations and explore philosophical questions across different cultures.',
      },
    ],
    health: [
      {
        icon: 'fa-heartbeat',
        title: 'Nursing',
        meta: 'Patient Care, Clinical Practice, Healthcare',
        description: 'Develop skills in patient care and healthcare management through clinical experiences.',
      },
      {
        icon: 'fa-brain',
        title: 'Psychology',
        meta: 'Clinical, Cognitive, Developmental',
        description: 'Study human behavior and mental processes through research and practical applications.',
      },
    ],
  };
    return (
        <div className="departmentsections">
            
      {/* Department Section */}
      <section id="department" className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 mb-4">
              <span className="text-sm text-blue-400 font-semibold uppercase tracking-wide">Departments</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Academic Excellence
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Explore our diverse academic departments and specialized programs.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { key: 'tech', label: 'Technology' },
              { key: 'engineering', label: 'Engineering' },
              { key: 'business', label: 'Business' },
              { key: 'liberal-arts', label: 'Liberal Arts' },
              { key: 'health', label: 'Health Sciences' },
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryClick(category.key)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments[activeCategory]?.map((dept, index) => (
              <div
                key={index}
                className="group bg-slate-900/50 rounded-xl p-6 border border-slate-800 hover:border-blue-600/50 transition-all duration-300 hover-lift"
              >
                <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  <i className={`fas ${dept.icon} text-2xl text-blue-500`}></i>
                </div>
                
                <h3 className="text-xl font-bold mb-1 text-white">
                  {dept.title}
                </h3>
                
                <p className="text-sm text-blue-400 mb-3 font-medium">
                  {dept.meta}
                </p>
                
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {dept.description}
                </p>
                
                <button className="group/btn text-blue-500 font-medium text-sm flex items-center space-x-2 hover:text-blue-400 transition-colors">
                  <span>View Department</span>
                  <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

        </div>
    );
};