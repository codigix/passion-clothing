import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users, FileText, Ruler, Layers, ShoppingCart, Warehouse,
  CalendarClock, Scissors, Printer, Wind, Package, Truck, Receipt,
  BarChart3, ChevronDown, ChevronRight, Search, Plus, X, Building2,
  Tag, MessageSquare, Contact, CalendarCheck, ListChecks, StickyNote,
  Activity, MapPin, Globe, Phone, Mail as MailIcon, CreditCard, Edit3,
  ArrowRight, Download, MoreHorizontal, Circle
} from "lucide-react";

/* ---------------------------------------------------------------------
   TOKENS
--------------------------------------------------------------------- */
const C = {
  canvas: "#F5F4FA",
  surface: "#FFFFFF",
  ink: "#26223B",
  inkSoft: "#726E8C",
  inkFaint: "#9C97B3",
  line: "#EAE7F3",
  indigo: "#463C86",
  indigoDeep: "#352C6B",
  indigoSoft: "#EFEDFA",
  magenta: "#E23F94",
  magentaSoft: "#FCE4F0",
};

const SWATCHES = {
  blue: "#4C7AF0",
  pink: "#E23F94",
  orange: "#F0913D",
  purple: "#8B5DE0",
  teal: "#2EA893",
  green: "#3FAE73",
  red: "#EC5B57",
  indigo: "#6357D6",
};

