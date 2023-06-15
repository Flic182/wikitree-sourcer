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

import { extractData } from "../../extension/site/trove/core/trove_extract_data.mjs";
import { generalizeData } from "../../extension/site/trove/core/trove_generalize_data.mjs";
import { buildCitation } from "../../extension/site/trove/core/trove_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "cairns_post_1940_jeanes_pavey",
    url: "https://trove.nla.gov.au/newspaper/article/42260088?searchTerm=pavey",
  },
  {
    caseName: "nsw_gov_gazette_1918_stephen_curnoe",
    url: "https://trove.nla.gov.au/newspaper/article/226920534?searchTerm=(fulltext%3A%22Stephen%20Curnoe%22~0%20OR%20fulltext%3A%22Stephen%20Henry%20John%20Curnoe%22~0)",
  },
];

const optionVariants = [
  {
    variantName: "std",
    optionOverrides: {
      citation_trove_includeSearchQuery: true,
    },
  },
  {
    variantName: "doNotIncludeQuery",
    optionOverrides: {
      citation_trove_includeSearchQuery: false,
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("trove", extractData, regressionData, testManager);

  await runGeneralizeDataTests("trove", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("trove", functions, regressionData, testManager, optionVariants);
}

export { runTests };
