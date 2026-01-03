import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  segment?: string;
  tier?: string;
}

interface Product {
  id: string;
  name: string;
  category?: string;
}

interface Ownership {
  customerId: string;
  productId: string;
  status: 'adopted' | 'opportunity' | 'in_progress';
}

interface WhitespacePdfGridProps {
  customers: Customer[];
  products: Product[];
  ownership: Ownership[];
  primaryColor: string;
  secondaryColor: string;
  isDetailPage?: boolean;
}

export function WhitespacePdfGrid({
  customers,
  products,
  ownership,
  primaryColor,
  secondaryColor,
  isDetailPage = false,
}: WhitespacePdfGridProps) {
  const getOwnership = (customerId: string, productId: string) => {
    return ownership.find(o => o.customerId === customerId && o.productId === productId);
  };

  // For detail page, show all data; for summary, limit to fit
  const maxProducts = isDetailPage ? products.length : Math.min(products.length, 10);
  const maxCustomers = isDetailPage ? customers.length : Math.min(customers.length, 12);
  const displayProducts = products.slice(0, maxProducts);
  const displayCustomers = customers.slice(0, maxCustomers);
  
  // Dynamic sizing based on grid dimensions
  const baseCellWidth = isDetailPage 
    ? Math.max(60, Math.min(90, 900 / displayProducts.length))
    : Math.max(70, Math.min(100, 800 / displayProducts.length));
  const cellHeight = isDetailPage ? 28 : 32;
  const customerColWidth = isDetailPage ? 120 : 140;
  const fontSize = isDetailPage ? 10 : 11;

  const getCellStyle = (status?: 'adopted' | 'opportunity' | 'in_progress') => {
    if (status === 'adopted') {
      return { backgroundColor: primaryColor, color: '#ffffff' };
    }
    if (status === 'in_progress') {
      return { backgroundColor: secondaryColor, color: '#ffffff' };
    }
    return { backgroundColor: '#f3f4f6', color: '#9ca3af' };
  };

  return (
    <div className="h-full flex flex-col p-3">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3" style={{ fontSize }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
          <span>Adopted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: secondaryColor }} />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span>Opportunity</span>
        </div>
        {!isDetailPage && customers.length > maxCustomers && (
          <span className="text-gray-400 ml-auto">
            Showing {maxCustomers} of {customers.length} customers
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full border-collapse" style={{ fontSize }}>
          <thead>
            <tr>
              <th 
                className="text-left font-semibold p-2 bg-gray-50 border-b border-gray-200"
                style={{ width: customerColWidth }}
              >
                Customer
              </th>
              {displayProducts.map(product => (
                <th 
                  key={product.id}
                  className="text-center font-medium p-2 bg-gray-50 border-b border-gray-200"
                  style={{ width: baseCellWidth }}
                >
                  <div className="break-words whitespace-normal leading-tight">{product.name}</div>
                </th>
              ))}
              <th className="text-center font-semibold p-2 bg-gray-50 border-b border-gray-200 w-12">
                Gaps
              </th>
            </tr>
          </thead>
          <tbody>
          {displayCustomers.map((customer, idx) => {
              // Count against ALL products, not just displayed ones
              const adoptedCount = products.filter(p => 
                getOwnership(customer.id, p.id)?.status === 'adopted'
              ).length;
              const gapCount = products.length - adoptedCount;

              return (
                <tr 
                  key={customer.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="p-2 border-b border-gray-100">
                    <div className="font-medium break-words whitespace-normal leading-tight">{customer.name}</div>
                    {customer.segment && (
                      <div className="text-gray-400" style={{ fontSize: fontSize - 2 }}>{customer.segment}</div>
                    )}
                  </td>
                  {displayProducts.map(product => {
                    const own = getOwnership(customer.id, product.id);
                    const status = own?.status;
                    const style = getCellStyle(status);

                    return (
                      <td key={product.id} className="p-1 border-b border-gray-100 text-center">
                        <div 
                          className="mx-auto rounded flex items-center justify-center"
                          style={{ 
                            ...style,
                            width: baseCellWidth - 16,
                            height: cellHeight,
                          }}
                        >
                          {status === 'adopted' && <CheckCircle2 className="h-4 w-4" />}
                          {status === 'in_progress' && <Sparkles className="h-4 w-4" />}
                          {!status && <Circle className="h-4 w-4" />}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-1 border-b border-gray-100 text-center">
                    <span 
                      className={`inline-block px-2 py-0.5 rounded font-bold ${
                        gapCount > 3 ? 'bg-red-100 text-red-700' : 
                        gapCount > 1 ? 'bg-amber-100 text-amber-700' : 
                        'bg-green-100 text-green-700'
                      }`}
                      style={{ fontSize: fontSize - 1 }}
                    >
                      {gapCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
