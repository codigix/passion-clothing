import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Send,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Download,
  RefreshCw,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShipmentDispatchPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [courierPartners, setCourierPartners] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0
  });

  // Fetch shipments and related data
  useEffect(() => {
    fetchShipments();
    fetchCourierPartners();
    fetchStats();
  }, [searchTerm, statusFilter, courierFilter, dateFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (courierFilter) params.append('courier_partner_id', courierFilter);
      if (dateFilter) params.append('start_date', dateFilter);
      
      const response = await fetch(`/api/shipments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      } else {
        throw new Error('Failed to fetch shipments');
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourierPartners = async () => {
    try {
      const response = await fetch('/api/courier-partners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourierPartners(data.courierPartners || []);
      }
    } catch (error) {
      console.error('Error fetching courier partners:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shipments/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDispatchShipment = async (shipmentId, dispatchData) => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'dispatched',
          location: dispatchData.location,
          notes: dispatchData.notes,
          courier_partner_id: dispatchData.courier_partner_id,
          tracking_number: dispatchData.tracking_number
        })
      });

      if (response.ok) {
        toast.success('Shipment dispatched successfully');
        fetchShipments();
        fetchStats();
        setShowDispatchModal(false);
        setSelectedShipment(null);
      } else {
        throw new Error('Failed to dispatch shipment');
      }
    } catch (error) {
      console.error('Error dispatching shipment:', error);
      toast.error('Failed to dispatch shipment');
    }
  };

  const handleBulkDispatch = async () => {
    if (selectedShipments.length === 0) {
      toast.error('Please select shipments to dispatch');
      return;
    }

    try {
      const promises = selectedShipments.map(shipmentId =>
        fetch(`/api/shipments/${shipmentId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: 'dispatched',
            location: 'Warehouse',
            notes: 'Bulk dispatch'
          })
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedShipments.length} shipments dispatched successfully`);
      setSelectedShipments([]);
      fetchShipments();
      fetchStats();
    } catch (error) {
      console.error('Error in bulk dispatch:', error);
      toast.error('Failed to dispatch some shipments');
    }
  };

  const handlePrintLabels = (shipmentIds) => {
    // Generate print labels for selected shipments
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Labels</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .label { page-break-after: always; padding: 20px; border: 1px solid #000; margin: 10px; }
            .header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .address { margin: 10px 0; }
            .barcode { font-family: 'Courier New', monospace; font-size: 24px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          ${shipmentIds.map(id => {
            const shipment = shipments.find(s => s.id === id);
            return `
              <div class="label">
                <div class="header">Pashion Clothing Factory</div>
                <div class="address">
                  <strong>To:</strong><br>
                  ${shipment?.salesOrder?.customer?.name || 'N/A'}<br>
                  ${shipment?.delivery_address || 'N/A'}
                </div>
                <div class="barcode">||||| ${shipment?.shipment_number || ''} |||||</div>
                <div>Tracking: ${shipment?.tracking_number || 'N/A'}</div>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'dispatched': return <Send className="w-4 h-4 text-blue-500" />;
      case 'in_transit': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const DispatchModal = ({ shipment, onClose, onDispatch }) => {
    const [formData, setFormData] = useState({
      courier_partner_id: '',
      tracking_number: '',
      location: 'Warehouse',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onDispatch(shipment.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Dispatch Shipment</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Courier Partner</label>
              <select
                value={formData.courier_partner_id}
                onChange={(e) => setFormData({...formData, courier_partner_id: e.target.value})}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select Courier</option>
                {courierPartners.map(courier => (
                  <option key={courier.id} value={courier.id}>
                    {courier.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter tracking number"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Dispatch Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Dispatch location"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border rounded-lg"
                rows="3"
                placeholder="Additional notes"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Dispatch
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Orders</h1>
          <p className="text-gray-600">Manage and dispatch shipment orders</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePrintLabels(selectedShipments)}
            disabled={selectedShipments.length === 0}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </button>
          <button
            onClick={handleBulkDispatch}
            disabled={selectedShipments.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Bulk Dispatch
          </button>
          <button
            onClick={fetchShipments}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Dispatch</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dispatched</p>
              <p className="text-2xl font-bold text-blue-600">{stats.dispatched}</p>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
            </div>
            <Truck className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Couriers</option>
            {courierPartners.map(courier => (
              <option key={courier.id} value={courier.id}>
                {courier.company_name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedShipments(shipments.map(s => s.id));
                      } else {
                        setSelectedShipments([]);
                      }
                    }}
                    checked={selectedShipments.length === shipments.length && shipments.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No shipments found
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedShipments.includes(shipment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedShipments([...selectedShipments, shipment.id]);
                          } else {
                            setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.shipment_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shipment.tracking_number || 'No tracking'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.salesOrder?.customer?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shipment.salesOrder?.customer?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {getStatusIcon(shipment.status)}
                        <span className="ml-1 capitalize">{shipment.status?.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shipment.courierPartner?.company_name || shipment.courier_company || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShowDispatchModal(true);
                          }}
                          disabled={shipment.status !== 'pending'}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintLabels([shipment.id])}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && selectedShipment && (
        <DispatchModal
          shipment={selectedShipment}
          onClose={() => {
            setShowDispatchModal(false);
            setSelectedShipment(null);
          }}
          onDispatch={handleDispatchShipment}
        />
      )}
    </div>
  );
};

export default ShipmentDispatchPage;