const STATUS_STYLE = {
  Active: { bg: "#E4F5EC", fg: "#2C8C5C" },
  New: { bg: "#E9EEFD", fg: "#3B5BC7" },
  "In Progress": { bg: "#FDF0DD", fg: "#C07A21" },
  Scheduled: { bg: "#E9EEFD", fg: "#3B5BC7" },
  Completed: { bg: "#E4F5EC", fg: "#2C8C5C" },
  Closed: { bg: "#EFEDF5", fg: "#726E8C" },
  Sent: { bg: "#E9EEFD", fg: "#3B5BC7" },
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ---------------------------------------------------------------------
   CRM NAV ENTITIES
--------------------------------------------------------------------- */
const CRM_CHILDREN = [
  { label: "Customers", icon: Users, color: SWATCHES.blue, desc: "Manage all your customers" },
  { label: "Buyers", icon: Building2, color: SWATCHES.orange, desc: "Manage buyers & brands" },
  { label: "Brands", icon: Tag, color: SWATCHES.purple, desc: "Track licensed brands" },
  { label: "Enquiries", icon: MessageSquare, color: SWATCHES.teal, desc: "Manage customer enquiries" },
  { label: "Contacts", icon: Contact, color: SWATCHES.pink, desc: "Manage key contacts" },
  { label: "Meetings", icon: CalendarCheck, color: SWATCHES.green, desc: "Schedule & manage meetings" },
  { label: "Tasks", icon: ListChecks, color: SWATCHES.red, desc: "Manage follow-up tasks" },
  { label: "Notes", icon: StickyNote, color: SWATCHES.indigo, desc: "Add notes & reminders" },
  { label: "Activities", icon: Activity, color: SWATCHES.blue, desc: "View all activities" },
].map((c) => ({ ...c, id: "crm__" + slug(c.label) }));

/* ---------------------------------------------------------------------
   SAMPLE DATA
--------------------------------------------------------------------- */
const CUSTOMERS = [
  { code: "CUST-001", name: "H&M Global", buyer: "H&M", email: "contact@hm.com", phone: "+46 8 796 55 00", country: "Sweden", status: "Active",
    website: "www.hm.com", terms: "30 Days", credit: "$500,000.00",
    billing: ["H&M Global AB", "Master Samuelsgatan 46A", "106 38 Stockholm", "Sweden"],
    shipping: ["H&M Global AB", "Master Samuelsgatan 46A", "106 38 Stockholm", "Sweden"],
    activity: [["Enquiry Created", "20-07-2025"], ["Meeting Scheduled", "19-07-2025"], ["Quotation Sent", "18-07-2025"], ["Order Confirmed", "15-07-2025"]] },
  { code: "CUST-002", name: "Zara SA", buyer: "Zara", email: "info@zara.com", phone: "+34 981 18 00", country: "Spain", status: "Active",
    website: "www.zara.com", terms: "45 Days", credit: "$420,000.00",
    billing: ["Zara SA", "Avenida de la Diputacion", "15142 Arteixo", "Spain"],
    shipping: ["Zara SA — DC2", "Poligono Industrial", "15142 Arteixo", "Spain"],
    activity: [["Sample Approved", "21-07-2025"], ["Costing Sent", "19-07-2025"], ["PO Received", "16-07-2025"]] },
  { code: "CUST-003", name: "NEXT Retail", buyer: "Next", email: "info@next.co.uk", phone: "+44 20 7420 6277", country: "UK", status: "Active",
    website: "www.next.co.uk", terms: "30 Days", credit: "$310,000.00",
    billing: ["Next Retail Ltd", "Desford Road", "Enderby, LE19 4AT", "United Kingdom"],
    shipping: ["Next Distribution", "Desford Road", "Enderby, LE19 4AT", "United Kingdom"],
    activity: [["Tech Pack Reviewed", "20-07-2025"], ["Sales Order Raised", "17-07-2025"]] },
  { code: "CUST-004", name: "Marks & Spencer", buyer: "M&S", email: "contact@mands.com", phone: "+44 20 7857 8000", country: "UK", status: "Active",
    website: "www.marksandspencer.com", terms: "60 Days", credit: "$275,000.00",
    billing: ["M&S plc", "Waterside House", "London, NW1 6XE", "United Kingdom"],
    shipping: ["M&S DC Bradford", "Euroway", "Bradford, BD4 6SG", "United Kingdom"],
    activity: [["Invoice Raised", "18-07-2025"], ["Shipment Dispatched", "14-07-2025"]] },
  { code: "CUST-005", name: "GAP Inc.", buyer: "GAP", email: "info@gap.com", phone: "+1 415 427 2300", country: "USA", status: "Active",
    website: "www.gap.com", terms: "30 Days", credit: "$390,000.00",
    billing: ["Gap Inc.", "2 Folsom Street", "San Francisco, CA 94105", "USA"],
    shipping: ["Gap DC Fresno", "4400 N Golden State", "Fresno, CA 93722", "USA"],
    activity: [["Quotation Accepted", "19-07-2025"], ["Sample Dispatched", "15-07-2025"]] },
];

const ENQUIRIES = [
  { no: "ENQ-2025-001", customer: "H&M Global", subject: "T-Shirt Enquiry", date: "20-07-2025", status: "New" },
  { no: "ENQ-2025-002", customer: "Zara SA", subject: "Shirt Enquiry", date: "19-07-2025", status: "In Progress" },
  { no: "ENQ-2025-003", customer: "NEXT Retail", subject: "Jacket Enquiry", date: "18-07-2025", status: "Closed" },
  { no: "ENQ-2025-004", customer: "Marks & Spencer", subject: "Trouser Enquiry", date: "17-07-2025", status: "New" },
];

const MEETINGS = [
  { title: "Product Discussion", customer: "H&M Global", date: "22-07-2025", time: "10:00 AM", status: "Scheduled" },
  { title: "Price Negotiation", customer: "Zara SA", date: "21-07-2025", time: "02:00 PM", status: "Completed" },
  { title: "Sample Review", customer: "NEXT Retail", date: "20-07-2025", time: "11:00 AM", status: "Scheduled" },
  { title: "Order Confirmation", customer: "Marks & Spencer", date: "19-07-2025", time: "01:00 PM", status: "Completed" },
];

const BUYERS = [
  { code: "BYR-001", name: "H&M", region: "Europe", contact: "Anna Lindqvist", email: "anna.l@hm.com", styles: 34, status: "Active" },
  { code: "BYR-002", name: "Zara", region: "Europe", contact: "Marco Ruiz", email: "marco.r@zara.com", styles: 21, status: "Active" },
  { code: "BYR-003", name: "Next", region: "UK", contact: "Emma Clarke", email: "emma.c@next.co.uk", styles: 18, status: "Active" },
];

const BRANDS = [
  { code: "BRD-001", name: "H&M Basics", category: "Casualwear", licensedTo: "H&M Global", status: "Active" },
  { code: "BRD-002", name: "Zara Woman", category: "Womenswear", licensedTo: "Zara SA", status: "Active" },
  { code: "BRD-003", name: "Next Kids", category: "Childrenswear", licensedTo: "NEXT Retail", status: "Active" },
];

const CONTACTS = [
  { name: "John Smith", designation: "Merchandiser", email: "john.smith@hm.com", phone: "+46 70 123 4587", customer: "H&M Global" },
  { name: "Maria Garcia", designation: "Buyer", email: "maria.g@zara.com", phone: "+34 600 123 456", customer: "Zara SA" },
  { name: "David Brown", designation: "Sourcing Manager", email: "david.b@next.co.uk", phone: "+44 7700 900123", customer: "NEXT Retail" },
];

const TASKS = [
  { task: "Send revised costing to H&M", assignee: "R. Patil", due: "23-07-2025", priority: "High", status: "In Progress" },
  { task: "Follow up sample approval — Zara", assignee: "S. Rao", due: "22-07-2025", priority: "Medium", status: "New" },
  { task: "Confirm ship date — NEXT Retail", assignee: "A. Khan", due: "24-07-2025", priority: "High", status: "New" },
];

const NOTES = [
  { note: "H&M prefers GOTS-certified cotton for SS26 line.", relatedTo: "H&M Global", by: "R. Patil", date: "18-07-2025" },
  { note: "Zara requesting faster sample turnaround (7 days).", relatedTo: "Zara SA", by: "S. Rao", date: "17-07-2025" },
];

const ACTIVITIES = [
  { activity: "Quotation sent", customer: "H&M Global", type: "Merchandising", date: "20-07-2025" },
  { activity: "Sample dispatched", customer: "GAP Inc.", type: "Product Dev", date: "15-07-2025" },
  { activity: "Shipment created", customer: "Marks & Spencer", type: "Dispatch", date: "14-07-2025" },
];

const TABLE_MAP = {
  buyers: { columns: ["Code", "Name", "Region", "Contact Person", "Email", "Active Styles", "Status"], rows: BUYERS.map(b => ({ Code: b.code, Name: b.name, Region: b.region, "Contact Person": b.contact, Email: b.email, "Active Styles": b.styles, Status: b.status })) },
  brands: { columns: ["Code", "Brand", "Category", "Licensed To", "Status"], rows: BRANDS.map(b => ({ Code: b.code, Brand: b.name, Category: b.category, "Licensed To": b.licensedTo, Status: b.status })) },
  enquiries: { columns: ["Enquiry No", "Customer", "Subject", "Date", "Status"], rows: ENQUIRIES.map(e => ({ "Enquiry No": e.no, Customer: e.customer, Subject: e.subject, Date: e.date, Status: e.status })) },
  contacts: { columns: ["Name", "Designation", "Email", "Phone", "Customer"], rows: CONTACTS.map(c => ({ Name: c.name, Designation: c.designation, Email: c.email, Phone: c.phone, Customer: c.customer })) },
  meetings: { columns: ["Meeting Title", "Customer", "Date", "Time", "Status"], rows: MEETINGS.map(m => ({ "Meeting Title": m.title, Customer: m.customer, Date: m.date, Time: m.time, Status: m.status })) },
  tasks: { columns: ["Task", "Assigned To", "Due Date", "Priority", "Status"], rows: TASKS.map(t => ({ Task: t.task, "Assigned To": t.assignee, "Due Date": t.due, Priority: t.priority, Status: t.status })) },
  notes: { columns: ["Note", "Related To", "Created By", "Date"], rows: NOTES.map(n => ({ Note: n.note, "Related To": n.relatedTo, "Created By": n.by, Date: n.date })) },
  activities: { columns: ["Activity", "Customer", "Type", "Date"], rows: ACTIVITIES.map(a => ({ Activity: a.activity, Customer: a.customer, Type: a.type, Date: a.date })) },
};

/* ---------------------------------------------------------------------
   SMALL COMPONENTS
--------------------------------------------------------------------- */
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: C.line, fg: C.inkSoft };
  return (
    <span className="badge" style={{ background: s.bg, color: s.fg }}>
      <Circle size={5} fill={s.fg} stroke="none" />
      {status}
    </span>
  );
}

