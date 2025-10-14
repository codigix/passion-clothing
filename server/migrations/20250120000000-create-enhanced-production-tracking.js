'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create stage_operations table
    await queryInterface.createTable('stage_operations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_stages',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      operation_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      operation_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed'),
        defaultValue: 'pending'
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      quantity_processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      quantity_approved: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      quantity_rejected: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      machine_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Machine or equipment used'
      },
      is_outsourced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors',
          key: 'id'
        }
      },
      challan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'challans',
          key: 'id'
        }
      },
      return_challan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'challans',
          key: 'id'
        }
      },
      outsource_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      photos: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for stage_operations
    await queryInterface.addIndex('stage_operations', ['production_stage_id']);
    await queryInterface.addIndex('stage_operations', ['status']);
    await queryInterface.addIndex('stage_operations', ['assigned_to']);
    await queryInterface.addIndex('stage_operations', ['operation_order']);
    await queryInterface.addIndex('stage_operations', ['is_outsourced']);
    await queryInterface.addIndex('stage_operations', ['vendor_id']);

    // Extend production_stages with planning fields
    await queryInterface.addColumn('production_stages', 'planned_start', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Scheduled start date/time for the stage'
    });

    await queryInterface.addColumn('production_stages', 'planned_end', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Scheduled end date/time for the stage'
    });

    await queryInterface.addIndex('production_stages', ['planned_start'], {
      name: 'idx_production_stages_planned_start'
    });

    await queryInterface.addIndex('production_stages', ['planned_end'], {
      name: 'idx_production_stages_planned_end'
    });

    // Create outsourcing_jobs table
    await queryInterface.createTable('outsourcing_jobs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_orders',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_stages',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      stage_operation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stage_operations',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      job_type: {
        type: Sequelize.ENUM('printing', 'embroidery'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'outward_issued', 'in_progress', 'returned', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      total_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      expected_dispatch_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expected_return_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_return_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      outward_challan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'challans',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      outward_dispatched_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      inward_challan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'challans',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      inward_received_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      final_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('outsourcing_jobs', ['production_order_id'], {
      name: 'idx_outsourcing_jobs_order'
    });
    await queryInterface.addIndex('outsourcing_jobs', ['production_stage_id'], {
      name: 'idx_outsourcing_jobs_stage'
    });
    await queryInterface.addIndex('outsourcing_jobs', ['vendor_id'], {
      name: 'idx_outsourcing_jobs_vendor'
    });
    await queryInterface.addIndex('outsourcing_jobs', ['status'], {
      name: 'idx_outsourcing_jobs_status'
    });
    await queryInterface.addIndex('outsourcing_jobs', ['job_type'], {
      name: 'idx_outsourcing_jobs_type'
    });
    await queryInterface.addIndex('outsourcing_jobs', ['expected_return_date'], {
      name: 'idx_outsourcing_jobs_expected_return'
    });

    await queryInterface.addIndex('outsourcing_jobs', ['status', 'expected_return_date'], {
      name: 'idx_outsourcing_jobs_status_return'
    });

    // Create material_consumptions table
    await queryInterface.createTable('material_consumptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'production_orders',
          key: 'id'
        }
      },
      production_stage_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'production_stages',
          key: 'id'
        }
      },
      stage_operation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stage_operations',
          key: 'id'
        }
      },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        }
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      quantity_used: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      consumed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      allocated_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Total quantity originally allocated to production'
      },
      leftover_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Quantity remaining after production use'
      },
      reconciled_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Quantity confirmed during reconciliation'
      },
      reconciliation_status: {
        type: Sequelize.ENUM('pending', 'partial', 'complete'),
        defaultValue: 'pending'
      },
      reconciliation_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reconciliation_completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reconciliation_completed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      consumed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for material_consumptions
    await queryInterface.addIndex('material_consumptions', ['production_order_id']);
    await queryInterface.addIndex('material_consumptions', ['production_stage_id']);
    await queryInterface.addIndex('material_consumptions', ['stage_operation_id']);
    await queryInterface.addIndex('material_consumptions', ['inventory_id']);
    await queryInterface.addIndex('material_consumptions', ['barcode']);
    await queryInterface.addIndex('material_consumptions', ['consumed_at']);
    await queryInterface.addIndex('material_consumptions', ['reconciliation_status'], {
      name: 'idx_material_consumptions_reconciliation_status'
    });

    // Create production_completions table
    await queryInterface.createTable('production_completions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      production_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'production_orders',
          key: 'id'
        }
      },
      required_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      produced_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      approved_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rejected_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      all_quantity_received: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      quantity_shortfall_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      all_materials_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      remaining_materials: {
        type: Sequelize.JSON,
        allowNull: true
      },
      material_returned_to_inventory: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      material_reconciliation_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      material_reconciliation_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reconciliation_completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reconciliation_completed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      reconciliation_audit: {
        type: Sequelize.JSON,
        allowNull: true
      },
      total_duration_hours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      planned_duration_hours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      efficiency_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      completed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      quality_passed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      quality_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ready_for_shipment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sent_to_shipment_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'shipments',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for production_completions
    await queryInterface.addIndex('production_completions', ['production_order_id'], { unique: true });
    await queryInterface.addIndex('production_completions', ['completed_at']);
    await queryInterface.addIndex('production_completions', ['ready_for_shipment']);
    await queryInterface.addIndex('production_completions', ['shipment_id']);
    await queryInterface.addIndex('production_completions', ['reconciliation_completed_at'], {
      name: 'idx_production_completions_reconciliation_completed_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('production_completions', 'idx_production_completions_reconciliation_completed_at');
    await queryInterface.dropTable('production_completions');
    await queryInterface.removeIndex('material_consumptions', 'idx_material_consumptions_reconciliation_status');
    await queryInterface.dropTable('material_consumptions');
    await queryInterface.removeIndex('outsourcing_jobs', 'idx_outsourcing_jobs_status_return');
    await queryInterface.dropTable('outsourcing_jobs');
    await queryInterface.removeIndex('production_stages', 'idx_production_stages_planned_end');
    await queryInterface.removeIndex('production_stages', 'idx_production_stages_planned_start');
    await queryInterface.removeColumn('production_stages', 'planned_end');
    await queryInterface.removeColumn('production_stages', 'planned_start');
    await queryInterface.dropTable('stage_operations');
  }
};