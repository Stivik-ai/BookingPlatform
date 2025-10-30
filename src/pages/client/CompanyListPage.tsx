import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Calendar, Tag, X } from 'lucide-react';
import { useNavigate } from './navigation';

interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  category: string;
  city: string;
  tags: string[];
}

interface CompanyListPageProps {
  onSelectCompany?: (id: string) => void;
}

export function CompanyListPage({ onSelectCompany }: CompanyListPageProps) {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, description, logo_url, category, city, tags')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }

  const allTags = Array.from(
    new Set(companies.flatMap(c => c.tags || []))
  ).sort();

  const cities = Array.from(
    new Set(companies.map(c => c.city).filter(Boolean))
  ).sort();

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      company.name.toLowerCase().includes(searchLower) ||
      company.category.toLowerCase().includes(searchLower) ||
      company.description?.toLowerCase().includes(searchLower) ||
      company.city?.toLowerCase().includes(searchLower) ||
      (company.tags || []).some(tag => tag.toLowerCase().includes(searchLower));

    const matchesCity = !cityFilter || company.city === cityFilter;

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => (company.tags || []).includes(tag));

    return matchesSearch && matchesCity && matchesTags;
  });

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Services</h1>
          <p className="text-gray-600">Search by name, location, category, or tags</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies (e.g., 'barber Kraków', 'fryzjer męski', 'pilates')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {cities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by City
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setCityFilter('')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !cityFilter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Cities
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setCityFilter(city)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      cityFilter === city
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tags
              </label>
              <div className="flex gap-2 flex-wrap">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Tag size={14} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h2>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => {
                  if (onSelectCompany) {
                    onSelectCompany(company.id);
                  } else {
                    navigate(`/company/${company.id}`);
                  }
                }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200"
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                    <Calendar className="text-blue-600" size={48} />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{company.name}</h3>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                      {company.category}
                    </span>
                  </div>

                  {company.city && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin size={16} className="mr-1" />
                      {company.city}
                    </div>
                  )}

                  {company.tags && company.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {company.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                      {company.tags.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{company.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {company.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {company.description}
                    </p>
                  )}

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
