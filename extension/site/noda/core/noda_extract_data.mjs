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

const END_COLON_REGEX = /:$/g;
const MULTISPACE_REGEX = /\s+/g;
const TEXT_NODE = 3;

function addPropertyVal(obj, propName, value) {
  obj[propName] = value;
}

function addPropertyValIfValid(obj, propName, value) {
  if (value) {
    addPropertyVal(obj, propName, value);
  }
}

function addTrimmedPropertyNodeIfValid(obj, propName, node, cleanFunc = cleanMultispace) {
  if (node?.nodeType === TEXT_NODE) {
    addPropertyValIfValid(obj, propName, cleanFunc(node.textContent));
  }
}

function appendPropertyListVal(obj, propName, value) {
  obj[propName].push(value);
}

function appendPropertyListValIfValid(obj, propName, values) {
  if (!Array.isArray(obj[propName])) {
    obj[propName] = [];
  }

  values?.forEach((value) => {
    if (value) {
      appendPropertyList(obj, propName, value);
    }
  });
}

function appendTrimmedPropertyListNodesIfValid(obj, propName, nodes, cleanFunc = cleanMultispace) {
  nodes?.forEach((node) => {
    if (node?.nodeType === TEXT_NODE) {
      appendPropertyListValIfValid(obj, propName, cleanFunc(node.textContent));
    }
  });
}

function cleanLabel(label) {
  return label ? cleanMultispace(label).replace(END_COLON_REGEX, "") : "";
}

function cleanMultispace(value) {
  return value ? value.trim().replace(MULTISPACE_REGEX, " ") : "";
}

function extractDataForImage(document, url, result) {
  let viewerContainer = document.querySelector("div.main-container-viewer");

  if (!viewerContainer) {
    return;
  }

  addPropertyVal(result, "success", true);
  addPropertyVal(result, "pageType", "image");
  appendTrimmedPropertyListNodesIfValid(
    result,
    "breadcrumbs",
    viewerContainer.querySelectorAll(":scope nav.breadcrumb-container li"),
  );
  addPropertyValIfValid(result, "permanentId", document.querySelector("#permanent_image_id")?.value);
  addTrimmedPropertyNodeIfValid(result, "fileTitle", viewerContainer.querySelector(":scope #file-title-text"));
}

function extractValueObj(valueDiv) {
  let value = cleanMultispace(valueDiv.textContent);

  if (value !== "-") {
    return undefined;
  }

  let valueObj = {};
  addPropertyVal(valueObj, "textString", value);
  appendTrimmedPropertyListNodesIfValid(valueObj, "textParts", valueDiv.childNodes);

  return valueObj;
}

function extractLabelValuePairs(dataObject, rows) {
  for (let dataRow of rows) {
    let rowDivs = dataRow.querySelectorAll(":scope div");
    if (rowDivs.length === 2) {
      let labelDiv = rowDivs[0];
      let valueDiv = rowDivs[1];
      if (labelDiv && valueDiv) {
        let label = cleanLabel(labelDiv.textContent);
        if (label) {
          addPropertyValIfValid(dataObject, label, extractValueObj(valueDiv));
        }
      }
    }
  }
}

function extractPeopleFromDataItems(panelData, panelGroup, dataItems) {
  // it is a list of people in list view
  panelData.people = [];

  for (let person of dataItems) {
    let personData = {};
    appendPropertyListVal(panelData, "people", personData);

    addPropertyVal(personData, "current", person.classList.contains("current"));

    let personHeadingElement = person.querySelector(":scope h4");
    if (personHeadingElement) {
      addTrimmedPropertyNodeIfValid(personData, "personHeading", personHeadingElement);

      let personLinkElement = personHeadingElement.querySelector(":scope a");
      addTrimmedPropertyNodeIfValid(personData, "personLabel", personLinkElement?.querySelector(":scope span"));
      appendTrimmedPropertyListNodesIfValid(personData, "personNameParts", personLinkElement?.childNodes);
    }

    let lastLabel = "";
    for (let dataDiv of person.querySelectorAll(":scope div.row > div > div.row > div")) {
      if (dataDiv.classList.contains("ssp-semibold")) {
        if (lastLabel) {
          addPropertyValIfValid(personData, lastLabel, extractValueObj(dataDiv));
        }
      } else {
        lastLabel = cleanLabel(dataDiv.textContent);
      }
    }
  }
}

