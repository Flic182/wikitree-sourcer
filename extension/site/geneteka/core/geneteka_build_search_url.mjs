/*
MIT License

Copyright (c) 2020 Robert M Pavey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** Infers possible year range to search in for the given type of record. */
function inferDates(gd, recordType, maxLifespan, runDate) {
  if (recordType === "B") {
    const birthYear = gd.inferBirthYear();
    if (birthYear) {
      return {
        fromYear: parseInt(birthYear),
        toYear: parseInt(birthYear) + 1, // Registration may be in the following year.
      };
    }
  } else if (recordType === "D") {
    const deathYear = gd.inferDeathYear();
    if (deathYear) {
      return {
        fromYear: parseInt(deathYear),
        toYear: parseInt(deathYear) + 1, // Registration may be in the following year.
      };
    }
  }
  const range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
  return { fromYear: range.startYear, toYear: parseInt(range.endYear) + 1 };
}

/** Builds a search URL for Geneteka. */
function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;
  const parameters = buildUrlInput.searchParameters;
  const runDate = buildUrlInput.runDate;

  const province = parameters.province;
  const recordType = parameters.recordType;

  const maxLifespan = Number(options.search_general_maxLifespan);

  const lastName = gd.inferLastName();
  const firstName = gd.inferFirstName();
  const { fromYear, toYear } = inferDates(gd, recordType, maxLifespan, runDate);

  const url = new URL("https://geneteka.genealodzy.pl/index.php?op=gt&lang=eng");
  url.searchParams.append("bdm", recordType);
  url.searchParams.append("rid", recordType);
  url.searchParams.append("w", province);
  if (lastName) {
    url.searchParams.append("search_lastname", lastName);
  }
  if (firstName) {
    url.searchParams.append("search_name", firstName);
  }
  if (fromYear) {
    url.searchParams.append("from_date", fromYear);
  }
  if (toYear) {
    url.searchParams.append("to_date", toYear);
  }

  return { url: url.href };
}

export { buildSearchUrl };
