import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Funding = () => {
  const { user } = useContext(AuthContext);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: '',
    industry: '',
    minAmount: '',
    maxAmount: '',
    search: '',
  });

  useEffect(() => {
    fetchFundingRequests();
  }, [filters]);

  const fetchFundingRequests = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      const { data } = await axios.get('/api/funding', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setFundingRequests(data.fundingRequests);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="funding-container">
      <div className="funding-header">
        <h2> Funding Opportunities</h2>
        {user?.role === 'startup' && (
          <Link to="/funding/post" className="btn">
            Post Funding Request
          </Link>
        )}
      </div>

      <div className="funding-filters">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search funding requests..."
          className="search-input"
        />

        <select name="stage" value={filters.stage} onChange={handleFilterChange}>
          <option value="">All Stages</option>
          <option value="idea">Idea</option>
          <option value="seed">Seed</option>
          <option value="series-a">Series A</option>
          <option value="series-b">Series B</option>
          <option value="series-c">Series C</option>
          <option value="series-d">Series D</option>
        </select>

        <input
          type="text"
          name="industry"
          value={filters.industry}
          onChange={handleFilterChange}
          placeholder="Industry"
        />

        <input
          type="number"
          name="minAmount"
          value={filters.minAmount}
          onChange={handleFilterChange}
          placeholder="Min Amount"
        />

        <input
          type="number"
          name="maxAmount"
          value={filters.maxAmount}
          onChange={handleFilterChange}
          placeholder="Max Amount"
        />
      </div>

      <div className="funding-list">
        {loading ? (
          <div className="loading">Loading funding requests...</div>
        ) : fundingRequests.length === 0 ? (
          <div className="no-funding">No funding requests found.</div>
        ) : (
          fundingRequests.map((request) => (
            <Link key={request._id} to={`/funding/${request._id}`} className="funding-card">
              <div className="funding-card-header">
                <div>
                  <h3>{request.title}</h3>
                  <div className="funding-meta">
                    <span className="funding-stage">{request.stage}</span>
                    <span className="funding-industry">{request.industry}</span>
                  </div>
                </div>
                <div className="funding-startup">
                  <img
                    src={request.startup?.profilePhoto || '/default-avatar.png'}
                    alt={request.startup?.name}
                    className="startup-avatar"
                  />
                  <div>
                    <p className="startup-name">
                      {request.startup?.startupProfile?.startupName || request.startup?.name}
                    </p>
                  </div>
                </div>
              </div>

              <p className="funding-description">{request.description}</p>

              <div className="funding-details">
                <div className="funding-amount">
                  <span className="label">Seeking:</span>
                  <span className="value">
                    {request.fundingAmount?.toLocaleString()} {request.currency}
                  </span>
                </div>

                {request.valuation && (
                  <div className="funding-valuation">
                    <span className="label">Valuation:</span>
                    <span className="value">{request.valuation?.toLocaleString()}</span>
                  </div>
                )}

                {request.equityOffered && (
                  <div className="funding-equity">
                    <span className="label">Equity:</span>
                    <span className="value">{request.equityOffered}%</span>
                  </div>
                )}
              </div>

              <div className="funding-footer">
                <span className="funding-interests">
                  {request.interests?.length || 0} investor{request.interests?.length !== 1 ? 's' : ''} interested
                </span>
                <span className="funding-views">{request.views} views</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Funding;