function extractPeopleFromTable(panelData, panelGroup) {
  // it is a list of people in list view
  addPropertyVal(panelData, "people", []);

  // There are two tables the first is hidden and only contains headings
  let headings = panelGroup.querySelectorAll(
    ":scope div.panel-body > div > div[aria-hidden=true] > table.table > thead th",
  );
  let rows = panelGroup.querySelectorAll(":scope div.panel-body > div > table.table > tbody tr.data-item");

  let firstHeading = headings.length > 0 ? cleanMultispace(headings[0].textContent) : "";

  for (let row of rows) {
    let columns = row.querySelectorAll(":scope td");
    if (columns.length !== headings.length) {
      return;
    }

    let personData = {};
    appendPropertyListVal(panelData, "people", personData);
    addPropertyVal(personData, "current", row.classList.contains("current"));
    extractPersonFromLinkElement(firstHeading, columns[0].querySelector(":scope a"));

    for (let columnIndex = 1; columnIndex < columns.length; columnIndex++) {
      let column = columns[columnIndex];
      let heading = headings[columnIndex];

      if (heading && column) {
        let label = cleanLabel(heading.textContent);
        let value = cleanMultispace(column.textContent);

        if (label && value !== "-") {
          appendPropertyListVal(personData, label, { textString: value });
        }
      }
    }
  }
}

function extractPersonFromLinkElement(firstHeading, personLinkElement) {
  if (!personLinkElement) {
    return;
  }

  if (firstHeading) {
    addPropertyVal(personData, "personLabel", firstHeading);
  } else {
    addTrimmedPropertyNodeIfValid(personData, "personLabel", personLinkElement.querySelector(":scope span"));
  }

  appendTrimmedPropertyListNodesIfValid(personData, "personNameParts", personLinkElement.childNodes);
  addPropertyValIfValid(
    personData,
    "personHeading",
    cleanMultispace(personData.personLabel + " " + personData.personNameParts.join(" ")),
  );
}

function extractData(document, url) {
  let result = {};

  addPropertyValIfValid(result, "url", url);
  addPropertyVal(result, "success", false);
  addPropertyValIfValid(result, "lang", document.documentElement.lang);

  let article = document.querySelector("article");
  if (!article) {
    // could be an image
    if (document.querySelector("div.main-container-viewer")) {
      extractDataForImage(document, url, result);
    }
    return result;
  }

  addPropertyVal(result, "pageType", "record");
  appendTrimmedPropertyListNodesIfValid(
    result,
    "breadcrumbs",
    document.querySelectorAll("div.breadcrumbs li"),
    cleanLabel,
  );

  extractDataFromArticle(result, article);

  // another way to reject non-person records is from the permanentId
  // All person records seem to start with p
  if (!result.permanentId?.startsWith("p") && result.heading && result.recordData) {
    addPropertyVal(result, "success", true);
  }

  return result;
}

function extractDataFromArticle(result, article) {
  article.querySelectorAll(":scope div.data-view > div.info > div > h4").forEach((h4Element) => {
    let collectionPart = {};
    addPropertyVal(result, "collectionParts", collectionPart);

    addTrimmedPropertyNodeIfValid(collectionPart, "collectionHeading", h4Element);
    appendTrimmedPropertyListNodesIfValid(collectionPart, "collectionNameParts", h4Element.childNodes, cleanLabel);
    appendTrimmedPropertyListNodesIfValid(
      collectionPart,
      "collectionNameParts",
      h4Element.querySelector(":scope a")?.childNodes,
    );
  });

  if (isHeadingForValidTarget(result, article.querySelector(":scope div.data-view > div.info > div.heading > h1"))) {
    extractDataFromLeftViewColumn(result, article);
    extractDataFromRightViewColumn(result, article);
  }
}

