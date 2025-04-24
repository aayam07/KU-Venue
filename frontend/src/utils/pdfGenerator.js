import { pdf } from '@react-pdf/renderer';
import moment from 'moment';

export const generatePDF = async (Component, slot) => {
  try {
    const blob = await pdf(Component).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking_confirmation_${slot.username}_${moment(slot.start).format('YYYY-MM-DD')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 