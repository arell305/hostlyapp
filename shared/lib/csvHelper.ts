export type RowInput = { name: string; phoneNumber: string };

export function parseCsvToRecords(csvText: string): Record<string, string>[] {
  const allLines: string[] = csvText
    .split(/\r?\n/)
    .filter((lineText: string) => lineText.trim().length > 0);

  if (allLines.length === 0) {
    return [];
  }

  const headerCells: string[] = splitCsvLine(allLines[0]);
  const recordList: Record<string, string>[] = [];

  for (let lineIndex: number = 1; lineIndex < allLines.length; lineIndex++) {
    const lineCells: string[] = splitCsvLine(allLines[lineIndex]);
    const record: Record<string, string> = {};
    for (
      let columnIndex: number = 0;
      columnIndex < headerCells.length;
      columnIndex++
    ) {
      const headerKey: string = headerCells[columnIndex];
      const cellValue: string = lineCells[columnIndex] ?? "";
      record[headerKey] = cellValue;
    }
    recordList.push(record);
  }

  return recordList;
}

export function splitCsvLine(lineText: string): string[] {
  const parsedCells: string[] = [];
  let currentCell: string = "";
  let isInsideQuotes: boolean = false;

  for (let charIndex: number = 0; charIndex < lineText.length; charIndex++) {
    const character: string = lineText[charIndex];

    if (character === '"') {
      const isEscapedQuote: boolean =
        isInsideQuotes && lineText[charIndex + 1] === '"';
      if (isEscapedQuote) {
        currentCell += '"';
        charIndex += 1;
      } else {
        isInsideQuotes = !isInsideQuotes;
      }
    } else {
      const isDelimiterOutsideQuotes: boolean =
        character === "," && !isInsideQuotes;
      if (isDelimiterOutsideQuotes) {
        parsedCells.push(currentCell);
        currentCell = "";
      } else {
        currentCell += character;
      }
    }
  }

  parsedCells.push(currentCell);
  const trimmedCells: string[] = parsedCells.map((cellText: string) =>
    cellText.trim()
  );
  return trimmedCells;
}

export function mapCsvRecordsToRows(
  records: Record<string, string>[]
): RowInput[] {
  if (records.length === 0) {
    return [];
  }

  const firstRecord: Record<string, string> = records[0];
  const headerKeysOriginal: string[] = Object.keys(firstRecord);
  const headerKeysNormalized: string[] = headerKeysOriginal.map(
    (keyText: string) => keyText.toLowerCase().replace(/\s+/g, "")
  );

  const normalizedNameKey: string = selectPreferredHeaderKey(
    headerKeysNormalized,
    ["name", "fullname", "contactname"]
  );
  const normalizedPhoneKey: string = selectPreferredHeaderKey(
    headerKeysNormalized,
    ["phone", "phonenumber", "mobile", "cell", "telephone", "tel"]
  );

  const rowOutputs: RowInput[] = records.map(
    (record: Record<string, string>) => {
      const nameIndex: number = headerKeysNormalized.indexOf(normalizedNameKey);
      const phoneIndex: number =
        headerKeysNormalized.indexOf(normalizedPhoneKey);

      const originalNameKey: string = headerKeysOriginal[nameIndex] ?? "name";
      const originalPhoneKey: string =
        headerKeysOriginal[phoneIndex] ?? "phoneNumber";

      const mappedName: string = record[originalNameKey] ?? "";
      const mappedPhone: string = record[originalPhoneKey] ?? "";

      const rowOutput: RowInput = {
        name: mappedName,
        phoneNumber: mappedPhone,
      };
      return rowOutput;
    }
  );

  return rowOutputs;
}

export function selectPreferredHeaderKey(
  normalizedHeaders: string[],
  candidateKeys: string[]
): string {
  for (
    let candidateIndex: number = 0;
    candidateIndex < candidateKeys.length;
    candidateIndex++
  ) {
    const candidateKey: string = candidateKeys[candidateIndex];
    const hasCandidate: boolean =
      normalizedHeaders.indexOf(candidateKey) !== -1;
    if (hasCandidate) {
      return candidateKey;
    }
  }
  const fallbackKey: string = candidateKeys[0];
  return fallbackKey;
}

export function sanitizeAndDeduplicateRows(rows: RowInput[]): {
  cleanedRows: RowInput[];
  collectedErrors: string[];
} {
  const seenPhoneNumbers: Set<string> = new Set<string>();
  const cleanedRows: RowInput[] = [];
  const collectedErrors: string[] = [];

  for (let rowIndex: number = 0; rowIndex < rows.length; rowIndex++) {
    const rawRow: RowInput = rows[rowIndex];
    const trimmedName: string = (rawRow.name ?? "").trim();
    const trimmedPhone: string = (rawRow.phoneNumber ?? "").trim();

    const isCompletelyEmpty: boolean =
      trimmedName.length === 0 && trimmedPhone.length === 0;
    const hasMissingPhone: boolean = trimmedPhone.length === 0;
    const isDuplicatePhone: boolean = seenPhoneNumbers.has(trimmedPhone);

    if (isCompletelyEmpty) {
      const skipNoop: boolean = true;
    } else if (hasMissingPhone) {
      const errorMessage: string = `Row ${rowIndex + 2}: missing phone`;
      collectedErrors.push(errorMessage);
    } else if (isDuplicatePhone) {
      const skipDuplicate: boolean = true;
    } else {
      seenPhoneNumbers.add(trimmedPhone);
      const cleanedRow: RowInput = {
        name: trimmedName,
        phoneNumber: trimmedPhone,
      };
      cleanedRows.push(cleanedRow);
    }
  }

  return { cleanedRows, collectedErrors };
}
