import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  Leaf,
  Zap,
  ClipboardList,
} from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import StudentFooter from '../components/StudentFooter';

// --- Assets & Mock Data ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop", // Clean office/planning
  bom: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop", // Tech/Materials
  carbon: "https://images.unsplash.com/photo-1529773464063-f6810c569277?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Nature/Leaf
  energy: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop" // Lightbulb/Energy
};

const TOOLS = [
  {
    id: 1,
    title: "Bill of Materials",
    description: "Create, edit, and manage BOMs with detailed specifications.",
    image: IMAGES.bom,
    icon: <ClipboardList className="w-6 h-6" />,
    path: '/student/bom',
    rating: "Active"
  },
  {
    id: 2,
    title: "Carbon Footprint",
    description: "Calculate and track carbon emissions for your projects.",
    image: IMAGES.carbon,
    icon: <Leaf className="w-6 h-6" />,
    path: '/student/carbon',
    rating: "New"
  },
  {
    id: 3,
    title: "Embodied Energy",
    description: "Analyze embodied energy metrics for components and materials.",
    image: IMAGES.energy,
    icon: <Zap className="w-6 h-6" />,
    path: '/student/energy',
    rating: "Beta"
  }
];

// --- Components ---

const Hero = () => (
  <header className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
    {/* Clean Background */}
    <div className="absolute inset-0 bg-stone-50"></div>
    {/* Subtle Gradient Orb */}
    <div className="absolute top-0 right-0 w-2/3 h-full bg-red-50 blur-3xl rounded-full translate-x-1/2 opacity-60"></div>

    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
      <div className="inline-block mb-4 px-4 py-1.5 border border-stone-200 rounded-full backdrop-blur-sm bg-white/50">
        <span className="text-xs md:text-sm text-stone-600 uppercase tracking-[0.2em] font-medium">
          Academic Portal
        </span>
      </div>
      <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-8 leading-tight drop-shadow-sm">
        Student <span className="italic text-red-700">Dashboard</span>
      </h1>
      <p className="text-stone-600 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
        Manage your project materials, calculate carbon footprints, and analyze embodied energy metrics in one unified workspace.
      </p>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce">
      <span className="text-[10px] uppercase tracking-widest text-stone-900 font-medium">Tools</span>
      <div className="w-px h-12 bg-gradient-to-b from-stone-900 to-transparent"></div>
    </div>
  </header>
);

