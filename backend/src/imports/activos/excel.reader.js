const ExcelJS = require('exceljs');
const path = require('path');

async function leerExcelActivos(filePath) {
    const workbook = new ExcelJS.Workbook();
    
    // Cargamos el archivo Excel
    await workbook.xlsx.readFile(filePath);
    
    // Seleccionamos la hoja específica del reporte institucional
    const sheetName = 'REPORTE DEVOLUTIVOS (1) xlsx';
    const worksheet = workbook.getWorksheet(sheetName);
    
    if (!worksheet) {
        throw new Error(`No se encontró la hoja '${sheetName}' en el archivo Excel.`);
    }

    const rowsData = [];
    let headers = [];

    // Recorremos las filas de la hoja
    worksheet.eachRow((row, rowNumber) => {
        // La primera fila contiene los encabezados
        if (rowNumber === 1) {
            headers = row.values.map(val => (val ? val.toString().trim() : ''));
            return;
        }

        // Mapeamos los valores de la fila con sus respectivos encabezados
        const rowObject = {};
        row.values.forEach((value, index) => {
            const header = headers[index];
            if (header) {
                // Limpiamos espacios en blanco si es texto
                rowObject[header] = value !== null && value !== undefined ? value : null;
            }
        });

        rowsData.push(rowObject);
    });

    console.log(`[excel.reader] Se leyeron exitosamente ${rowsData.length} filas del archivo.`);
    return rowsData;
}

module.exports = { leerExcelActivos };