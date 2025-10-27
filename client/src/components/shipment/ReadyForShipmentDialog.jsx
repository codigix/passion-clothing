import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { CheckCircle2, AlertCircle, Truck, Package, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ReadyForShipmentDialog = ({
  open,
  onClose,
  productionOrder,
  onSuccess = () => {}
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [activeStep, setActiveStep] = useState(0);

  // Calculate expected delivery date based on shipping method
  const shippingMethods = {
    'same_day': { label: 'Same Day', days: 0, description: 'Today or next business day' },
    'overnight': { label: 'Overnight', days: 1, description: '1 business day' },
    'express': { label: 'Express', days: 3, description: '3 business days' },
    'standard': { label: 'Standard', days: 7, description: '5-7 business days' }
  };

  const expectedDeliveryDate = useMemo(() => {
    const today = new Date();
    const days = shippingMethods[shippingMethod]?.days || 7;
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  }, [shippingMethod]);

  const steps = [
    'Confirm Order',
    'Add Notes',
    'Review & Submit'
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!productionOrder?.id) {
      toast.error('Production order not found');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/manufacturing/orders/${productionOrder.id}/ready-for-shipment`,
        {
          notes: notes || undefined,
          special_instructions: specialInstructions || undefined,
          shipping_method: shippingMethod,
          expected_delivery_date: expectedDeliveryDate
        }
      );

      toast.success(`Shipment ${response.data.shipment.shipment_number} created successfully!`);
      onSuccess(response.data);
      onClose();
      setNotes('');
      setSpecialInstructions('');
      setShippingMethod('standard');
      setActiveStep(0);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to mark order as ready for shipment';
      toast.error(message);
      console.error('Ready for shipment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!productionOrder) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6" />
          Ready for Shipment
        </div>
      </DialogTitle>

      <DialogContent className="mt-4">
        {/* Stepper */}
        <Stepper activeStep={activeStep} className="mb-6">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box className="space-y-4">
            <Typography variant="h6" className="font-semibold">
              Confirm Order Details
            </Typography>

            <Alert severity="info" icon={<AlertCircle className="w-5 h-5" />}>
              Once marked as ready for shipment, the order will enter the shipping workflow and
              cannot be edited.
            </Alert>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Order Number:</span>
                <span className="font-semibold">{productionOrder.production_number}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="font-semibold">{productionOrder.quantity} units</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Priority:</span>
                <span className="font-semibold capitalize">{productionOrder.priority}</span>
              </div>

              {productionOrder.salesOrder?.customer?.name && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-semibold">
                    {productionOrder.salesOrder.customer.name}
                  </span>
                </div>
              )}
            </div>

            <Divider className="my-4" />

            <Typography variant="subtitle2" className="font-semibold">
              What happens next:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon className="min-w-max pr-3">
                  <Package className="w-5 h-5 text-blue-600" />
                </ListItemIcon>
                <ListItemText
                  primary="1. Shipment Created"
                  secondary="A shipment record is created"
                  primaryTypographyProps={{ className: 'text-sm font-medium' }}
                  secondaryTypographyProps={{ className: 'text-xs' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon className="min-w-max pr-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                </ListItemIcon>
                <ListItemText
                  primary="2. Quality Review"
                  secondary="Final QC check performed"
                  primaryTypographyProps={{ className: 'text-sm font-medium' }}
                  secondaryTypographyProps={{ className: 'text-xs' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon className="min-w-max pr-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </ListItemIcon>
                <ListItemText
                  primary="3. Warehouse Processing"
                  secondary="Packing and labeling"
                  primaryTypographyProps={{ className: 'text-sm font-medium' }}
                  secondaryTypographyProps={{ className: 'text-xs' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon className="min-w-max pr-3">
                  <Truck className="w-5 h-5 text-orange-600" />
                </ListItemIcon>
                <ListItemText
                  primary="4. Dispatch"
                  secondary="Courier picks up and delivers"
                  primaryTypographyProps={{ className: 'text-sm font-medium' }}
                  secondaryTypographyProps={{ className: 'text-xs' }}
                />
              </ListItem>
            </List>
          </Box>
        )}

        {activeStep === 1 && (
          <Box className="space-y-4">
            <Typography variant="h6" className="font-semibold">
              Shipping Details & Notes
            </Typography>

            {/* Shipping Method Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Shipping Method</InputLabel>
              <Select
                value={shippingMethod}
                label="Shipping Method"
                onChange={(e) => setShippingMethod(e.target.value)}
              >
                <MenuItem value="same_day">
                  Same Day - Today or next business day
                </MenuItem>
                <MenuItem value="overnight">
                  Overnight - 1 business day
                </MenuItem>
                <MenuItem value="express">
                  Express - 3 business days
                </MenuItem>
                <MenuItem value="standard">
                  Standard - 5-7 business days
                </MenuItem>
              </Select>
            </FormControl>

            {/* Expected Delivery Date Display */}
            <Box className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Typography variant="caption" className="text-blue-600 font-semibold">
                📅 EXPECTED DELIVERY DATE
              </Typography>
              <Typography variant="h6" className="text-blue-900 font-bold mt-1">
                {expectedDeliveryDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>

            <Divider />

            <TextField
              label="Delivery Notes"
              multiline
              rows={4}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Handle with care, Fragile items, Special delivery instructions..."
              variant="outlined"
              size="small"
            />

            <TextField
              label="Special Instructions"
              multiline
              rows={3}
              fullWidth
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g., Signature required, Call before delivery, Leave at door..."
              variant="outlined"
              size="small"
            />

            <Alert severity="info" icon={<AlertCircle className="w-5 h-5" />}>
              These notes will be included with the shipment and visible to the courier and customer.
            </Alert>
          </Box>
        )}

        {activeStep === 2 && (
          <Box className="space-y-4">
            <Typography variant="h6" className="font-semibold">
              Review Before Submission
            </Typography>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Production Complete</p>
                  <p className="text-sm text-green-700">
                    Order {productionOrder.production_number} has passed all production stages
                  </p>
                </div>
              </div>

              <Divider />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-medium">Production → Shipment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{productionOrder.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Method:</span>
                  <span className="font-medium capitalize">{shippingMethods[shippingMethod]?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">
                    {expectedDeliveryDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Delivery Notes:</span>
                  <span className="font-medium">{notes ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <Alert severity="warning" icon={<AlertCircle className="w-5 h-5" />}>
              Please confirm that all quality checks are complete and the order is ready for
              shipment. This action cannot be reversed.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="p-4 border-t border-gray-200">
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating Shipment...' : 'Confirm & Create Shipment'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReadyForShipmentDialog;