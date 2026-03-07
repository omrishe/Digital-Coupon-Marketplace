import React, { useEffect, useState } from 'react';
import { CustomerApi } from '../api';
import { ShoppingCartIcon, TagIcon } from 'lucide-react';
import type { PublicProduct } from '@repo/shared';

import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC<{ isAuthenticatedUser: boolean }> = ({ isAuthenticatedUser }) => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await CustomerApi.getAvailableProducts();
      setProducts(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handlePurchase = async (product: PublicProduct) => {
    try {
      setPurchasing(product.id);
      const result = await CustomerApi.purchaseProduct(product.id);
      setSuccessData({ product, result });
      // Remove product from list since it's now sold
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err: any) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div
          className="animate-spin"
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
          }}
        ></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Digital Storefront
        </h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>
          Purchase exclusive digital coupons securely.
        </p>
      </div>

      {error && (
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderColor: 'var(--color-danger)',
            marginBottom: '2rem',
            background: 'rgba(248, 113, 113, 0.1)',
          }}
        >
          <p className="text-danger">{error}</p>
        </div>
      )}

      {successData && (
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            borderColor: 'var(--color-success)',
            marginBottom: '3rem',
            background: 'rgba(52, 211, 153, 0.05)',
          }}
        >
          <h2 className="text-success" style={{ marginBottom: '1rem' }}>
            🎉 Purchase Successful!
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You successfully purchased <strong>{successData.product.name}</strong>.
          </p>
          <div
            style={{
              padding: '1rem',
              background: 'var(--color-bg-alt)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
            }}
          >
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Your Unique Coupon Code:
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                color: 'var(--color-primary)',
              }}
            >
              {successData.result.value}
            </p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => setSuccessData(null)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {products.length === 0 && !error && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--color-text-muted)',
            }}
          >
            No products available at the moment.
          </div>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div
              style={{
                height: '200px',
                background: 'var(--color-bg-alt)',
                backgroundImage: `url(${product.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p
                className="text-muted"
                style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}
              >
                {product.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TagIcon size={18} className="text-primary" />
                  <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {isAuthenticatedUser ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePurchase(product)}
                    disabled={purchasing === product.id}
                  >
                    {purchasing === product.id ? (
                      'Processing...'
                    ) : (
                      <>
                        <ShoppingCartIcon size={18} /> Buy Now
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/auth')}
                    title="You must be logged in to purchase"
                  >
                    Login to Purchase
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
