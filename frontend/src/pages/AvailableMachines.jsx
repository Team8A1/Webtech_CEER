import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Info, User } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar';
import StudentFooter from '../components/StudentFooter';

function AvailableMachines() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/equipment/list');
      if (response.data.success) {
        setEquipment(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Reusing StudentNavbar if meaningful, or just a header */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-serif text-stone-900">Available Equipment</h1>
          <p className="text-stone-500 mt-2">Browse the list of equipment available in the laboratory.</p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-serif text-stone-900 mb-2">No Equipment Found</h3>
            <p className="text-stone-500">
              {searchTerm ? `No matches for "${searchTerm}"` : "No equipment has been listed yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEquipment.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Image */}
                <div className="h-56 relative overflow-hidden bg-white flex items-center justify-center p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-red-700 transition-colors">
                    {item.name}
                  </h3>

                  {/* In Charge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1 bg-stone-100 rounded-full">
                      <User className="w-3 h-3 text-stone-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      In Charge: <span className="text-stone-900">{item.inCharge}</span>
                    </span>
                  </div>

                  <div className="text-xs text-red-700 font-medium mt-auto flex items-center gap-1">
                    View details <Search className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-72 relative bg-stone-50 flex items-center justify-center p-4">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-serif mb-2">{selectedItem.name}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">

              <div className="space-y-6">
                {selectedItem.specification && (
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 font-mono">Specification</p>
                    <p className="text-stone-700 bg-stone-50 p-2 rounded border border-stone-100 font-mono text-sm">
                      {selectedItem.specification}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Description</p>
                  <p className="text-stone-600 leading-relaxed font-light text-lg">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.additionalInfo && (
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Additional Information</p>
                    <a
                      href={selectedItem.additionalInfo.startsWith('http') ? selectedItem.additionalInfo : `https://${selectedItem.additionalInfo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-700 hover:text-red-900 underline break-all text-sm"
                    >
                      {selectedItem.additionalInfo}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableMachines;
