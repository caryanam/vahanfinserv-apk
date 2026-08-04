import {Platform, PermissionsAndroid} from 'react-native';
import {decode, encode} from 'base-64';
import RNFS from 'react-native-fs';

const setupPolyfills = () => {
  if (typeof global !== 'undefined') {
    global.btoa = encode;
    global.atob = decode;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.btoa = encode;
    globalThis.atob = decode;
  }
  if (typeof window !== 'undefined') {
    window.btoa = encode;
    window.atob = decode;
  }
};
setupPolyfills();
/**
 * Requests external storage write permission on Android if required (API level < 33).
 */
const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 13+ (API 33+) does not need/use WRITE_EXTERNAL_STORAGE for public folders like Downloads
  if (Platform.Version >= 33) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message:
          'Vahan Finserv needs storage permission to save the verification PDF to your Downloads folder.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('[PDF Generator] Permission request error:', err);
    return false;
  }
};

/**
 * Draws a standard metadata row in jsPDF and draws a separator line.
 * Returns the height consumed by the row.
 */
const drawRow = (doc, label, value, x1, x2, y, rowHeight, pageWidth) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(102, 112, 133); // #667085
  doc.text(label, x1, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(6, 24, 66); // #061842

  const maxValWidth = pageWidth - x2 - 15;
  const lines = doc.splitTextToSize(String(value || '—'), maxValWidth);
  doc.text(lines, x2, y + 5);

  const actualHeight = Math.max(rowHeight, lines.length * 4 + 3);

  // Draw separator line
  doc.setDrawColor(228, 231, 236); // #E4E7EC
  doc.setLineWidth(0.2);
  doc.line(x1, y + actualHeight, pageWidth - 15, y + actualHeight);

  return actualHeight;
};

/**
 * Draws a section header in jsPDF.
 */
const drawSectionHeader = (doc, title, x, y, width) => {
  doc.setFillColor(228, 231, 236); // #E4E7EC
  doc.rect(x, y, width, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 42, 74); // #0B2A4A
  doc.text(title, x + 4, y + 6);
  return 8;
};

/**
 * Generates the PDF document using jsPDF and saves it to the local Downloads folder.
 * Returns the final local file path upon success.
 *
 * @param {string} type - 'RC' or 'CHALLAN'
 * @param {string} vehicleNumber - The vehicle registration number
 * @param {object} data - The API response payload object
 * @returns {Promise<string>} The path to the saved PDF file
 */
