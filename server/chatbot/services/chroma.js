const { ChromaClient } = require('chromadb');
require('dotenv').config();

let client = null;
let collection = null;
let isChromaEnabled = false;

// High-quality ERP SOP Knowledge Base for RAG search
const SOP_KNOWLEDGE_BASE = [
  {
    id: 'rfq-sop-1',
    category: 'RFQ Process',
    text: 'Request for Quotation (RFQ) Process SOP: RFQs are used to request price quotes from vendors for raw materials. To create an RFQ, navigate to Procurement -> RFQ, select "Create RFQ", fill in the materials list, select target vendors, and submit. The system sends automatic notifications to vendors.'
  },
  {
    id: 'quotation-sop-1',
    category: 'Quotation Process',
    text: 'Quotation Process SOP: Quotations are client-facing price estimates. To generate a quotation, navigate to Sales -> Quotations, click "New Quotation", input the Client Requirement reference number, adjust raw material margins, select terms, and click "Submit". Once submitted, a quotation can be printed or emailed as a PDF.'
  },
  {
    id: 'customer-po-sop-1',
    category: 'Customer PO',
    text: 'Customer Purchase Order (PO) SOP: Once a customer approves a quotation, they issue a Purchase Order. To register a Customer PO in the ERP, navigate to Sales -> Sales Orders, click "Create Sales Order", choose the customer, and upload the customer PO copy. Fill in prices and required shipment dates.'
  },
  {
    id: 'sales-order-sop-1',
    category: 'Sales Order',
    text: 'Sales Order SOP: A Sales Order (SO) starts the production and procurement flow. Navigate to Sales -> Sales Orders to view all orders. Drafting an SO requires a product, customer details, quantity, and delivery date. After review, it must be approved by the Sales Manager to release it to manufacturing and inventory.'
  },
  {
    id: 'drawing-master-sop-1',
    category: 'Drawing Master',
    text: 'Drawing Master & Design SOP: Before manufacturing can begin, drawings/specifications must be updated. Design files and blueprints are uploaded in Sales -> Client Requirements or under specific Product design tabs. The engineering department reviews the drawings to confirm technical parameters.'
  },
  {
    id: 'bom-creation-sop-1',
    category: 'BOM Creation',
    text: 'Bill of Materials (BOM) SOP: A BOM defines all raw materials, components, and quantities required to produce one unit of a finished product. To create a BOM, navigate to Procurement -> Bill of Materials, select the linked Sales Order, choose the product, specify material requirements (e.g. fabric yards, buttons, zippers), and click "Save". BOMs require supervisor approval.'
  },
  {
    id: 'routing-sop-1',
    category: 'Routing',
    text: 'Routing and Stage Scheduling SOP: Routing describes the sequence of production stages a product goes through (e.g. cutting, stitching, quality checking, packaging). In the Manufacturing dashboard, select "Production Tracking", define the operations list, and assign operators or teams to specific operations.'
  },
  {
    id: 'production-sop-1',
    category: 'Production',
    text: 'Production Process SOP: Work orders are issued for approved Sales Orders. Operators log their work, update completed quantities, and note rejections in the Manufacturing Dashboard. The stages transition from Cutting -> Stitching -> QC -> Packaging.'
  },
  {
    id: 'inventory-sop-1',
    category: 'Inventory',
    text: 'Inventory Management SOP: Raw materials and finished products are tracked in the Stock Management module. Stock levels are automatically updated during Goods Receipt (GRN) and Material Consumption. Low stock alerts triggers when inventory falls below minimum safety limits.'
  },
  {
    id: 'purchase-sop-1',
    category: 'Purchase',
    text: 'Purchase Order (PO) SOP: Procurement issues POs to vendors. Navigate to Procurement -> Purchase Orders, click "Create PO", select the vendor, select items from the BOM or material requests, fill in delivery date, and save. POs must go through the multi-stage approval flow before issuance.'
  },
  {
    id: 'qc-sop-1',
    category: 'QC',
    text: 'Quality Control (QC) SOP: Goods incoming from vendors or finished from production must pass QC. Inspectors test items against drawings and tolerances. A QC report is generated, marking quantities as Accepted, Rework, or Rejected.'
  },
  {
    id: 'dispatch-sop-1',
    category: 'Dispatch',
    text: 'Dispatch & Shipment SOP: Finished goods are packaged and assigned to Courier Agents. Navigate to Shipment -> Create Shipment, select the completed Sales Order, choose a courier agent, generate a barcode and challan, and mark the order as Dispatched.'
  },
  {
    id: 'accounts-sop-1',
    category: 'Accounts',
    text: 'Accounts & Finance SOP: Sales invoices are raised when goods are dispatched. Vendor invoices are processed upon successful GRN. In the Finance Dashboard, managers track pending invoices, payment receipts, and balance reports.'
  },
  {
    id: 'sop-company-sop-1',
    category: 'Company SOP',
    text: 'Company Standard Operating Procedures (SOP): All operations must be logged in the ERP. Permissions are strictly department-based (e.g. sales can only edit requirements/quotations, store can only perform GRNs/dispatches).'
  },
  {
    id: 'user-manual-sop-1',
    category: 'User Manual',
    text: 'ERP User Manual: The sidebar menu contains links to all modules. Use the DevTools page to verify system configurations. Profile settings can be adjusted under /profile. Notifications alerts are visible in the top header bar.'
  }
];

