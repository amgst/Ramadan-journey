
import React, { useState } from 'react';
import { UserProfile, DailyProgress } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPdfProps {
    user: UserProfile;
    progress: Record<number, DailyProgress>;
}

const ExportPdf: React.FC<ExportPdfProps> = ({ user, progress }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Create a temporary hidden container for the report
            const reportContainer = document.createElement('div');
            reportContainer.style.position = 'absolute';
            reportContainer.style.top = '-9999px';
            reportContainer.style.left = '-9999px';
            reportContainer.style.width = '800px'; // Fixed width for A4 like ratio
            reportContainer.style.background = '#ffffff';
            reportContainer.style.padding = '40px';
            reportContainer.className = 'export-container';

            // Build HTML content
            const days = Object.values(progress).sort((a, b) => a.dayNumber - b.dayNumber);
            const totalFasts = days.filter(d => d.fasted === 'full').length;
            const totalQuran = days.reduce((sum, d) => sum + (d.quranPages || 0), 0);

            reportContainer.innerHTML = `
        <div style="font-family: sans-serif; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 20px;">
            <h1 style="color: #d97706; margin: 0;">Ramadan Journey Report</h1>
            <h2 style="margin: 10px 0 0 0; color: #555;">${user.name} (Age: ${user.age})</h2>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #fffbeb; padding: 20px; border-radius: 10px;">
            <div style="text-align: center;">
              <h3 style="margin: 0; font-size: 14px; color: #92400e;">Total Fasts</h3>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #d97706;">${totalFasts}</p>
            </div>
            <div style="text-align: center;">
               <h3 style="margin: 0; font-size: 14px; color: #92400e;">Quran Pages</h3>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #d97706;">${totalQuran}</p>
            </div>
            <div style="text-align: center;">
               <h3 style="margin: 0; font-size: 14px; color: #92400e;">Current Day</h3>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #d97706;">${user.currentDay}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f3f4f6; color: #374151;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Day</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Fasting</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Prayers</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Quran</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Good Deed</th>
              </tr>
            </thead>
            <tbody>
              ${days.map(day => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold;">${day.dayNumber}</td>
                  <td style="padding: 10px;">${day.fasted === 'full' ? '🌟 Full' : day.fasted === 'none' ? '❌' : '🌙 Part'}</td>
                  <td style="padding: 10px;">${Object.values(day.prayers).filter(Boolean).length}/6</td>
                  <td style="padding: 10px;">${day.quranPages}</td>
                  <td style="padding: 10px; font-style: italic;">${day.goodDeed || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
            Generated on ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;

            document.body.appendChild(reportContainer);

            const canvas = await html2canvas(reportContainer, {
                scale: 2,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ramadan_Journey_${user.name.replace(/\s+/g, '_')}.pdf`);

            document.body.removeChild(reportContainer);
        } catch (err) {
            console.error("Failed to export PDF", err);
            alert("Failed to create PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className={`
        px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition flex items-center gap-2
        ${isExporting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}
      `}
        >
            {isExporting ? 'Generating...' : (
                <>
                    <span>📄</span> Export Report
                </>
            )}
        </button>
    );
};

export default ExportPdf;