function extractDataFromLeftViewColumn(result, article) {
  let leftViewColumn = article.querySelector(":scope div.data-view div.left-view-column");

  if (!leftViewColumn) return;

  // get only the top level lows of the left-view-column
  let columnRows = article.querySelectorAll(":scope div.data-view div.left-view-column > div.row");

  if (!columnRows.length) {
    return;
  }

  addPropertyVal(result, "recordData", {});
  addPropertyVal(result, "panelGroups", []);

  for (let row of columnRows) {
    let permanentIdSpan = row.querySelector(":scope #permanentId");
    if (permanentIdSpan) {
      addTrimmedPropertyNodeIfValid(result, "permanentId", permanentIdSpan);
    } else {
      let panelGroups = row.querySelectorAll(":scope div.panel-group");
      if (panelGroups.length) {
        for (let panelGroup of panelGroups) {
          let panelData = {};
          appendPropertyListVal(result, "panelGroups", panelData);
          addTrimmedPropertyNodeIfValid(
            panelData,
            "panelTitle",
            panelGroup.querySelector(":scope h4.panel-title"),
            cleanLabel,
          );

          // it could be a row with a single set of data or a list of people
          let dataItems = panelGroup.querySelectorAll(":scope div.panel-body div.data-item");
          // There are two tables the first is hidden and only contains headings
          if (dataItems.length) {
            // it is a list of people
            extractPeopleFromDataItems(panelData, dataItems);
          } else if (panelGroup.querySelector(":scope div.panel-body table.table")) {
            // it is a table of people
            extractPeopleFromTable(panelData, panelGroup);
          } else {
            extractLabelValuePairs(
              panelData,
              panelGroup.querySelectorAll(":scope div.panel-body > div.row > div > div.row"),
            );
          }
        }
      } else {
        // this is the main row
        extractLabelValuePairs(result.recordData, row.querySelectorAll(":scope div.row div.row"));
      }
    }
  }
}

function extractDataFromRightViewColumn(result, article) {
  let rightViewColumn = article.querySelector(":scope div.data-view div.right-view-column");

  if (rightViewColumn) {
    let title = rightViewColumn.querySelector(":scope h4.title");
    if (title) {
      addTrimmedPropertyNodeIfValid(result, "sourceInformation", title.nextElementSibling);
    }
    addPropertyVal(result, "sourceData", {});
    extractLabelValuePairs(result.sourceData, rightViewColumn.querySelectorAll(":scope div.row"));
  }
}

function isHeadingForValidTarget(result, headingElement) {
  if (headingElement) {
    addTrimmedPropertyNodeIfValid(result, "heading", headingElement);

    // also get the parts of the heading text, usually this is two spans and a text node
    appendTrimmedPropertyListNodesIfValid(result, "headingSpanParts", headingElement.querySelectorAll(":scope span"));
    appendTrimmedPropertyListNodesIfValid(result, "headingTextParts", headingElement.childNodes);

    let imageLinkElement = headingElement.nextElementSibling;
    if (imageLinkElement) {
      addPropertyValIfValid(result, "imageLink", imageLinkElement.getAttribute("href"));
    }
  }

  // check if the page represents a residence rather than a person
  if (!result.heading) {
    return false;
  }

  if (result.headingSpanParts?.length) {
    let startOfHeading = result.headingSpanParts[0];
    const invalidHeadingParts = [
      // en
      "Census district:",
      "Urban residence:",
      "Rural residence:",

      // bo
      "Tellingskrets:",
      "Bosted by:",
      "Bosted land:",

      // nn
      "Teljingskrets:",
      "Bustad by:",
      "Bustad land:",
    ];

    if (invalidHeadingParts.includes(startOfHeading)) {
      return false;
    }
  }

  return true;
}

export { extractData };
