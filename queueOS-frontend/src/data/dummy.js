export const DUMMY_BUSINESSES = [
  {
    id: '1',
    name: 'CityMed Hospital',
    category: 'Hospital',
    email: 'contact@citymed.com',
    phone: '555-1001',
    address: '123 Health Ave, Downtown',
    description: 'Full-service hospital providing comprehensive medical care with specialized departments.',
    openingTime: '08:00',
    closingTime: '20:00',
    status: 'active',
    totalQueues: 12,
    todayVisitors: 148,
  },
  {
    id: '2',
    name: 'Luxe Salon & Spa',
    category: 'Salon',
    email: 'book@luxesalon.com',
    phone: '555-2002',
    address: '45 Style Street, Uptown',
    description: 'Premium salon and spa offering haircuts, coloring, and luxury spa treatments.',
    openingTime: '09:00',
    closingTime: '19:00',
    status: 'active',
    totalQueues: 4,
    todayVisitors: 32,
  },
  {
    id: '3',
    name: 'First National Bank',
    category: 'Bank',
    email: 'support@fnbank.com',
    phone: '555-3003',
    address: '78 Finance Blvd, Business District',
    description: 'Leading bank providing retail and corporate banking services.',
    openingTime: '09:00',
    closingTime: '17:00',
    status: 'active',
    totalQueues: 8,
    todayVisitors: 95,
  },
  {
    id: '4',
    name: 'City Hall Services',
    category: 'Government Office',
    email: 'info@cityhall.gov',
    phone: '555-4004',
    address: '1 Government Square, Civic Center',
    description: 'Municipal services for residents including permits, licenses, and civil registrations.',
    openingTime: '08:30',
    closingTime: '16:30',
    status: 'inactive',
    totalQueues: 6,
    todayVisitors: 0,
  },
]

export const DUMMY_QUEUE = [
  { id: 'T001', name: 'James Carter',   service: 'General Consultation', waitTime: '5 min',  position: 1, status: 'serving' },
  { id: 'T002', name: 'Emma Wilson',    service: 'Blood Test',           waitTime: '12 min', position: 2, status: 'waiting' },
  { id: 'T003', name: 'Liam Johnson',   service: 'X-Ray',                waitTime: '20 min', position: 3, status: 'waiting' },
  { id: 'T004', name: 'Olivia Brown',   service: 'General Consultation', waitTime: '28 min', position: 4, status: 'waiting' },
  { id: 'T005', name: 'Noah Davis',     service: 'Pharmacy',             waitTime: '35 min', position: 5, status: 'waiting' },
  { id: 'T006', name: 'Sophia Martinez',service: 'Dental',               waitTime: '42 min', position: 6, status: 'waiting' },
]

export const DUMMY_APPOINTMENTS = [
  { id: 'A001', business: 'CityMed Hospital',    service: 'General Consultation', date: '2026-06-18', time: '10:00', status: 'confirmed', token: 'MCH-042' },
  { id: 'A002', business: 'Luxe Salon & Spa',    service: 'Haircut & Styling',    date: '2026-06-20', time: '14:30', status: 'confirmed', token: 'LSP-017' },
  { id: 'A003', business: 'First National Bank', service: 'Account Opening',      date: '2026-06-15', time: '11:00', status: 'completed', token: 'FNB-083' },
  { id: 'A004', business: 'CityMed Hospital',    service: 'Follow-up',            date: '2026-06-10', time: '09:30', status: 'cancelled', token: 'MCH-031' },
]

export const DUMMY_NOTIFICATIONS = [
  { id: 1, type: 'queue',       message: "Your token T-042 is next! Please proceed to Counter 3.", time: '2 min ago',  read: false },
  { id: 2, type: 'appointment', message: 'Appointment confirmed at CityMed Hospital on June 18.',  time: '1 hour ago', read: false },
  { id: 3, type: 'system',      message: 'Luxe Salon & Spa updated their working hours.',          time: '3 hours ago',read: true  },
  { id: 4, type: 'queue',       message: 'Your appointment at First National Bank is tomorrow.',    time: '1 day ago',  read: true  },
]

export const DUMMY_USERS = [
  { id: 'U001', name: 'Alex Johnson',    email: 'alex@demo.com',   role: 'customer', phone: '555-0101', joined: '2026-01-15', status: 'active' },
  { id: 'U002', name: 'Sarah Williams',  email: 'sarah@demo.com',  role: 'owner',    phone: '555-0202', joined: '2026-01-20', status: 'active' },
  { id: 'U003', name: 'Mike Davis',      email: 'mike@demo.com',   role: 'staff',    phone: '555-0303', joined: '2026-02-05', status: 'active' },
  { id: 'U004', name: 'Lisa Chen',       email: 'lisa@demo.com',   role: 'customer', phone: '555-0404', joined: '2026-02-10', status: 'active' },
  { id: 'U005', name: 'Robert Kim',      email: 'robert@demo.com', role: 'owner',    phone: '555-0505', joined: '2026-03-01', status: 'inactive' },
  { id: 'U006', name: 'Maria Garcia',    email: 'maria@demo.com',  role: 'staff',    phone: '555-0606', joined: '2026-03-15', status: 'active' },
]

export const DUMMY_SERVICES = [
  { id: 'S001', name: 'General Consultation', duration: 20, price: 50,  available: true,  description: 'General medical consultation with a doctor' },
  { id: 'S002', name: 'Blood Test',           duration: 15, price: 30,  available: true,  description: 'Standard blood panel analysis' },
  { id: 'S003', name: 'X-Ray',                duration: 30, price: 80,  available: true,  description: 'Digital X-ray imaging and report' },
  { id: 'S004', name: 'Dental Checkup',       duration: 25, price: 60,  available: false, description: 'Complete dental examination' },
  { id: 'S005', name: 'Pharmacy',             duration: 10, price: 0,   available: true,  description: 'Prescription dispensing service' },
]