const ToolCard = ({ tool, navigate }) => (
  <div
    onClick={() => navigate(tool.path)}
    className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:shadow-2xl"
  >
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: `url(${tool.image})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

    <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 flex items-center gap-1 shadow-sm">
      <span className="text-xs text-white font-medium tracking-wide">{tool.rating}</span>
    </div>

    <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <div className="flex items-center gap-2 mb-3 text-red-300">
        {tool.icon}
        <span className="text-xs uppercase tracking-widest font-medium">Analysis Tool</span>
      </div>
      <h3 className="text-3xl font-serif text-white mb-2">{tool.title}</h3>
      <p className="text-stone-200 text-sm mb-6 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        {tool.description}
      </p>
      <div className="flex items-center justify-between border-t border-white/20 pt-4">
        <span className="text-white font-light text-sm">Access Module</span>
        <button className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const TeamSection = ({ team, loading }) => (
  <section className="py-24 bg-white" id="team">
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-end mb-16">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-widest">Collaboration</span>
          <h2 className="text-4xl font-serif text-stone-900 mt-4">Your Project Team</h2>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center bg-stone-50 rounded-3xl animate-pulse">
          <span className="text-stone-400 font-serif tracking-widest">LOADING TEAM DATA...</span>
        </div>
      ) : !team ? (
        <div className="w-full p-12 text-center bg-stone-50 rounded-3xl border border-stone-100">
          <p className="text-stone-500 font-serif mb-4">No team details available.</p>
          <p className="text-stone-400 text-sm">Create a team to see your project details here.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Info Card */}
          <div className="lg:col-span-2 bg-stone-50 p-10 rounded-3xl border border-stone-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-red-700 mb-2 block">Project Statement</span>
              <h3 className="text-3xl font-serif text-stone-900 mb-6">{team.problemStatement}</h3>

              <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-stone-200">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Team ID</p>
                  <p className="text-stone-700 font-medium font-serif">{team._id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Guide</p>
                  <p className="text-stone-900 font-medium font-serif">{team.guide?.name}</p>
                  <p className="text-red-700 text-sm">{team.guide?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-stone-900 font-serif text-xl mb-6">Team Members</h4>
            {team.members?.map((member) => (
              <div key={member._id} className="group flex items-center gap-4 p-6 bg-white rounded-2xl border border-stone-100 hover:border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-serif text-lg group-hover:bg-red-700 group-hover:text-white transition-colors">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-stone-900 font-serif group-hover:text-red-800 transition-colors">{member.name}</p>
                  <p className="text-xs text-stone-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

const StudentHome = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check Auth
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token) {
      navigate('/login/student');
      return;
    }
    setUser(storedUser);

    // Fetch Team Data
    const fetchTeam = async () => {
      try {
        // 1. Try fetching from API first
        const response = await axios.get('http://localhost:8000/api/student/team/details', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.team) {
          const apiTeam = response.data.team;
          setTeam({
            _id: apiTeam._id,
            problemStatement: apiTeam.problemStatement,
            guide: {
              name: apiTeam.guide?.name || 'Assigned Guide',
              email: apiTeam.guide?.email || 'guide@university.edu'
            },
            members: apiTeam.members.map(m => ({
              _id: m._id,
              name: m.name,
              email: m.email
            }))
          });
        } else {
          // 2. Fallback to LocalStorage if no API team found
          const teams = JSON.parse(localStorage.getItem('teams') || '[]');
          const myTeam = teams.length > 0 ? teams[teams.length - 1] : null;

          if (myTeam) {
            setTeam({
              _id: myTeam.id,
              problemStatement: myTeam.projectTitle,
              guide: {
                name: myTeam.guideName,
                email: 'guide@university.edu'
              },
              members: myTeam.members.map((m, i) => ({
                _id: i.toString(),
                name: m.name,
                email: m.usn ? `${m.usn} (${m.div})` : m.email // Handle both formats
              }))
            });
          }
        }
      } catch (error) {
        console.error("Error fetching team data", error);
        // Fallback to LocalStorage on error
        const teams = JSON.parse(localStorage.getItem('teams') || '[]');
        const myTeam = teams.length > 0 ? teams[teams.length - 1] : null;

        if (myTeam) {
          setTeam({
            _id: myTeam.id,
            problemStatement: myTeam.projectTitle,
            guide: {
              name: myTeam.guideName,
              email: 'guide@university.edu'
            },
            members: myTeam.members.map((m, i) => ({
              _id: i.toString(),
              name: m.name,
              email: m.usn ? `${m.usn} (${m.div})` : m.email
            }))
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch Materials
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/material/list');
        if (response.data.success) {
          setMaterials(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching materials", error);
      }
    };

    // Small delay to simulate loading and ensure smooth transition
    setTimeout(() => {
      fetchTeam();
      fetchMaterials();
    }, 500);

  }, [navigate]);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-red-100 selection:text-red-900">
      <StudentNavbar user={user} />

      <main>
        <Hero />

        <section className="py-24 bg-white" id="projects">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-red-700 text-xs font-bold uppercase tracking-widest">Academic Tools</span>
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mt-4 mb-6">Project Analysis</h2>
              <p className="text-stone-500 font-light text-lg">
                Select a tool below to manage your project specifications and environmental impact.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TOOLS.map(tool => (
                <ToolCard key={tool.id} tool={tool} navigate={navigate} />
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-24 bg-stone-50" id="resources">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-red-700 text-xs font-bold uppercase tracking-widest">Resources</span>
                <h2 className="text-4xl font-serif text-stone-900 mt-4">Available Materials</h2>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 bg-white text-sm"
                />
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                No materials currently available.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100">
                        <th className="px-8 py-5 text-left text-xs font-bold text-stone-500 uppercase tracking-widest w-24">Image</th>
                        <th className="px-8 py-5 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Name</th>
                        <th className="px-8 py-5 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Specs</th>
                        <th className="px-8 py-5 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {materials
                        .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((material) => (
                          <tr key={material._id} className="group hover:bg-stone-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden border border-stone-200">
                                <img
                                  src={material.imageUrl}
                                  alt={material.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="px-8 py-5 align-top pt-6">
                              <span className="font-serif text-lg text-stone-900 font-medium">{material.name}</span>
                            </td>
                            <td className="px-8 py-5 align-top pt-6">
                              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full border border-stone-200">
                                {material.dimension}
                              </span>
                            </td>
                            <td className="px-8 py-5 align-top pt-6 max-w-xs">
                              <p className="text-sm text-stone-500 line-clamp-2 font-light leading-relaxed">
                                {material.description}
                              </p>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="p-12 text-center text-stone-400 text-sm">
                      No materials found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <TeamSection team={team} loading={loading} />
      </main>

      <StudentFooter />
    </div>
  );
};

export default StudentHome;