// Initialize ChromaDB Client
async function initializeChroma() {
  try {
    client = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' });
    
    // Test connection with a short timeout
    const heartbeat = await Promise.race([
      client.heartbeat(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Chroma heartbeat timeout')), 2000))
    ]);

    if (heartbeat) {
      console.log('✅ Connected to ChromaDB Server!');
      isChromaEnabled = true;
      
      // Get or create collection
      collection = await client.getOrCreateCollection({
        name: 'passion_erp_sop',
        metadata: { 'description': 'ERP SOP Manuals and Documentation' }
      });
      
      // Seed collection if empty
      const count = await collection.count();
      if (count === 0) {
        console.log('🌱 Seeding ChromaDB with ERP SOP documentation...');
        const ids = SOP_KNOWLEDGE_BASE.map(doc => doc.id);
        const documents = SOP_KNOWLEDGE_BASE.map(doc => doc.text);
        const metadatas = SOP_KNOWLEDGE_BASE.map(doc => ({ category: doc.category }));
        
        await collection.add({
          ids,
          documents,
          metadatas
        });
        console.log(`✅ Seeded ${ids.length} SOP documents into ChromaDB!`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ ChromaDB Server not available: ${error.message}. Running local search fallback.`);
    isChromaEnabled = false;
  }
}

// Initialize on load
initializeChroma();

/**
 * Perform semantic search on the SOP documentation
 * @param {string} queryText - User's search query
 * @param {number} limit - Max number of records to return
 * @returns {Promise<Array>} Array of matching chunks
 */
async function searchSOPs(queryText, limit = 3) {
  if (isChromaEnabled && collection) {
    try {
      const results = await collection.query({
        queryTexts: [queryText],
        nResults: limit
      });
      
      if (results && results.documents && results.documents[0]) {
        return results.documents[0].map((doc, idx) => ({
          text: doc,
          category: results.metadatas[0][idx]?.category || 'General SOP',
          score: results.distances ? results.distances[0][idx] : 1.0
        }));
      }
    } catch (error) {
      console.error('❌ ChromaDB query error, falling back to local search:', error.message);
    }
  }

  // Fallback Local Search Engine (TF-IDF/Token match overlap)
  return searchLocalDocs(queryText, limit);
}

/**
 * Local overlap similarity search engine (Fallback)
 */
function searchLocalDocs(query, limit) {
  const queryTokens = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2); // Filter short words

  if (queryTokens.length === 0) {
    return SOP_KNOWLEDGE_BASE.slice(0, limit).map(doc => ({
      text: doc.text,
      category: doc.category,
      score: 1.0
    }));
  }

  const scoredDocs = SOP_KNOWLEDGE_BASE.map(doc => {
    const docTextLower = doc.text.toLowerCase();
    let matches = 0;
    
    queryTokens.forEach(token => {
      if (docTextLower.includes(token)) {
        matches++;
      }
    });

    const score = matches / queryTokens.length;
    return {
      text: doc.text,
      category: doc.category,
      score
    };
  });

  // Sort by score descending and return top matches
  return scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = {
  searchSOPs
};
