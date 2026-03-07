import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApi } from '../api';
import { PlusIcon, RefreshCcwIcon } from 'lucide-react';

const AdminMode: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
    cost_price: '',
    margin_percentage: '',
    value_type: 'STRING',
    value: '',
    type: 'coupon', // default required by base product
  });

  const checkAuthAndLoad = async () => {
    try {
      const auth = await AdminApi.checkAuth();
      if (!auth.authenticated) throw new Error();
      loadProducts();
    } catch {
      navigate('/admin/login');
    }
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await AdminApi.getAllProducts();
      setProducts(res.data || []);
      setError(null);
    } catch (err: any) {
      if (err.statusCode === 401 || err.statusCode === 403) {
        AdminApi.logout();
        navigate('/admin/login');
      } else {
        setError(err.message || 'Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await AdminApi.createProduct({
        ...formData,
        cost_price: Number(formData.cost_price),
        margin_percentage: Number(formData.margin_percentage),
      });
      setShowForm(false);
      setFormData({
        ...formData,
        name: '',
        description: '',
        value: '',
        cost_price: '',
        margin_percentage: '',
      });
      await loadProducts();
    } catch (err: any) {
      alert(`Failed to create: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading...</div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 className="text-gradient">Admin Dashboard</h1>
          <p className="text-muted">Manage your digital coupon inventory.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={loadProducts}>
            <RefreshCcwIcon size={18} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <PlusIcon size={18} /> {showForm ? 'Cancel' : 'New Product'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(248, 113, 113, 0.1)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Create New Coupon</h2>
          <form
            onSubmit={handleCreate}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
          >
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. $100 Amazon Gift Card"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Margin (%)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.margin_percentage}
                onChange={(e) => setFormData({ ...formData, margin_percentage: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Secret Coupon Value</label>
              <input
                type="text"
                className="form-control"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                placeholder="The actual code the customer receives"
              />
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Create Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <tr>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Product
                </th>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Cost
                </th>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Margin
                </th>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Min Sell Price
                </th>
                <th
                  style={{
                    padding: '1rem 1.5rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No products found. Create one to get started.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {p.id.split('-')[0]}...
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '99px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: p.is_sold
                            ? 'rgba(248, 113, 113, 0.1)'
                            : 'rgba(52, 211, 153, 0.1)',
                          color: p.is_sold ? 'var(--color-danger)' : 'var(--color-success)',
                        }}
                      >
                        {p.is_sold ? 'Sold' : 'Available'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>
                      ${Number(p.cost_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>
                      {Number(p.margin_percentage)}%
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        fontFamily: 'monospace',
                        color: 'var(--color-primary)',
                      }}
                    >
                      ${Number(p.minimum_sell_price).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMode;
