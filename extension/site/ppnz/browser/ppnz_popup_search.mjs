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

import { addMenuItemWithSubMenu, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const ppnzStartYear = 1839;
const ppnzEndYear = 1979;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: ppnzStartYear,
    endYear: ppnzEndYear,
    dateTestType: "bmd",
    countryList: ["New Zealand"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function ppnzSearch(input) {
  doAsyncActionWithCatch("Papers Past (NZ) Search", input, async function () {
    let loadedModule = await import(`../core/ppnz_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function ppnzDefaultSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  ppnzSearch(input);
}

async function ppnzSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  ppnzSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addPpnzDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search Papers Past (NZ)",
    function (element) {
      ppnzDefaultSearch(data.generalizedData, "");
    },
    function () {
      setupPpnzSearchSubMenu(data, backFunction);
    }
  );

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupPpnzSearchSubMenu(data, backFunction) {
  let dataModule = await import(`../../../base/core/text_query_menu_data.mjs`);
  dataModule.TextSearchMenuData.searchSiteName = "ppnz";
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.TextSearchMenuData, ppnzSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("ppnz", "Papers Past (NZ)", addPpnzDefaultSearchMenuItem, shouldShowSearchMenuItem);
