import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'

type ExcelLinkType = 'email' | 'instagram' | 'url'

export type ExcelColumnConfig = {
    header: string
    key: string
    linkType?: ExcelLinkType
}

function buildLink(linkType: ExcelLinkType, rawValue: string): string {
    if (linkType === 'email') {
        return `mailto:${rawValue}`
    }
    if (linkType === 'instagram') {
        const normalized = rawValue.startsWith('@')
            ? rawValue.slice(1)
            : rawValue
        return `https://instagram.com/${normalized}`
    }
    return rawValue
}

function createStyledWorksheet(
    rows: Record<string, string>[],
    columns: ExcelColumnConfig[],
): XLSX.WorkSheet {
    const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: columns.map((col) => col.key),
    })

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E3A8A' } },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    }

    columns.forEach((column, colIndex) => {
        const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex })
        const headerCell = worksheet[headerCellAddress]
        if (!headerCell) return
        headerCell.v = column.header
        headerCell.s = headerStyle
    })

    columns.forEach((column, colIndex) => {
        if (!column.linkType) return

        for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
            const cell = worksheet[cellAddress]
            const value = String(cell?.v ?? '').trim()
            if (!cell || !value) continue

            cell.l = {
                Target: buildLink(column.linkType, value),
                Tooltip: value,
            }
            cell.s = {
                font: { color: { rgb: '0563C1' }, underline: true },
            }
        }
    })

    worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1' }
    worksheet['!freeze'] = {
        xSplit: '0',
        ySplit: '1',
        topLeftCell: 'A2',
        activePane: 'bottomLeft',
        state: 'frozen',
    }

    worksheet['!cols'] = columns.map((column) => {
        const maxDataLength = rows.reduce((max, row) => {
            const valueLength = String(row[column.key] ?? '').length
            return Math.max(max, valueLength)
        }, column.header.length)
        return { wch: Math.min(Math.max(maxDataLength + 2, 12), 60) }
    })

    return worksheet
}

function enforceFrozenHeaderInSheetXml(sheetXml: string): string {
    const sheetViewsBlock =
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'

    if (sheetXml.includes('<sheetViews>')) {
        return sheetXml.replace(/<sheetViews>[\s\S]*?<\/sheetViews>/, sheetViewsBlock)
    }

    if (sheetXml.includes('<dimension')) {
        return sheetXml.replace(/(<dimension[^>]*\/>)/, `$1${sheetViewsBlock}`)
    }

    return sheetXml
}

export async function exportStyledExcel(params: {
    rows: Record<string, string>[]
    columns: ExcelColumnConfig[]
    sheetName: string
    fileName: string
}): Promise<void> {
    const { rows, columns, sheetName, fileName } = params
    const worksheet = createStyledWorksheet(rows, columns)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    try {
        const workbookArray = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })
        const zip = await JSZip.loadAsync(workbookArray)
        const sheetPath = 'xl/worksheets/sheet1.xml'
        const sheetFile = zip.file(sheetPath)

        if (!sheetFile) {
            XLSX.writeFile(workbook, fileName)
            return
        }

        const sheetXml = await sheetFile.async('text')
        zip.file(sheetPath, enforceFrozenHeaderInSheetXml(sheetXml))
        const blob = await zip.generateAsync({ type: 'blob' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('No se pudo forzar encabezado congelado en Excel:', error)
        XLSX.writeFile(workbook, fileName)
    }
}
