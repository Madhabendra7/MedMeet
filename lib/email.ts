export interface EmailData {
  to: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  specialization: string;
}

// Mock email service (in production, use NodeMailer with SMTP)
export const sendAppointmentConfirmation = async (emailData: EmailData): Promise<boolean> => {
  console.log('Sending appointment confirmation email...');
  console.log('To:', emailData.to);
  console.log('Subject: Appointment Confirmation');
  console.log(`
    Dear ${emailData.patientName},
    
    Your appointment has been confirmed with the following details:
    
    Doctor: ${emailData.doctorName}
    Specialization: ${emailData.specialization}
    Date: ${emailData.date}
    Time: ${emailData.time}
    
    Please arrive 15 minutes early for your appointment.
    
    If you need to cancel or reschedule, please contact us at least 24 hours in advance.
    
    Thank you for choosing our healthcare services.
    
    Best regards,
    Healthcare Team
  `);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};