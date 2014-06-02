var RD = RD || {};

(RD = function RD() {

        var MO = {
            buttonGetNames : document.getElementById('getNames'),
            startProps : document.getElementsByClassName('startProps')[0],
            startValues : document.getElementsByClassName('startValues')[0],
            finalValues : document.getElementsByClassName('values')[0],
            finalBeans : document.getElementsByClassName('beans')[0],
            finalProps : document.getElementsByClassName('properties')[0],
            myForm : document.getElementsByClassName('submitNames')[0],
            existsProps : document.getElementsByClassName('existedproperties')[0],
            forErrors: document.querySelector('.modal'),
            forWarning: document.getElementsByClassName('forWarning')[0],
            properties: {},
            regMinus : /^(.*-.*)$/,
            regAmpersand : /^.*&.*$/,
            regValue: /^\<value\>(\w)+\<\/value\>$/,
            regPropertyValueSecond: /[-_a-zA-Z0-9\/]*\/=([-_a-zA-Z0-9\s&u0000-uffff]+)$/,
            regPropertyFirstPart: /^([a-zA-Z]+)(\d*)/,
            regPropertyFirstPartPO: /^([a-zA-Z0-9]+)/,
            fragments : {
                fragmentExists : false,
                fragment : []
            },
            appendToFragment : function (node) {
                if (!this.fragments.fragmentExists) {
                    this.fragments.fragmentExists = true;
                    this.fragments.fragment = document.createDocumentFragment();
                }
                this.fragments.fragment.appendChild(node);
            }
        }
        PO = MO.properties;
        F = MO.fragments;

        function clearTextAreas () {
            MO.finalProps.value = "";
            MO.finalBeans.value = "";
            MO.finalValues.value = "";

        }
        function init(){
            PO = {};
            MO.forWarning.innerHTML = "";
        }

        function prepareProperties (properties) {
            var i = 0,
                temp = '',
                tempArr = [],
                tempVal;
            temp = properties.split("\n").toString().split(',');
            for (i; i < temp.length; i++) {
                tempArr[i] = temp[i];
            };
            return tempArr;
        }

        function createOneStringValue (arr) {
            var len = arr.length,
                str = '',
                strSplit = '',
                strSplitLen = 0;
            for (var i = 0; i < len; i += 1) {
                if (MO.regMinus.test(arr[i])) {
                    arr[i] = arr[i].replace('-','');
                }
                if (MO.regAmpersand.test(arr[i])) {
                    arr[i].substring(1,2).toUpperCase();
                    arr[i] = arr[i].replace('&','And');
                }
                if (arr[i].length > 0) {
                    str += arr[i].substring(0,1).toUpperCase();
                    str += arr[i].substring(1);
                }
            };
            return str;
        }

        function prepareValues (values) {
            var tempStr = '',
                i = 0;
                tempArr = [];
                tempStr = values.split("\n").toString().split(',');
            for (i; i < tempStr.length; i++) {
                tempArr[i] = createOneStringValue(tempStr[i].split(' '));
            };
            return tempArr;
        }

        function prepareExitedProperties (values) {
            var tempStr = '',
                i = 0;
                tempArr = [];
                tempStr = values.split("\n"),
                matchedStringValue = '',
                matchedStringProperty = '';
            for (i; i < tempStr.length; i += 1) {
                matchedStringValue = tempStr[i].match(MO.regPropertyValueSecond);
                matchedStringProperty = tempStr[i].match(MO.regPropertyFirstPartPO);
                PO[matchedStringProperty[1]] = convertCharStr2jEsc(matchedStringValue[1]);
            };
        }

        function makeBeans () {
            var result = [];
            for (var bean in PO) {
                result.push('<bean p:externalID="' + bean + '" class="com.bazaarvoice.prr.config.RatingDimension"/>' + "\n");
            }
            result.forEach(function (elem) {
                 MO.finalBeans.value += elem;
            });
        }

        function makeProps () {
            var result = [];
            for (var prop in PO) {
                result.push(prop + "/dimensionLabel1/=" + PO[prop] + "\n");
            }
            result.forEach(function (elem) {
                 MO.finalProps.value += elem;
            });
        }

        function makeValues () {
            var result = [];
            for (var val in PO) {
                result.push('<value>' + val + '</value>' + "\n");
            }
            result.forEach(function (elem) {
                 MO.finalValues.value += elem;
            });
        }

        function appendNodeToFragment (prop, val, message) {
            node = document.createElement('p');
            node.innerHTML = prop + message + val;
            MO.appendToFragment(node);
        }

        function getExistingValues(vals, props){
                var i = 0,
                propertyHasNumber,
                
                tempVal = '',
                lenProps = props.length,
                lengthOfArr,
                tempIndex,
                counter,
                fragment = '',
                existedObjectKeyWithoutNumber,
                lengthOfArr,
                existedObjectKeyContainsNumber,
                newObjectKeyWithoudNumber,
                existedObjectValue,
                newObjectValue;

                for (tempVal in PO) {

                    for (i = 0; i < lenProps; i++) {
                            existedObjectKeyWithoutNumber = tempVal.toLowerCase().match(MO.regPropertyFirstPart),
                            lengthOfArr = existedObjectKeyWithoutNumber.length-1,
                            existedObjectKeyContainsNumber = existedObjectKeyWithoutNumber[lengthOfArr],
                            newObjectKeyWithoudNumber = props[i].toLowerCase().match(MO.regPropertyFirstPart),
                            existedObjectValue = PO[tempVal],
                            newObjectValue = convertCharStr2jEsc(vals[i]);

                            if (existedObjectKeyWithoutNumber[1] === newObjectKeyWithoudNumber[1] &&
                                existedObjectValue === newObjectValue) {
                                appendNodeToFragment (existedObjectKeyWithoutNumber[1], PO[tempVal], ' - already exists with exists with the same value ');
                            } else if (existedObjectKeyWithoutNumber[1] !== newObjectKeyWithoudNumber[1] &&
                                existedObjectValue !== newObjectValue) {
                                if (typeof(existedObjectKeyContainsNumber) === 'number') {
                                    counter = ++existedObjectKeyContainsNumber;
                                    PO[props[i] + counter] = newObjectValue;
                                // } else {
                                //     PO[props[i] + 1] = newObjectValue;
                                }
                            } else if (existedObjectKeyWithoutNumber[1] === newObjectKeyWithoudNumber[1] &&
                                existedObjectValue !== newObjectValue) {
                                PO[props[i] + 1] = newObjectValue;
                                appendNodeToFragment (existedObjectKeyWithoutNumber[1], PO[tempVal], ' - already exists with exists with the same value, although has been added as' + (newObjectKeyWithoudNumber[1] + 1).toString());
                            } else if (existedObjectKeyWithoutNumber[1] !== newObjectKeyWithoudNumber[1] &&
                                existedObjectValue === newObjectValue) {
                                PO[props[i]] = newObjectValue;
                                appendNodeToFragment (newObjectKeyWithoudNumber[1], PO[tempVal], ' - there are some other key '+existedObjectKeyWithoutNumber[1].toString()+existedObjectKeyWithoutNumber[existedObjectKeyWithoutNumber.length-1]+' with this this value, however key has been added as ');
                            } else {
                                appendNodeToFragment ('Thats imposible', ', but you did it!', ' - good luck :-)');
                            }
                    } //for
                } // for in
                if (F.fragmentExists) {
                    MO.forWarning.appendChild(F.fragment);
                    MO.forErrors.style.display = "block";
                    MO.forErrors.style.height = window.outerHeight +"px";
                }
        }

        //dec2hex4 and convertCharStr2jEsc was taken from other site

        function  dec2hex4 ( textString ) {
            var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
            return hexequiv[(textString >> 12) & 0xF] + hexequiv[(textString >> 8) & 0xF] +
            hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
        }

        function convertCharStr2jEsc ( str, cstyle ) {
            // Converts a string of characters to JavaScript escapes
            // str: sequence of Unicode characters
            var highsurrogate = 0;
            var suppCP;
            var pad;
            var n = 0;
            var outputString = '';
            for (var i = 0; i < str.length; i++) {
                var cc = str.charCodeAt(i);
                if (cc < 0 || cc > 0xFFFF) {
                    outputString += '!Error in convertCharStr2UTF16: unexpected charCodeAt result, cc=' + cc + '!';
                    }
                if (highsurrogate != 0) { // this is a supp char, and cc contains the low surrogate
                    if (0xDC00 <= cc && cc <= 0xDFFF) {
                        suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00);
                        if (cstyle) {
                            pad = suppCP.toString(16);
                            while (pad.length < 8) { pad = '0'+pad; }
                            outputString += '\\U'+pad;
                            }
                        else {
                            suppCP -= 0x10000;
                            outputString += '\\u'+ dec2hex4(0xD800 | (suppCP >> 10)) +'\\u'+ dec2hex4(0xDC00 | (suppCP & 0x3FF));
                            }
                        highsurrogate = 0;
                        continue;
                        }
                    else {
                        outputString += 'Error in convertCharStr2UTF16: low surrogate expected, cc=' + cc + '!';
                        highsurrogate = 0;
                        }
                    }
                if (0xD800 <= cc && cc <= 0xDBFF) { // start of supplementary character
                    highsurrogate = cc;
                    }
                else { // this is a BMP character
                    //outputString += dec2hex(cc) + ' ';
                    switch (cc) {
                        case 0: outputString += '\\0'; break;
                        case 8: outputString += '\\b'; break;
                        case 9: outputString += '\\t'; break;
                        case 10: outputString += '\\n'; break;
                        case 13: outputString += '\\r'; break;
                        case 11: outputString += '\\v'; break;
                        case 12: outputString += '\\f'; break;
                        case 34: outputString += '\\\"'; break;
                        case 39: outputString += '\\\''; break;
                        case 92: outputString += '\\\\'; break;
                        default:
                            if (cc > 0x1f && cc < 0x7F) { outputString += String.fromCharCode(cc); }
                            else {
                                pad = cc.toString(16).toUpperCase();
                                while (pad.length < 4) { pad = '0'+pad; }
                                outputString += '\\u'+pad;
                                }
                        }
                    }
                }
            return outputString.toLowerCase();
            }

        MO.myForm.addEventListener("submit", function(event) {
            init();
            var vals = prepareValues(MO.startValues.value);
                props = prepareProperties(MO.startProps.value);
                prepareExitedProperties(MO.existsProps.value);
            getExistingValues(props, vals);
            clearTextAreas();
            makeProps();
            makeBeans();
            makeValues();
            event.preventDefault();
        });
        MO.forErrors.addEventListener("click", function (event){
            MO.forErrors.style.display = "none";
        });
}());