function IconBadge({ icon: Icon, color, size = 38 }) {
  return (
    <div className="icon-badge" style={{ width: size, height: size, background: `${color}1A`, color }}>
      <Icon size={size * 0.5} strokeWidth={2} />
    </div>
  );
}

/* ---------------------------------------------------------------------
   GENERIC TABLE PANEL
--------------------------------------------------------------------- */
function EntityTable({ id, label, icon, color, onBack }) {
  const table = TABLE_MAP[id.replace("crm__", "")];
  const [query, setQuery] = useState("");
  const [rows] = useState(table.rows);
  const [open, setOpen] = useState(false);

  const filtered = rows.filter((r) => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="flex items-center gap-3">
          <IconBadge icon={icon} color={color} />
          <div>
            <div className="crumb">CRM <ChevronRight size={12} /> {label}</div>
            <div className="panel-title">{label}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="search-box">
            <Search size={13} color={C.inkFaint} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label.toLowerCase()}…`} />
          </div>
          <button className="btn-ghost" onClick={onBack}>Back to CRM</button>
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={14} /> Add {label.slice(0, -1) || label}</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>{table.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                {table.columns.map((c) => (
                  <td key={c}>{c === "Status" ? <StatusBadge status={r[c]} /> : r[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="panel-title" style={{ fontSize: 16 }}>Add {label.slice(0, -1) || label}</div>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {table.columns.map((c) => (
                <label key={c} className="field-row" key={c}>
                  <span>{c}</span>
                  <input className="field" placeholder={`Enter ${c.toLowerCase()}`} />
                </label>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER DETAIL
--------------------------------------------------------------------- */
function CustomerDetail({ customer }) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Contacts", "Addresses", "Documents", "Activities", "Notes"];

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="crumb">CRM <ChevronRight size={12} /> Customers <ChevronRight size={12} /> {customer.code}</div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost"><Edit3 size={13} /> Edit</button>
          <button className="btn-primary"><Plus size={14} /> Add Contact</button>
        </div>
      </div>

      <div className="detail-id-row">
        <div className="avatar-tile">{customer.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <div className="flex items-center gap-2">
            <div className="panel-title" style={{ fontSize: 18 }}>{customer.name}</div>
            <StatusBadge status={customer.status} />
          </div>
          <div className="crumb" style={{ marginTop: 2 }}>{customer.code}</div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="detail-grid">
          <div className="detail-col">
            <div className="detail-field"><Building2 size={14} color={C.inkFaint} /><span className="k">Buyer</span><span className="v">{customer.buyer}</span></div>
            <div className="detail-field"><MailIcon size={14} color={C.inkFaint} /><span className="k">Email</span><span className="v">{customer.email}</span></div>
            <div className="detail-field"><Phone size={14} color={C.inkFaint} /><span className="k">Phone</span><span className="v">{customer.phone}</span></div>
            <div className="detail-field"><Globe size={14} color={C.inkFaint} /><span className="k">Website</span><span className="v">{customer.website}</span></div>
            <div className="detail-field"><MapPin size={14} color={C.inkFaint} /><span className="k">Country</span><span className="v">{customer.country}</span></div>
            <div className="detail-field"><CalendarCheck size={14} color={C.inkFaint} /><span className="k">Payment Terms</span><span className="v">{customer.terms}</span></div>
            <div className="detail-field"><CreditCard size={14} color={C.inkFaint} /><span className="k">Credit Limit</span><span className="v">{customer.credit}</span></div>
          </div>

          <div className="detail-col">
            <div className="addr-title">Billing Address</div>
            <div className="addr-box">{customer.billing.map((l, i) => <div key={i}>{l}</div>)}</div>
            <div className="addr-title" style={{ marginTop: 14 }}>Shipping Address</div>
            <div className="addr-box">{customer.shipping.map((l, i) => <div key={i}>{l}</div>)}</div>
          </div>

          <div className="detail-col">
            <div className="addr-title">Recent Activities</div>
            <div className="timeline">
              {customer.activity.map(([label, date], i) => (
                <div className="timeline-row" key={i}>
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-label">{label}</div>
                    <div className="timeline-date">{date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab !== "Overview" && (
        <div className="empty-tab">Nothing to show here yet in this prototype — try the <b>Overview</b> tab.</div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMERS TABLE
--------------------------------------------------------------------- */
function CustomersSection({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const filtered = CUSTOMERS.filter((c) => (c.name + c.buyer + c.country).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="crumb">CRM <ChevronRight size={12} /> Customers</div>
          <div className="panel-title">Customers</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="search-box">
            <Search size={13} color={C.inkFaint} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" />
          </div>
          <button className="btn-ghost"><Download size={13} /> Export</button>
          <button className="btn-primary"><Plus size={14} /> Add Customer</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer Code</th><th>Customer Name</th><th>Buyer</th><th>Email</th>
              <th>Phone</th><th>Country</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.code} className={c.code === selected.code ? "row-active" : ""} onClick={() => onSelect(c)}>
                <td className="mono">{c.code}</td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.buyer}</td>
                <td>{c.email}</td>
                <td className="mono">{c.phone}</td>
                <td>{c.country}</td>
                <td><StatusBadge status={c.status} /></td>
                <td><MoreHorizontal size={16} color={C.inkFaint} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot">Showing 1 to {filtered.length} of {CUSTOMERS.length} entries</div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MINI PANEL
--------------------------------------------------------------------- */
function MiniPanel({ title, color, columns, rows, onViewAll }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title" style={{ fontSize: 15 }}>{title}</div>
          <div className="crumb" style={{ marginTop: 2 }}>Manage {title.toLowerCase()}</div>
        </div>
        <button className="btn-primary" style={{ background: color }}><Plus size={13} /> Add</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>{c === "Status" ? <StatusBadge status={r[c]} /> : r[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="view-all" onClick={onViewAll}>View all <ArrowRight size={12} /></button>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CRM HUB LANDING PAGE
--------------------------------------------------------------------- */
function CrmHub({ onOpen, selected, onSelectCustomer }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="crumb">Home <ChevronRight size={12} /> CRM</div>
        <div className="page-title">CRM</div>
      </div>

      <div className="hub-grid">
        {CRM_CHILDREN.map((c) => (
          <button key={c.id} className="hub-card" onClick={() => onOpen(c)}>
            <IconBadge icon={c.icon} color={c.color} />
            <div className="hub-card-label">{c.label}</div>
            <div className="hub-card-desc">{c.desc}</div>
            <span className="hub-card-link">View Details</span>
          </button>
        ))}
      </div>

      <CustomersSection selected={selected} onSelect={onSelectCustomer} />
      <CustomerDetail customer={selected} />

      <div className="mini-grid">
        <MiniPanel
          title="Enquiries" color={SWATCHES.teal}
          columns={["Enquiry No", "Customer", "Subject", "Date", "Status"]}
          rows={ENQUIRIES.map(e => ({ "Enquiry No": e.no, Customer: e.customer, Subject: e.subject, Date: e.date, Status: e.status }))}
          onViewAll={() => onOpen(CRM_CHILDREN.find(c => c.label === "Enquiries"))}
        />
        <MiniPanel
          title="Meetings" color={SWATCHES.green}
          columns={["Meeting Title", "Customer", "Date", "Status"]}
          rows={MEETINGS.map(m => ({ "Meeting Title": m.title, Customer: m.customer, Date: m.date, Status: m.status }))}
          onViewAll={() => onOpen(CRM_CHILDREN.find(c => c.label === "Meetings"))}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CRM PAGE WRAPPER
--------------------------------------------------------------------- */
export default function CrmPage() {
  const [searchParams] = useSearchParams();
  const [activeChild, setActiveChild] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view && view !== 'overview') {
      const match = CRM_CHILDREN.find(c => c.label.toLowerCase() === view.toLowerCase());
      if (match) {
        setActiveChild(match);
      }
    } else {
      setActiveChild(null);
    }
  }, [searchParams]);

  const openChild = (c) => setActiveChild(c);
  const goHub = () => setActiveChild(null);

  return (
    <div className="crm-module-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .crm-module-page {
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
          font-family: var(--font-body);
          color: ${C.ink};
          width: 100%;
        }
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }
        input:focus, button:focus-visible { outline: 2px solid ${C.magenta}; outline-offset: 1px; }

        /* Reusable */
        .crumb { font-size: 11.5px; color: ${C.inkFaint}; display: flex; align-items: center; gap: 3px; font-weight: 500; }
        .page-title { font-family: var(--font-display); font-weight: 700; font-size: 24px; margin-top: 2px; }
        .panel { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px rgba(38,34,59,0.03), 0 10px 24px rgba(38,34,59,0.04); }
        .panel-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .panel-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; }

        .icon-badge { border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; padding: 4px 9px; border-radius: 20px; }

        .btn-primary { display: flex; align-items: center; gap: 6px; background: ${C.magenta}; color: #fff; font-size: 13px; font-weight: 600; padding: 9px 15px; border-radius: 9px; white-space: nowrap; }
        .btn-primary:hover { filter: brightness(0.95); }
        .btn-ghost { display: flex; align-items: center; gap: 6px; background: ${C.canvas}; color: ${C.ink}; font-size: 13px; font-weight: 500; padding: 9px 14px; border-radius: 9px; white-space: nowrap; }
        .btn-ghost:hover { background: ${C.line}; }

        .search-box { display: flex; align-items: center; gap: 7px; background: ${C.canvas}; border-radius: 9px; padding: 8px 12px; font-size: 13px; }
        .search-box input { background: transparent; border: none; font-size: 13px; width: 160px; color: ${C.ink}; }

        /* Hub Grid */
        .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
        .hub-card { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 16px; padding: 18px; text-align: left; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 2px rgba(38,34,59,0.03); transition: transform .12s, box-shadow .12s; }
        .hub-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(38,34,59,0.08); }
        .hub-card-label { font-weight: 700; font-size: 14.5px; margin-top: 2px; }
        .hub-card-desc { font-size: 12px; color: ${C.inkSoft}; line-height: 1.4; }
        .hub-card-link { font-size: 12px; font-weight: 600; color: ${C.magenta}; margin-top: 2px; }

        /* Table */
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: ${C.inkFaint}; font-weight: 600; padding: 10px 12px; border-bottom: 1px solid ${C.line}; white-space: nowrap; }
        td { padding: 12px; border-bottom: 1px solid ${C.line}; color: ${C.ink}; white-space: nowrap; }
        tbody tr { cursor: pointer; }
        tbody tr:hover { background: ${C.canvas}; }
        tbody tr.row-active { background: ${C.magentaSoft}; }
        .mono { font-family: var(--font-mono); font-size: 12.5px; color: ${C.inkSoft}; }
        .table-foot { font-size: 12px; color: ${C.inkFaint}; padding-top: 12px; }
        .view-all { display: flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 600; color: ${C.magenta}; padding-top: 10px; }

        /* Detail */
        .detail-id-row { display: flex; align-items: center; gap: 14px; padding: 14px 0 6px; border-bottom: 1px solid ${C.line}; margin-bottom: 4px; }
        .avatar-tile { width: 46px; height: 46px; border-radius: 12px; background: ${C.indigoSoft}; color: ${C.indigo}; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 14px; }
        .tabs { display: flex; gap: 4px; border-bottom: 1px solid ${C.line}; margin: 14px 0 18px; overflow-x: auto; }
        .tab { padding: 10px 4px; margin-right: 22px; font-size: 13px; font-weight: 500; color: ${C.inkFaint}; border-bottom: 2px solid transparent; white-space: nowrap; }
        .tab-active { color: ${C.magenta}; border-color: ${C.magenta}; font-weight: 600; }
        .detail-grid { display: grid; grid-template-columns: 1.1fr 1.1fr 1fr; gap: 22px; }
        @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
        .detail-col { display: flex; flex-direction: column; gap: 12px; }
        .detail-field { display: grid; grid-template-columns: 18px 110px 1fr; align-items: center; gap: 8px; font-size: 13px; }
        .detail-field .k { color: ${C.inkFaint}; font-size: 12px; }
        .detail-field .v { font-weight: 500; }
        .addr-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; color: ${C.inkFaint}; }
        .addr-box { background: ${C.canvas}; border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.6; margin-top: 6px; }
        .timeline { display: flex; flex-direction: column; gap: 14px; margin-top: 6px; }
        .timeline-row { display: flex; gap: 10px; align-items: flex-start; }
        .timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.magenta}; margin-top: 5px; flex-shrink: 0; }
        .timeline-label { font-size: 13px; font-weight: 500; }
        .timeline-date { font-size: 11.5px; color: ${C.inkFaint}; margin-top: 1px; }
        .empty-tab { padding: 30px 0; text-align: center; color: ${C.inkFaint}; font-size: 13px; }

        .mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 900px) { .mini-grid { grid-template-columns: 1fr; } }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(38,34,59,0.35); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal { background: #fff; border-radius: 16px; width: 420px; max-height: 85vh; overflow-y: auto; }
        .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid ${C.line}; }
        .modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
        .field-row { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${C.inkSoft}; font-weight: 500; }
        .field { border: 1px solid ${C.line}; border-radius: 8px; padding: 9px 11px; font-size: 13.5px; font-family: var(--font-body); }
        .modal-foot { display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid ${C.line}; }
        .modal-foot button { flex: 1; }
      `}</style>

      {!activeChild ? (
        <CrmHub onOpen={openChild} selected={selectedCustomer} onSelectCustomer={setSelectedCustomer} />
      ) : activeChild.label === "Customers" ? (
        <div className="flex flex-col gap-5">
          <CustomersSection selected={selectedCustomer} onSelect={setSelectedCustomer} />
          <CustomerDetail customer={selectedCustomer} />
          <button className="btn-ghost" style={{ width: "fit-content" }} onClick={goHub}>Back to CRM</button>
        </div>
      ) : (
        <EntityTable id={activeChild.id} label={activeChild.label} icon={activeChild.icon} color={activeChild.color} onBack={goHub} />
      )}
    </div>
  );
}
