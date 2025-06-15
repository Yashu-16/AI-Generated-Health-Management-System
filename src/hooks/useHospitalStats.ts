import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient, Invoice, Room } from "@/types/hospital";

/**
 * Aggregates hospital stats from Supabase in one hook.
 */
export function useHospitalStats() {
  return useQuery({
    queryKey: ["hospitalStats"],
    queryFn: async () => {
      // Fetch patients
      const { data: patientsRaw, error: patientsError } = await supabase
        .from("patients")
        .select("*");

      if (patientsError) throw patientsError;
      const patients: Patient[] = (patientsRaw ?? []).map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        age: row.age,
        gender: row.gender,
        phone: row.phone,
        email: row.email,
        address: row.address,
        emergencyContact: row.emergency_contact,
        emergencyPhone: row.emergency_phone,
        bloodType: row.blood_type,
        allergies: row.allergies ?? [],
        admissionDate: row.admission_date ? new Date(row.admission_date) : new Date(),
        dischargeDate: row.discharge_date ? new Date(row.discharge_date) : undefined,
        status: row.status,
        assignedDoctorId: row.assigned_doctor_id,
        assignedRoomId: row.assigned_room_id,
        insuranceInfo: row.insurance_info,
        medicalHistory: row.medical_history,
        currentDiagnosis: row.current_diagnosis,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      }));

      // Fetch rooms
      const { data: roomsRaw, error: roomsError } = await supabase
        .from("rooms")
        .select("*");

      if (roomsError) throw roomsError;
      const rooms: Room[] = (roomsRaw ?? []).map((row: any) => ({
        id: row.id,
        roomNumber: row.room_number,
        type: row.type,
        floor: row.floor,
        capacity: row.capacity,
        currentOccupancy: row.current_occupancy,
        status: row.status,
        dailyRate: row.daily_rate,
        amenities: row.amenities ?? [],
        assignedPatients: row.assigned_patients ?? [],
        lastCleaned: row.last_cleaned ? new Date(row.last_cleaned) : undefined,
        equipment: row.equipment ?? [],
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      }));

      // Fetch invoices
      const { data: invoicesRaw, error: invoicesError } = await supabase
        .from("invoices")
        .select("*");

      if (invoicesError) throw invoicesError;
      const invoices: Invoice[] = (invoicesRaw ?? []).map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        invoiceNumber: row.invoice_number,
        issueDate: row.issue_date ? new Date(row.issue_date) : new Date(),
        dueDate: row.due_date ? new Date(row.due_date) : new Date(),
        items: row.items ?? [],
        subtotal: Number(row.subtotal),
        tax: Number(row.tax),
        discount: Number(row.discount),
        total: Number(row.total),
        status: row.status,
        paymentMethod: row.payment_method || undefined,
        paymentDate: row.payment_date ? new Date(row.payment_date) : undefined,
        notes: row.notes,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      }));

      // Fetch users for active doctors and staff
      const { data: usersRaw, error: usersError } = await supabase
        .from("users")
        .select("*");
      if (usersError) throw usersError;

      // Debug: log entire usersRaw data returned
      console.log("Fetched usersRaw:", usersRaw);

      // Count doctors that are active
      const activeDoctors = (usersRaw ?? []).filter(
        (u: any) => u.role === "doctor" && u.is_active === true
      ).length;

      // Count staff that are active
      const activeStaff = (usersRaw ?? []).filter(
        (u: any) => u.role === "staff" && u.is_active === true
      ).length;

      // Debug: log counts
      console.log(
        "Active Doctors:", activeDoctors,
        "Active Staff:", activeStaff
      );

      // Fetch today's appointments
      const today = new Date();
      const YYYY = today.getFullYear();
      const MM = String(today.getMonth() + 1).padStart(2, "0");
      const DD = String(today.getDate()).padStart(2, "0");
      const todayString = `${YYYY}-${MM}-${DD}`;
      const { data: appointmentsRaw, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, appointment_date");
      if (appointmentsError) throw appointmentsError;
      const todaysAppointments =
        (appointmentsRaw ?? []).filter((appt: any) => {
          // appointment_date is returned as string "YYYY-MM-DD"
          return appt.appointment_date === todayString;
        }).length;

      // Compute stats
      // Total patients
      const totalPatients = patients.length;

      // Currently Admitted = Status === "Admitted" or "Critical"
      const admittedPatients = patients.filter(
        (p) => p.status === "Admitted" || p.status === "Critical"
      ).length;

      // Discharged today
      const dischargedToday = patients.filter(p => {
        if (!p.dischargeDate) return false;
        return (
          p.dischargeDate.getFullYear() === today.getFullYear() &&
          p.dischargeDate.getMonth() === today.getMonth() &&
          p.dischargeDate.getDate() === today.getDate()
        );
      }).length;

      // Beds:
      const totalBeds = rooms.reduce((sum, room) => sum + (room.capacity ?? 0), 0);
      const availableBeds = rooms.filter((room) => room.status === "Available").reduce(
        (sum, room) => sum + (room.capacity ?? 0) - (room.currentOccupancy ?? 0), 0
      );

      // Occupancy Rate = (total occupied / total beds) * 100
      const occupiedBeds = rooms.reduce((sum, room) => sum + (room.currentOccupancy ?? 0), 0);
      const occupancyRate = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      // Revenue: "today's" and this month's
      const isToday = (date: Date) =>
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      const isCurrentMonth = (date: Date) =>
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth();

      const totalRevenue = invoices
        .filter((inv) => inv.paymentDate && isToday(inv.paymentDate))
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

      const monthlyRevenue = invoices
        .filter((inv) => inv.paymentDate && isCurrentMonth(inv.paymentDate))
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

      // Critical Patients
      const criticalPatients = patients.filter((p) => p.status === "Critical").length;

      return {
        totalPatients,
        admittedPatients,
        dischargedToday,
        availableBeds,
        occupancyRate,
        todaysAppointments,
        totalRevenue,
        monthlyRevenue,
        activeDoctors,
        activeStaff, // now shows only staff (non-doctor)
        criticalPatients
      };
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
