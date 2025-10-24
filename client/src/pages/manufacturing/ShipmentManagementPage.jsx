import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Truck,
  Package,
  BarChart3,
  MapPin,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ShipmentStatusBadge from '../../components/shipment/ShipmentStatusBadge';
import ShipmentTimeline from '../../components/shipment/ShipmentTimeline';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shipment-tabpanel-${index}`}
      aria-labelledby={`shipment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ShipmentManagementPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [readyOrders, setReadyOrders] = useState([]);

  const PAGE_SIZE = 10;

  // Fetch shipment statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/shipments/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch shipment stats:', error);
    }
  }, []);

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await api.get('/shipments', { params });
      setShipments(response.data.shipments || []);
    } catch (error) {
      toast.error('Failed to fetch shipments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  // Fetch orders ready for shipment
  const fetchReadyOrders = useCallback(async () => {
    try {
      const response = await api.get('/manufacturing/orders/ready-for-shipment');
      setReadyOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch ready orders:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchShipments();
    if (tabIndex === 1) {
      fetchReadyOrders();
    }
  }, [tabIndex, fetchStats, fetchShipments, fetchReadyOrders]);

  const handleStatusUpdate = async () => {
    if (!selectedShipment?.id || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/shipments/${selectedShipment.id}/status`, {
        status: newStatus,
        notes: updateNotes || undefined
      });

      toast.success('Shipment status updated successfully');
      setStatusUpdateDialogOpen(false);
      setNewStatus('');
      setUpdateNotes('');
      fetchShipments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update shipment status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats?.totals?.total || 0,
      icon: Truck,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Shipments',
      value: stats?.totals?.active || 0,
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Delivered',
      value: stats?.totals?.completed || 0,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Failed Deliveries',
      value: stats?.totals?.failed || 0,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Shipment Management
          </h1>
        </div>
        <p className="text-gray-600">Track and manage all shipments across your supply chain</p>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className={`bg-gradient-to-br ${card.color} w-12 h-12 rounded-xl text-white flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          className="border-b border-gray-200"
        >
          <Tab label="All Shipments" id="shipment-tab-0" />
          <Tab label="Ready Orders" id="shipment-tab-1" />
          <Tab label="Active Tracking" id="shipment-tab-2" />
          <Tab label="Reports" id="shipment-tab-3" />
        </Tabs>

        <CardContent>
          {/* Tab 1: All Shipments */}
          <TabPanel value={tabIndex} index={0}>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center flex-wrap">
                <TextField
                  label="Search"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="w-4 h-4" />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Shipment #, Tracking #..."
                  className="flex-1 min-w-xs"
                />

                <FormControl size="small" className="min-w-xs">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="packed">Packed</MenuItem>
                    <MenuItem value="ready_to_ship">Ready to Ship</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="in_transit">In Transit</MenuItem>
                    <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="failed_delivery">Failed Delivery</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <CircularProgress />
                </div>
              ) : shipments.length === 0 ? (
                <Alert severity="info">No shipments found</Alert>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow className="bg-gray-50">
                          <TableCell>Shipment #</TableCell>
                          <TableCell>Tracking #</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Expected Delivery</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {shipments.map((shipment) => (
                          <TableRow key={shipment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{shipment.shipment_number}</TableCell>
                            <TableCell>{shipment.tracking_number || '-'}</TableCell>
                            <TableCell>
                              {shipment.salesOrder?.customer?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <ShipmentStatusBadge status={shipment.status} />
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(shipment.expected_delivery_date),
                                'MMM dd, yyyy'
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(shipment.created_at), 'MMM dd, HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  setSelectedShipment(shipment);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                color="primary"
                                onClick={() => {
                                  setSelectedShipment(shipment);
                                  setStatusUpdateDialogOpen(true);
                                }}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <div className="flex justify-center mt-4">
                    <Pagination
                      count={Math.ceil((shipments.length || 0) / PAGE_SIZE)}
                      page={page}
                      onChange={(e, newPage) => setPage(newPage)}
                    />
                  </div>
                </>
              )}
            </div>
          </TabPanel>

          {/* Tab 2: Ready Orders */}
          <TabPanel value={tabIndex} index={1}>
            <div className="space-y-4">
              {readyOrders.length === 0 ? (
                <Alert severity="info">No production orders ready for shipment</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell>Order #</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Completed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {readyOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {order.production_number}
                          </TableCell>
                          <TableCell>{order.product_name}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.customer_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                              size="small"
                              variant="outlined"
                              color={
                                order.priority === 'urgent'
                                  ? 'error'
                                  : order.priority === 'high'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.completed_at), 'MMM dd, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </TabPanel>

          {/* Tab 3: Active Tracking */}
          <TabPanel value={tabIndex} index={2}>
            <div className="space-y-4">
              {shipments
                .filter(
                  (s) =>
                    ['shipped', 'in_transit', 'out_for_delivery'].includes(s.status)
                )
                .map((shipment) => (
                  <Card key={shipment.id} className="mb-4">
                    <CardContent>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {shipment.shipment_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {shipment.salesOrder?.customer?.name}
                          </p>
                        </div>
                        <ShipmentStatusBadge status={shipment.status} size="lg" />
                      </div>
                      <ShipmentTimeline
                        updates={shipment.trackingUpdates || []}
                        status={shipment.status}
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabPanel>

          {/* Tab 4: Reports */}
          <TabPanel value={tabIndex} index={3}>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">On Time Delivery</p>
                      <p className="text-2xl font-bold text-blue-600">95.2%</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Delivered This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.totals?.completed || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Failed Attempts</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.totals?.failed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Shipment Details</DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Shipment Number</p>
                <p className="font-semibold">{selectedShipment.shipment_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <ShipmentStatusBadge status={selectedShipment.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-semibold">{selectedShipment.tracking_number || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Courier</p>
                <p className="font-semibold">{selectedShipment.courier_company || 'N/A'}</p>
              </div>
              {selectedShipment.trackingUpdates && (
                <ShipmentTimeline
                  updates={selectedShipment.trackingUpdates}
                  status={selectedShipment.status}
                />
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialogOpen} onClose={() => setStatusUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Current Status</p>
                <p className="text-gray-600 capitalize">{selectedShipment.status.replace(/_/g, ' ')}</p>
              </div>

              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="New Status"
                >
                  {selectedShipment.status === 'preparing' && (
                    <>
                      <MenuItem value="packed">Packed</MenuItem>
                      <MenuItem value="ready_to_ship">Ready to Ship</MenuItem>
                    </>
                  )}
                  {selectedShipment.status === 'packed' && (
                    <>
                      <MenuItem value="ready_to_ship">Ready to Ship</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                    </>
                  )}
                  {selectedShipment.status === 'ready_to_ship' && (
                    <MenuItem value="shipped">Shipped</MenuItem>
                  )}
                  {selectedShipment.status === 'shipped' && (
                    <MenuItem value="in_transit">In Transit</MenuItem>
                  )}
                  {selectedShipment.status === 'in_transit' && (
                    <>
                      <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                      <MenuItem value="failed_delivery">Failed Delivery</MenuItem>
                    </>
                  )}
                  {selectedShipment.status === 'out_for_delivery' && (
                    <>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="failed_delivery">Failed Delivery</MenuItem>
                    </>
                  )}
                  {selectedShipment.status === 'failed_delivery' && (
                    <>
                      <MenuItem value="in_transit">In Transit (Retry)</MenuItem>
                      <MenuItem value="returned">Returned</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                variant="outlined"
                size="small"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={loading || !newStatus}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShipmentManagementPage;