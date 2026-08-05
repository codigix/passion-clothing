import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Building,
  Receipt,
  Package,
  Bell,
  Factory,
  Clock,
  Microscope,
  Truck,
  Store,
  DollarSign,
  User,
  Users,
  Shield,
  Settings,
  Scan,
  CheckCircle,
  Send,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Building2,
  Tag,
  MessageSquare,
  Contact,
  CalendarCheck,
  ListChecks,
  StickyNote,
  Activity,
  Ruler,
  Layers,
  Warehouse,
  CalendarClock,
  Scissors,
  Printer,
  ShieldCheck,
  Wind,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import api from '../../utils/api';

/* Icon accent colors according to feedback */
const ICON_ACCENTS = {
  Dashboard: '#4C7AF0',      // Blue
  CRM: '#E23F94',            // Pink
  Merchandising: '#F0913D',  // Orange
  Production: '#3FAE73',     // Green
  Inventory: '#2EA893',      // Cyan / Teal
  Purchase: '#8B5DE0',       // Purple
  Dispatch: '#3B5BC7',       // Indigo
  Accounts: '#EAB308',       // Yellow
  'Reports & Analytics': '#EC5B57', // Red / Magenta
  Settings: '#94A3B8',       // Gray
  'Client Requirements': '#F0913D',
  Quotations: '#8B5DE0',
  'Sales Orders': '#4C7AF0',
  'Create Order': '#2EA893',
  'Virtual Try-On': '#E23F94',
};

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openStockModal } = useStore();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingGRNCount, setPendingGRNCount] = useState(0);
  const [pendingMRNCount, setPendingMRNCount] = useState(0);

  useEffect(() => {
    if (user?.department === 'procurement' || user?.department === 'admin') {
      fetchPendingApprovalsCount();
      const interval = setInterval(fetchPendingApprovalsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.department]);

  useEffect(() => {
    if (user?.department === 'inventory' || user?.department === 'admin') {
      fetchPendingGRNCount();
      fetchPendingMRNCount();
      const interval = setInterval(() => {
        fetchPendingGRNCount();
        fetchPendingMRNCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.department]);

  const fetchPendingApprovalsCount = async () => {
    try {
      const response = await api.get('/procurement/pos', {
        params: { status: 'pending_approval' }
      });
      const pos = response.data.purchaseOrders || response.data.pos || [];
      setPendingApprovalsCount(pos.length);
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
    }
  };

  const fetchPendingGRNCount = async () => {
    try {
      const response = await api.get('/inventory/grn-requests');
      const requests = response.data.requests || [];
      setPendingGRNCount(requests.length);
    } catch (error) {
      console.error('Error fetching pending GRN count:', error);
    }
  };

  const fetchPendingMRNCount = async () => {
    try {
      const response = await api.get('/project-material-requests?status=pending_inventory_review');
      const requests = response.data.requests || response.data.data || [];
      setPendingMRNCount(requests.length);
    } catch (error) {
      console.error('Error fetching pending MRN count:', error);
    }
  };

  /* Categorized Section Headings Layout */
  const menuSections = [
    {
      title: 'GENERAL',
      items: [
        { text: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/sales' },
      ]
    },
    {
      title: 'SALES & OPERATIONAL CRM',
      items: [
        {
          text: 'CRM',
          icon: <Users size={17} />,
          path: '/sales/crm',
          children: [
            { text: 'Overview', icon: <LayoutDashboard size={14} />, path: '/sales/crm?view=overview' },
            { text: 'Customers', icon: <Users size={14} />, path: '/sales/crm?view=customers' },
            { text: 'Buyers', icon: <Building2 size={14} />, path: '/sales/crm?view=buyers' },
            { text: 'Brands', icon: <Tag size={14} />, path: '/sales/crm?view=brands' },
            { text: 'Enquiries', icon: <MessageSquare size={14} />, path: '/sales/crm?view=enquiries' },
            { text: 'Contacts', icon: <Contact size={14} />, path: '/sales/crm?view=contacts' },
            { text: 'Meetings', icon: <CalendarCheck size={14} />, path: '/sales/crm?view=meetings' },
            { text: 'Tasks', icon: <ListChecks size={14} />, path: '/sales/crm?view=tasks' },
            { text: 'Notes', icon: <StickyNote size={14} />, path: '/sales/crm?view=notes' },
            { text: 'Activities', icon: <Activity size={14} />, path: '/sales/crm?view=activities' },
          ]
        },
        { text: 'Client Requirements', icon: <ClipboardList size={17} />, path: '/sales/client-requirements' },
        { text: 'Quotations', icon: <FileText size={17} />, path: '/sales/quotations' },
        { text: 'Sales Orders', icon: <ShoppingCart size={17} />, path: '/sales/orders' },
        { text: 'Create Order', icon: <FileText size={17} />, path: '/sales/orders/create' },
        { text: 'Virtual Try-On', icon: <Sparkles size={17} />, path: '/sales/virtual-try-on' },
        {
          text: 'Merchandising',
          icon: <FileText size={17} />,
          path: '/sales/client-requirements',
          children: [
            { text: 'Styles', icon: <Tag size={14} />, path: '/sales/client-requirements' },
            { text: 'Tech Pack', icon: <Ruler size={14} />, path: '/sales/client-requirements' },
            { text: 'Sample Development', icon: <Sparkles size={14} />, path: '/samples' },
            { text: 'Costing', icon: <Layers size={14} />, path: '/sales/quotations' },
            { text: 'Buyer PO', icon: <ShoppingCart size={14} />, path: '/sales/orders' },
          ]
        },
        {
          text: 'Production',
          icon: <Scissors size={17} />,
          path: '/manufacturing',
          children: [
            { text: 'Production Planning', icon: <CalendarClock size={14} />, path: '/manufacturing' },
            { text: 'Cutting', icon: <Scissors size={14} />, path: '/manufacturing/orders' },
            { text: 'Sewing', icon: <Layers size={14} />, path: '/manufacturing/tracking' },
            { text: 'Printing & Embroidery', icon: <Printer size={14} />, path: '/manufacturing/tracking' },
            { text: 'Finishing', icon: <Wind size={14} />, path: '/manufacturing/tracking' },
            { text: 'Quality Control', icon: <ShieldCheck size={14} />, path: '/manufacturing/quality' },
            { text: 'Packing', icon: <Package size={14} />, path: '/manufacturing/tracking' },
          ]
        },
        {
          text: 'Inventory',
          icon: <Warehouse size={17} />,
          path: '/inventory',
          children: [
            { text: 'Fabric Store', icon: <Layers size={14} />, path: '/inventory' },
            { text: 'Trims Store', icon: <Tag size={14} />, path: '/inventory' },
            { text: 'Accessories', icon: <Package size={14} />, path: '/inventory' },
            { text: 'Warehouse', icon: <Warehouse size={14} />, path: '/inventory/allocation' },
            { text: 'Stock Ledger', icon: <FileText size={14} />, path: '/inventory/stock' },
          ]
        },
        {
          text: 'Purchase',
          icon: <ShoppingCart size={17} />,
          path: '/procurement',
          children: [
            { text: 'RFQ', icon: <FileText size={14} />, path: '/procurement/material-requests' },
            { text: 'Suppliers', icon: <Building2 size={14} />, path: '/procurement/vendors' },
            { text: 'Purchase Orders', icon: <ShoppingCart size={14} />, path: '/procurement/purchase-orders' },
            { text: 'GRN', icon: <Receipt size={14} />, path: '/inventory/grn' },
          ]
        },
        { text: 'Dispatch', icon: <Truck size={17} />, path: '/shipment' },
      ]
    },
    {
      title: 'FINANCE & ANALYTICS',
      items: [
        { text: 'Accounts', icon: <Receipt size={17} />, path: '/finance' },
        { text: 'Reports & Analytics', icon: <BarChart3 size={17} />, path: '/sales/reports' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { text: 'Settings', icon: <Settings size={17} />, path: '/admin/config' },
      ]
    }
  ];

  const handleNavigation = (path) => {
    if (path === '/store/stock' && user?.department === 'store' && openStockModal) {
      openStockModal();
      return;
    }
    navigate(path);
  };

  const [expandedGroups, setExpandedGroups] = useState({
    CRM: true,
    Merchandising: false,
    Production: false,
    Inventory: false,
    Purchase: false,
  });

  const toggleExpandedGroup = (groupText) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupText]: !prev[groupText],
    }));
  };

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <div
      className={`fixed left-0 top-0 h-full text-white transition-all duration-300 ease-in-out z-40 ${
        open ? 'w-[230px]' : 'w-20'
      }`}
      style={{
        background: 'linear-gradient(180deg, #4A1A7A 0%, #32145A 45%, #1F0B3B 100%)',
        boxShadow: '6px 0 30px rgba(25, 10, 50, 0.45)',
      }}
    >
      {/* Custom thin scrollbar stylesheet */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
        .sidebar-item-hover {
          transition: transform 200ms ease, background 200ms ease;
        }
        .sidebar-item-hover:hover {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.08);
        }
        .submenu-collapse {
          transition: max-height 280ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="flex flex-col h-full relative backdrop-blur-md bg-white/[0.01]">
        
        {/* Header with Enterprise Badges */}
        <div className={`flex items-center ${open ? 'px-4 py-4 justify-between' : 'justify-center p-3'} border-b border-white/10`}>
          {open && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-purple-500/30">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-white tracking-wide">Passion ERP</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/30 text-pink-200 border border-pink-400/30">v2.0</span>
                </div>
                <p className="text-[9.5px] font-semibold text-purple-200/60 uppercase tracking-wider">Enterprise Cloud</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll py-2 px-2.5 space-y-4">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {open && (
                <div className="px-2.5 pt-1.5 pb-1">
                  <p className="text-[9.5px] font-extrabold text-purple-200/50 uppercase tracking-widest">{section.title}</p>
                </div>
              )}

              {section.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isItemActive = isActive(item.path);
                const isExpanded = expandedGroups[item.text];
                const accentColor = ICON_ACCENTS[item.text] || '#94A3B8';

                return (
                  <div key={item.text} className="space-y-1">
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpandedGroup(item.text);
                          handleNavigation(item.path);
                        } else {
                          handleNavigation(item.path);
                        }
                      }}
                      className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] sidebar-item-hover relative ${
                        isItemActive
                          ? 'text-white font-bold shadow-md shadow-purple-900/40'
                          : 'text-purple-100/75 hover:text-white'
                      }`}
                      style={{
                        background: isItemActive
                          ? 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)'
                          : 'transparent',
                      }}
                    >
                      {/* 2px glowing left indicator */}
                      {isItemActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-white rounded-r shadow-[0_0_8px_#ffffff]"></div>
                      )}

                      {/* Icon with specific accent color */}
                      <span
                        className={`flex-shrink-0 transition-opacity duration-150 ${
                          isItemActive ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
                        }`}
                        style={{ color: isItemActive ? '#FFFFFF' : accentColor }}
                      >
                        {item.icon}
                      </span>

                      {open && (
                        <span className="text-xs truncate flex-1 text-left tracking-wide font-medium">
                          {item.text}
                        </span>
                      )}

                      {hasChildren && open && (
                        <span className="text-purple-200/50 group-hover:text-white transition-colors">
                          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </span>
                      )}
                    </button>

                    {/* Submenu Tree Hierarchy */}
                    {hasChildren && isExpanded && open && (
                      <div className="ml-4 pl-2.5 border-l border-purple-400/20 space-y-1 py-1">
                        {item.children.map((sub) => {
                          const isSubActive = isActive(sub.path);
                          return (
                            <button
                              key={sub.text}
                              onClick={() => handleNavigation(sub.path)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all ${
                                isSubActive
                                  ? 'bg-purple-500/30 text-white font-bold border-l-2 border-pink-400 pl-2'
                                  : 'text-purple-200/70 hover:bg-white/[0.08] hover:text-white hover:translate-x-1'
                              }`}
                            >
                              <span className="text-[10px] text-purple-300/60">├</span>
                              <span className="opacity-80" style={{ color: accentColor }}>{sub.icon}</span>
                              <span className="truncate">{sub.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Workspace Footer */}
        <div className="border-t border-white/10 p-2.5 space-y-2">
          {open && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04]">
              <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'sanumote'}</p>
                <p className="text-[10px] text-purple-200/60 truncate capitalize">
                  {typeof user?.role === 'string' ? user.role : user?.role?.name || user?.department || 'Administrator'}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-pink-200 hover:bg-pink-500/20 hover:text-white border border-white/10"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {open && <span className="text-xs font-bold">Logout</span>}
          </button>
        </div>

      </div>
    </div>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default Sidebar;