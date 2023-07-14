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

import { GeneralizedData } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "cwgc";

  let collectionId = undefined;

  if (!ed.success) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  result.recordType = RT.Memorial;

  if (ed.deathDate) {
    result.setEventDate(ed.deathDate);
  }

  result.setEventPlace(ed.cemeteryAddress);

  if (result.eventPlace) {
    result.eventPlace.streetAddress = ed.cemeteryName;
  }

  // Names, there should always be a firstName and lastName. MiddleNames my be undefined.
  result.setFullName(ed.fullName);
  const indexOfLastSpace = ed.fullName.lastIndexOf(" ");
  if (indexOfLastSpace > 0) {
    result.name.lastName = ed.fullName.substring(indexOfLastSpace + 1);
    result.name.forenames = ed.fullName.substring(0, indexOfLastSpace);
  }

  result.lastNameAtDeath = result.inferLastName();

  if (ed.ageAtDeath) {
    result.ageAtDeath = ed.ageAtDeath;
  }

  if (ed.deathDate) {
    result.setDeathDate(ed.deathDate);
  }

  // Collection
  if (collectionId) {
    result.collectionData = {
      id: collectionId,
    };
    if (ed.referenceVolume) {
      result.collectionData.volume = ed.referenceVolume;
    }
    if (ed.referencePage) {
      result.collectionData.page = ed.referencePage;
    }
  }

  result.hasValidData = true;

  //console.log("cwgc; generaliseData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData };
