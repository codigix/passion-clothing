import React from 'react';
import { FaCheckCircle, FaCircle } from 'react-icons/fa';

/**
 * StatusProgression Component
 * 
 * A visual component showing the progression of an order through different stages.
 * Displays completed, current, and upcoming stages with connecting lines.
 * 
 * @param {array} stages - Array of stage objects with {key, label, icon}
 * @param {string} currentStatus - Current status of the order
 * @param {string} type - Type of progression ('horizontal' or 'vertical')
 * @param {string} className - Additional CSS classes
 */
const StatusProgression = ({ 
  stages = [], 
  currentStatus,
  type = 'horizontal',
  className = '' 
}) => {
  const currentIndex = stages.findIndex(s => s.key === currentStatus);
  
  const getStageState = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'upcoming';
  };
  
  const getStageStyles = (state) => {
    const styles = {
      completed: {
        circle: 'bg-green-500 text-white border-green-500',
        line: 'bg-green-500',
        text: 'text-green-700 font-semibold',
        icon: 'text-white'
      },
      active: {
        circle: 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-100 animate-pulse',
        line: 'bg-gray-300',
        text: 'text-blue-700 font-semibold',
        icon: 'text-white'
      },
      upcoming: {
        circle: 'bg-white text-gray-400 border-gray-300',
        line: 'bg-gray-300',
        text: 'text-gray-500',
        icon: 'text-gray-400'
      }
    };
    return styles[state];
  };
  
  if (type === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {stages.map((stage, index) => {
          const state = getStageState(index);
          const styles = getStageStyles(state);
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.key} className="flex items-start gap-3">
              {/* Circle and Line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 ${styles.circle}
                `}>
                  {state === 'completed' ? (
                    <FaCheckCircle className="w-5 h-5" />
                  ) : (
                    <div className={styles.icon}>
                      {stage.icon || <FaCircle className="w-3 h-3" />}
                    </div>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-12 ${styles.line} transition-all duration-300`} />
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1 pt-2">
                <p className={`text-sm ${styles.text} transition-all duration-300`}>
                  {stage.label}
                </p>
                {stage.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Horizontal layout (default)
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const state = getStageState(index);
          const styles = getStageStyles(state);
          const isLast = index === stages.length - 1;
          
          return (
            <React.Fragment key={stage.key}>
              {/* Stage */}
              <div className="flex flex-col items-center relative z-10">
                {/* Circle */}
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 bg-white ${styles.circle}
                `}>
                  {state === 'completed' ? (
                    <FaCheckCircle className="w-5 h-5" />
                  ) : (
                    <div className={styles.icon}>
                      {stage.icon || <FaCircle className="w-3 h-3" />}
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <p className={`text-xs mt-2 text-center max-w-[80px] ${styles.text} transition-all duration-300`}>
                  {stage.label}
                </p>
              </div>
              
              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative" style={{ top: '-20px' }}>
                  <div className={`h-full ${styles.line} transition-all duration-300`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Helper function to create stage objects for sales orders
 */
export const getSalesOrderStages = () => [
  { key: 'draft', label: 'Draft' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'materials_received', label: 'Materials' },
  { key: 'in_production', label: 'Production' },
  { key: 'completed', label: 'Completed' },
  { key: 'shipped', label: 'Shipped' }
];

/**
 * Helper function to create stage objects for purchase orders
 */
export const getPurchaseOrderStages = () => [
  { key: 'draft', label: 'Draft' },
  { key: 'pending_approval', label: 'Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'sent', label: 'Sent' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'received', label: 'Received' },
  { key: 'completed', label: 'Completed' }
];

/**
 * Helper function to create stage objects for production orders
 */
export const getProductionOrderStages = () => [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'completed', label: 'Completed' }
];

export default StatusProgression;