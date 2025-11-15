import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SearchResults from './SearchResults';

const Search = () => {
  const { user } = useContext(AuthContext);
  const [searchType, setSearchType] = useState('users');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    role: '',
    location: '',
    skills: '',
    minInvestment: '',
    maxInvestment: '',
    minHourlyRate: '',
    maxHourlyRate: '',
    startupStage: '',
    services: '',
    technology: '',
    service: '',
    minRate: '',
    maxRate: '',
    stage: '',
    minFunding: '',
    maxFunding: '',
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    fetchAvailableOptions();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      const token = user?.token;
      const [skillsRes, locationsRes] = await Promise.all([
        axios.get('/api/search/available-skills', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/search/available-locations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAvailableSkills(skillsRes.data);
      setAvailableLocations(locationsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = user?.token;
      let url = '';
      let params = {};

      switch (searchType) {
        case 'users':
          url = '/api/search/users';
          params = {
            query,
            role: filters.role,
            location: filters.location,
            skills: filters.skills,
            minInvestment: filters.minInvestment,
            maxInvestment: filters.maxInvestment,
            minHourlyRate: filters.minHourlyRate,
            maxHourlyRate: filters.maxHourlyRate,
            startupStage: filters.startupStage,
            services: filters.services,
          };
          break;
        case 'skills':
          url = '/api/search/skills';
          params = { skill: query };
          break;
        case 'projects':
          url = '/api/search/projects';
          params = { query, technology: filters.technology };
          break;
        case 'startups':
          url = '/api/search/startups';
          params = {
            query,
            stage: filters.stage,
            minFunding: filters.minFunding,
            maxFunding: filters.maxFunding,
          };
          break;
        case 'freelancers':
          url = '/api/search/freelancers';
          params = {
            query,
            service: filters.service,
            minRate: filters.minRate,
            maxRate: filters.maxRate,
          };
          break;
        default:
          break;
      }

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: cleanParams,
      });

      setResults(data.users || data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      role: '',
      location: '',
      skills: '',
      minInvestment: '',
      maxInvestment: '',
      minHourlyRate: '',
      maxHourlyRate: '',
      startupStage: '',
      services: '',
      technology: '',
      service: '',
      minRate: '',
      maxRate: '',
      stage: '',
      minFunding: '',
      maxFunding: '',
    });
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>Search & Discover</h2>
        <p>Find students, freelancers, startups, investors, projects, and more</p>
      </div>

      <div className="search-type-selector">
        <button
          className={searchType === 'users' ? 'search-type-btn active' : 'search-type-btn'}
          onClick={() => setSearchType('users')}
        >
          👥 Users
        </button>
        <button
          className={searchType === 'startups' ? 'search-type-btn active' : 'search-type-btn'}
          onClick={() => setSearchType('startups')}
        >
          🚀 Startups
        </button>
        <button
          className={searchType === 'freelancers' ? 'search-type-btn active' : 'search-type-btn'}
          onClick={() => setSearchType('freelancers')}
        >
          💼 Freelancers
        </button>
        <button
          className={searchType === 'projects' ? 'search-type-btn active' : 'search-type-btn'}
          onClick={() => setSearchType('projects')}
        >
          📁 Projects
        </button>
        <button
          className={searchType === 'skills' ? 'search-type-btn active' : 'search-type-btn'}
          onClick={() => setSearchType('skills')}
        >
          🎯 Skills
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${searchType}...`}
            className="search-input"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>

        <div className="filters-section">
          {searchType === 'users' && (
            <>
              <div className="filter-group">
                <label>Role</label>
                <select name="role" value={filters.role} onChange={handleFilterChange}>
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="startup">Startup</option>
                  <option value="investor">Investor</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  list="locations"
                />
                <datalist id="locations">
                  {availableLocations.map((loc, index) => (
                    <option key={index} value={loc} />
                  ))}
                </datalist>
              </div>

              <div className="filter-group">
                <label>Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={filters.skills}
                  onChange={handleFilterChange}
                  placeholder="e.g., React, Node.js"
                  list="skills"
                />
                <datalist id="skills">
                  {availableSkills.map((skill, index) => (
                    <option key={index} value={skill} />
                  ))}
                </datalist>
              </div>
            </>
          )}

          {searchType === 'startups' && (
            <>
              <div className="filter-group">
                <label>Stage</label>
                <select name="stage" value={filters.stage} onChange={handleFilterChange}>
                  <option value="">All Stages</option>
                  <option value="idea">Idea</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                  <option value="series-c">Series C</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Funding Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minFunding"
                    value={filters.minFunding}
                    onChange={handleFilterChange}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxFunding"
                    value={filters.maxFunding}
                    onChange={handleFilterChange}
                    placeholder="Max"
                  />
                </div>
              </div>
            </>
          )}

          {searchType === 'freelancers' && (
            <>
              <div className="filter-group">
                <label>Service</label>
                <input
                  type="text"
                  name="service"
                  value={filters.service}
                  onChange={handleFilterChange}
                  placeholder="e.g., Web Development"
                />
              </div>

              <div className="filter-group">
                <label>Hourly Rate ($)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minRate"
                    value={filters.minRate}
                    onChange={handleFilterChange}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxRate"
                    value={filters.maxRate}
                    onChange={handleFilterChange}
                    placeholder="Max"
                  />
                </div>
              </div>
            </>
          )}

          {searchType === 'projects' && (
            <div className="filter-group">
              <label>Technology</label>
              <input
                type="text"
                name="technology"
                value={filters.technology}
                onChange={handleFilterChange}
                placeholder="e.g., React, Python"
              />
            </div>
          )}

          <button type="button" onClick={resetFilters} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      </form>

      <SearchResults results={results} searchType={searchType} loading={loading} />
    </div>
  );
};

export default Search;