export const downloadReportAsPdf = async (type, vehicleNumber, data) => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    throw new Error('Storage permission denied.');
  }

  // 1. Initialize jsPDF (A4 Portrait, measurements in mm)
  const jspdfModule = require('jspdf');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // --- BRAND HEADER ---
  // Vahan Finserv Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(11, 42, 74); // #0B2A4A (Dark Blue)
  doc.text('Vahan', margin, y + 8);
  
  doc.setTextColor(39, 211, 195); // #27D3C3 (Teal Accent)
  doc.text('Finserv', margin + 22, y + 8);

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(102, 112, 133); // #667085
  const titleText =
    type === 'RC'
      ? 'Registration Certificate (RC) Report'
      : 'E-Challan Verification Report';
  doc.text(titleText, pageWidth - margin, y + 6, {align: 'right'});

  y += 15;

  // Thick Blue Header Bar
  doc.setDrawColor(11, 42, 74);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // --- META SECTION GRID ---
  doc.setFillColor(244, 246, 249); // #F4F6F9
  doc.rect(margin, y, contentWidth, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(102, 112, 133);
  doc.text('Vehicle Number:', margin + 4, y + 8);
  doc.setTextColor(6, 24, 66);
  doc.text(vehicleNumber, margin + 32, y + 8);

  doc.setTextColor(102, 112, 133);
  doc.text('Generated On:', pageWidth - margin - 75, y + 8);
  doc.setTextColor(6, 24, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
    pageWidth - margin - 48,
    y + 8,
  );

  y += 18;

  // --- CONTENT SECTION ---
  const col1 = margin;
  const col2 = margin + 65;
  const rowHeight = 7;

  if (type === 'RC') {
    const fields = [
      ['Owner Name', data.owner_name || data.ownerName],
      ['Vehicle Number', vehicleNumber],
      ['Manufacturer', data.vehicle_manufacturer_name],
      ['Model / Maker', data.model || data.maker_model],
      ['Vehicle Class', data.class],
      ['Fuel Type', data.type || data.fuel_type],
      ['Vehicle Colour', data.vehicle_colour],
      ['Registration Date', data.reg_date || data.registration_date],
      ['RC Expiry', data.rc_expiry_date],
      ['Insurance Company', data.vehicle_insurance_company_name],
      ['Insurance Expiry', data.vehicle_insurance_upto || data.insurance_expiry],
      ['Insurance Policy No.', data.vehicle_insurance_policy_number],
      ['Financer', data.rc_financer],
      ['Chassis Number', data.chassis || data.chassis_no],
      ['Engine Number', data.engine || data.engine_no],
      ['Owner Count', data.owner_count],
      ['RTO Authority', data.reg_authority],
      ['RC Status', data.status || 'Active'],
    ];

    fields.forEach(([label, val]) => {
      // Ensure we don't overflow the bottom margin
      if (y + rowHeight > pageHeight - margin - 15) {
        doc.addPage();
        y = margin;
      }
      y += drawRow(doc, label, val, col1, col2, y, rowHeight, pageWidth);
    });
  } else {
    // E-Challan Report
    const challanList = data.challans || data.challan_list || [];

    if (challanList.length === 0) {
      // No Challans
      doc.setDrawColor(16, 185, 129); // Green border
      doc.setLineWidth(0.3);
      doc.setFillColor(209, 250, 229); // Light Green fill
      doc.rect(margin, y, contentWidth, 20, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(6, 95, 70); // Dark Green text
      doc.text('Clean Record! No pending E-Challans found.', margin + 10, y + 12);
      y += 25;
    } else {
      // Challans listing
      y += drawSectionHeader(doc, `Found ${challanList.length} Pending Challan(s)`, margin, y, contentWidth);
      y += 4;

      challanList.forEach((c, idx) => {
        if (y + 40 > pageHeight - margin - 15) {
          doc.addPage();
          y = margin;
        }

        const headerTitle = `Challan #${idx + 1} - ${c.challan_number || c.challanNo || '—'}`;
        y += drawSectionHeader(doc, headerTitle, margin, y, contentWidth);
        y += 2;

        const fields = [
          ['Amount', `Rs ${c.amount || c.challan_amount || '0'}`],
          ['Challan Date', c.challan_date || c.date],
          ['Status', c.status || 'PENDING'],
          ['Offense / Violation', c.offense || c.violation_details],
          ['State', c.state],
          ['Accused Name', c.owner_name || c.accused_name],
        ];

        fields.forEach(([label, val]) => {
          y += drawRow(doc, label, val, col1, col2, y, rowHeight, pageWidth);
        });
        y += 6; // spacing between cards
      });
    }
  }

  // --- FOOTER ---
  if (y + 20 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
  y = pageHeight - margin - 12;

  doc.setDrawColor(217, 222, 232);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(152, 162, 179);
  doc.text(
    'This is a computer-generated verification report provided by Vahan Finserv.',
    pageWidth / 2,
    y + 5,
    {align: 'center'},
  );
  doc.text(
    `© ${new Date().getFullYear()} Vahan Finserv. All rights reserved.`,
    pageWidth / 2,
    y + 9,
    {align: 'center'},
  );

  // 2. Output as raw base64 string
  const pdfBase64 = doc.output('datauristring').split(',')[1];

  // 3. Define save paths
  const baseName = `${type === 'RC' ? 'RC' : 'Challan'}_${vehicleNumber.toUpperCase()}`;
  let fallbackUsed = false;

  const getUniquePath = async (dirPath, name) => {
    let finalName = `${name}.pdf`;
    let fullPath = `${dirPath}/${finalName}`;
    let counter = 1;
    while (await RNFS.exists(fullPath)) {
      finalName = `${name}(${counter}).pdf`;
      fullPath = `${dirPath}/${finalName}`;
      counter++;
    }
    return fullPath;
  };

  let downloadDir = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
  let downloadPath = await getUniquePath(downloadDir, baseName);

  // 4. Save to storage
  try {
    await RNFS.writeFile(downloadPath, pdfBase64, 'base64');
  } catch (err) {
    console.warn('[PDF Generator] Primary write failed, trying fallback path:', err);
    if (Platform.OS === 'android') {
      fallbackUsed = true;
      try {
        downloadPath = await getUniquePath(RNFS.ExternalDirectoryPath, baseName);
        await RNFS.writeFile(downloadPath, pdfBase64, 'base64');
      } catch (fallbackErr) {
        console.error('[PDF Generator] Fallback write failed:', fallbackErr);
        downloadPath = await getUniquePath(RNFS.CachesDirectoryPath, baseName);
        await RNFS.writeFile(downloadPath, pdfBase64, 'base64');
      }
    } else {
      throw err;
    }
  }

  // 5. Scan file so it is indexable by Android Media Store/Download Manager
  if (Platform.OS === 'android' && !fallbackUsed) {
    try {
      await RNFS.scanFile(downloadPath);
    } catch (scanErr) {
      console.log('[PDF Generator] Media scanner warning:', scanErr);
    }
  }

  return downloadPath;
};

export default {
  downloadReportAsPdf,
};
